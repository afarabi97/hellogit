from app import celery
import io
import json
import logging
import os
import sys
import traceback

from app.service.socket_service import NotificationMessage, NotificationCode, notify_ruleset_refresh
from shared.connection_mngs import (FabricConnection, MongoConnectionManager,
                                 KubernetesWrapper, objectify)
from fabric.runners import Result
from fabric import Connection
from fabfiles import (KIT_ID, decode_password, KICKSTART_ID,
                      RULESET_STATES, NODE_TYPES, RULE_TYPES)
from fabfiles.utils import get_suricata_pod_name, get_bro_pod_name
from logging.handlers import RotatingFileHandler
from pymongo.results import UpdateResult
from typing import List, Dict


SURICATA_RULESET_LOC = "/opt/tfplenum/suricata/rules/suricata.rules"
BRO_CUSTOM_DIR = "/opt/tfplenum/zeek/scripts/"


class RuleSyncError(Exception):
    def __init__(self, msg=""):
        super(RuleSyncError, self).__init__(msg)


class RuleSynchronization():

    def __init__(self):
        self.rule_sets = None # type: List[Dict]
        self.mongo = None # type: MongoConnectionManager
        self.notification = NotificationMessage(role="rulesync")

    def _send_notification(self, msg: str, code: str = NotificationCode.ERROR.name):
        print(msg)
        self.notification.set_status(status=code)
        self.notification.set_message(msg)
        self.notification.post_to_websocket_api()

    def _is_sensor_in_ruleset(self, ip_address: str, rule_set: Dict) -> bool:
        if rule_set["sensors"] is None or len(rule_set["sensors"]) == 0:
            return False

        for sensor in rule_set["sensors"]:
            if sensor["management_ip"] == ip_address:
                return True
        return False

    def _clear_enabled_rulesets(self, kit: Dict):
        ids_to_reset = []
        for node in kit["form"]["nodes"]:
            if node["node_type"] != NODE_TYPES[1]:
                continue

            ip_address = node['deviceFacts']['default_ipv4_settings']['address']
            for rule_set in self.rule_sets:
                if not self._is_sensor_in_ruleset(ip_address, rule_set):
                    continue

                try:
                    if rule_set["isEnabled"]:
                        ids_to_reset.append(rule_set['_id'])
                except KeyError:
                    self._send_notification("Failed to clear " + str(rule_set))

        self.mongo.mongo_ruleset.update_many({'_id': {'$in': ids_to_reset}}, {'$set': {'state': []}})

    def _build_suricata_rule_file(self, ip_address: str) -> io.StringIO:
        print("Building suricata rule file for {}.".format(ip_address))
        rules_file = io.StringIO()
        for rule_set in self.rule_sets:
            if rule_set["appType"] != RULE_TYPES[0]:
                continue

            if not self._is_sensor_in_ruleset(ip_address, rule_set):
                continue

            if not rule_set["isEnabled"]:
                continue

            for rule in rule_set["rules"]:
                try:
                    if rule["isEnabled"]:
                        rules_file.write(rule["rule"] + "\n")
                except KeyError as e:
                    self._send_notification("Failed to write suricata rule {} because it is missing {} field inside of the object.".format(rule, str(e)))

        rules_file.seek(0, os.SEEK_END)
        if rules_file.tell() == 0:
            rules_file.write("# No rulesets where enabled for this Sensor.")
        return rules_file

    def _set_states(self,
                    hostname: str,
                    ip_address: str,
                    statestr: str,
                    app_type: str) -> None:
        for rule_set in self.rule_sets:
            if rule_set["appType"] != app_type:
                continue

            if self._is_sensor_in_ruleset(ip_address, rule_set) and rule_set["isEnabled"]:
                state_obj = {"hostname": hostname, "state": statestr}
                ret_val = self.mongo.mongo_ruleset.update_one({"_id": rule_set["_id"]}, {"$push": {"state": state_obj}}) # type: UpdateResult
                if ret_val.modified_count == 0:
                    self._send_notification("Failed to update rule set ID {} with {}".format(rule_set["_id"], str(state_obj)))

    def _set_suricata_states(self,
                    hostname: str,
                    ip_address: str,
                    statestr: str) -> None:
        self._set_states(hostname, ip_address, statestr, RULE_TYPES[0])

    def _set_bro_states(self,
                    hostname: str,
                    ip_address: str,
                    statestr: str) -> None:
        self._set_states(hostname, ip_address, statestr, RULE_TYPES[1])

    def _get_suricata_pod_name(self, ip_address: str) -> str:
        with KubernetesWrapper(self.mongo) as kube_apiv1:
            api_response = kube_apiv1.list_pod_for_all_namespaces(watch=False)
            for pod in api_response.to_dict()['items']:
                if ip_address == pod['status']['host_ip'] and 'suricata' == pod['metadata']['labels']['component']:
                    return pod['metadata']['name']

        raise ValueError("Failed to find Suricata pod name.")

    def _sync_suricata_rulesets(self, fabric: Connection, ip_address: str, hostname: str):
        try:
            suricata_pod_name = get_suricata_pod_name(ip_address, self.mongo)
        except ValueError as e:
            print(str(e))
            self._send_notification("Suricata is not installed on {}".format(hostname), NotificationCode.CANCELLED.name)
            return

        rules_file = self._build_suricata_rule_file(ip_address)
        fabric.put(rules_file, SURICATA_RULESET_LOC)
        try:
            self._run_cmd_or_raise(fabric, "kubectl delete pod %s" % suricata_pod_name)
            self._set_suricata_states(hostname, ip_address, RULESET_STATES[2])
            self._send_notification("Successfully synchronized Suricata signatures for {}.".format(hostname), NotificationCode.DEPLOYED.name)
        except RuleSyncError as e:
            self._set_suricata_states(hostname, ip_address, RULESET_STATES[3])
            self._send_notification("Failed to synchronize Suricata signatures on pod {} on node {}".format(suricata_pod_name, ip_address))
            raise e

    def _run_cmd_or_raise(self, fabric: Connection, cmd: str):
        ret_val = fabric.run(cmd)
        if ret_val.return_code != 0:
            raise RuleSyncError("Failed to run %s" % cmd)

    def _convert_bro_ruleset_name(self, name: str) -> str:
        return name.replace(' ', '_')

    def _convert_bro_rule_name(self, name: str) -> str:
        pos = name.rfind('.zeek')
        if pos == -1:
            name = name + '.zeek'
        return name.replace(' ', '_')

    def _sync_bro_rulesets(self, fabric: Connection, ip_address: str, hostname: str):
        try:
            bro_pod_name = get_bro_pod_name(ip_address, self.mongo)
        except ValueError as e:
            print(str(e))
            self._send_notification("Zeek is not installed on {}".format(hostname), NotificationCode.CANCELLED.name)
            return

        bro_load_file = io.StringIO()
        self._run_cmd_or_raise(fabric, "rm -rf %s/*" % BRO_CUSTOM_DIR)

        for rule_set in self.rule_sets:
            if rule_set["appType"] != RULE_TYPES[1]:
                continue

            if not rule_set["isEnabled"]:
                continue

            if not self._is_sensor_in_ruleset(ip_address, rule_set):
                continue

            rule_set_name = self._convert_bro_ruleset_name(rule_set['name'])
            rule_set_dir = "%s/%s" % (BRO_CUSTOM_DIR, rule_set_name)
            self._run_cmd_or_raise(fabric, "mkdir -p " + rule_set_dir)

            for rule in rule_set["rules"]:
                if not rule["isEnabled"]:
                    continue

                try:
                    bro_file = io.StringIO()
                    bro_file.write(rule['rule'])
                    bro_file.seek(0, os.SEEK_END)
                    rule_name = self._convert_bro_rule_name(rule['ruleName'])
                    bro_file_path = "%s/%s" % (rule_set_dir, rule_name)
                    fabric.put(bro_file, bro_file_path)
                    self._run_cmd_or_raise(fabric, "chmod 0744 %s" % bro_file_path)
                    # Append the load statement
                    pos = rule_name.rfind('.')
                    bro_load_file.write('@load custom/%s/%s\n' % (rule_set_name, rule_name[0:pos]))
                except KeyError as e:
                    self._send_notification("Failed to write Zeek script {} because it is missing {} field inside of the object.".format(rule, str(e)))

        bro_load_file.seek(0, os.SEEK_END)
        if len(bro_load_file.getvalue()) == 0:
            self._send_notification("Nothing to sync for bro rules.", NotificationCode.CANCELLED.name)
            return

        bro_load_file_path = "%s/__load__.zeek" % BRO_CUSTOM_DIR
        fabric.put(bro_load_file, bro_load_file_path)
        self._run_cmd_or_raise(fabric, "chmod 0744 %s" % bro_load_file_path)
        self._run_cmd_or_raise(fabric, "kubectl delete pod %s" % bro_pod_name)
        self._set_bro_states(hostname, ip_address, RULESET_STATES[2])
        self._send_notification("Successfully synchronized Zeek scripts for {}.".format(hostname), NotificationCode.DEPLOYED.name)

    def sync_rulesets(self):
        try:
            self.notification.set_status(status=NotificationCode.STARTED.name)
            self.notification.set_message("Rule synchronization started.")
            self.notification.post_to_websocket_api()

            with MongoConnectionManager() as mongo:
                self.mongo = mongo
                kit = self.mongo.mongo_kit.find_one({"_id": KIT_ID})
                kickstart_form = mongo.mongo_kickstart.find_one({"_id": KICKSTART_ID})
                password = decode_password(kickstart_form['form']['root_password'])
                self.rule_sets = list(self.mongo.mongo_ruleset.find({}))
                self._clear_enabled_rulesets(kit)


                self.notification.set_status(status=NotificationCode.IN_PROGRESS.name)
                self.notification.set_message("Rule synchronization in progress.")
                self.notification.post_to_websocket_api()
                for node in kit["form"]["nodes"]:
                    if node["node_type"] != NODE_TYPES[1]:
                        continue

                    ip_address = node['deviceFacts']['default_ipv4_settings']['address']
                    hostname = node['deviceFacts']['hostname']
                    with FabricConnection(ip_address, password) as fabric:
                        try:
                            print("Synchronizing Suricata signatures for {}.".format(hostname))
                            self._sync_suricata_rulesets(fabric, ip_address, hostname)
                        except Exception as e:
                            self._set_suricata_states(hostname, ip_address, RULESET_STATES[3])
                            self.notification.set_status(status=NotificationCode.ERROR.name)
                            self.notification.set_message("Failed to synchronize Suricata rules for {}.".format(hostname))
                            self.notification.set_exception(e)
                            self.notification.post_to_websocket_api()
                            traceback.print_exc()

                        try:
                            print("Synchronizing Bro scripts for {}.".format(hostname))
                            self._sync_bro_rulesets(fabric, ip_address, hostname)
                        except Exception as e:
                            self.notification.set_status(status=NotificationCode.ERROR.name)
                            self.notification.set_message("Failed to synchronize Bro scripts for {}.".format(hostname))
                            self.notification.set_exception(e)
                            self.notification.post_to_websocket_api()
                            self._set_bro_states(hostname, ip_address, RULESET_STATES[3])
                            traceback.print_exc()

            print("Synchronization Complete!")
            self.notification.set_status(status=NotificationCode.COMPLETED.name)
            self.notification.set_message("Rule synchronization complete successfully!")
            self.notification.post_to_websocket_api()
        except Exception as e:
            self.notification.set_status(status=NotificationCode.ERROR.name)
            self.notification.set_message("Unrecoverable error. This is really bad contact the programmers!")
            self.notification.set_exception(e)
            self.notification.post_to_websocket_api()
            traceback.print_exc()


@celery.task
def perform_rulesync():
    rs = RuleSynchronization()
    rs.sync_rulesets()
    notify_ruleset_refresh()
