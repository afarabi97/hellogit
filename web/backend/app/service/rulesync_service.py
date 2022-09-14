import os
import tempfile
from shutil import make_archive
from typing import List, Optional

from app.models.nodes import Node
from app.models.ruleset import RuleSetModel
from app.models.settings.kit_settings import KitSettingsForm
from app.service.socket_service import (NotificationCode, NotificationMessage,
                                        notify_ruleset_refresh)
from app.utils.collections import mongo_rule, mongo_ruleset
from app.utils.connection_mngs import (REDIS_CLIENT, FabricConnection,
                                       KubernetesWrapper)
from app.utils.constants import NODE_TYPES, RULE_TYPES, RULESET_STATES
from app.utils.kubernetes import get_suricata_pod_name, get_zeek_pod_name
from app.utils.logging import rq_logger
from app.utils.utils import get_app_context
from fabric import Connection
from pymongo.results import UpdateResult
from rq.decorators import job


SURICATA_RULESET_LOC = "/opt/tfplenum/suricata/rules/suricata.rules"
ZEEK_CUSTOM_DIR = "/opt/tfplenum/zeek/"
ZEEK_SCRIPTS_DIR = os.path.join(ZEEK_CUSTOM_DIR, "scripts/")
ZEEK_INTEL_PATH = os.path.join(ZEEK_CUSTOM_DIR, "intel.dat")
ZEEK_SIG_PATH = os.path.join(ZEEK_CUSTOM_DIR, "custom.sig")


class RuleSyncError(Exception):
    def __init__(self, msg="") -> None:
        super(RuleSyncError, self).__init__(msg)


class RuleSynchronization:
    def __init__(self) -> None:
        self.notification = NotificationMessage(role="rulesync")

    def _send_notification(self, msg: str, status: str = NotificationCode.ERROR.name, exception: Optional[Exception] = None) -> None:
        self.notification.set_status(status=status)
        self.notification.set_message(msg)
        self.notification.set_exception(exception)
        self.notification.post_to_websocket_api()

    def _run_cmd_or_raise(self, fabric: Connection, cmd: str) -> None:
        ret_val = fabric.run(cmd)
        if ret_val.return_code != 0:
            raise RuleSyncError(f"Failed to run {cmd}")

    def _get_rulesets(self) -> List[RuleSetModel]:
        return list(mongo_ruleset().find({}))

    def _sync_suricata_rulesets(self, fabric: Connection, ip_address: str, hostname: str) -> None:
        suricata_pod_name = None
        try:
            suricata_pod_name = get_suricata_pod_name(ip_address)
        except ValueError as value_error:
            rq_logger.exception(str(value_error))
            self._send_notification(f"Suricata != installed on {hostname}",
                                    NotificationCode.CANCELLED.name)
        finally:
            self._fabric_put_suricata_rules_file(fabric, ip_address)
            self._set_suricata_rulesets(fabric, ip_address, hostname, suricata_pod_name)


    def _fabric_put_suricata_rules_file(self, fabric: Connection, ip_address: str) -> None:
        rules_file = self._build_suricata_rule_file(ip_address)
        try:
            fabric.put(rules_file.name, SURICATA_RULESET_LOC)
        finally:
            os.remove(rules_file.name)

    def _build_suricata_rule_file(self, ip_address: str) -> tempfile.NamedTemporaryFile:
        rules_file = tempfile.NamedTemporaryFile(mode="w", delete=False)
        for rule_set in self._get_rulesets():
            if rule_set["appType"] != RULE_TYPES[0]:
                continue

            if not self._is_sensor_in_ruleset(ip_address, rule_set):
                continue

            if not rule_set["isEnabled"]:
                continue

            rules = mongo_rule().find({"rule_set_id": rule_set["_id"]})
            rules_list = list(mongo_rule().find({"rule_set_id": rule_set["_id"]}))

            if rule_set["isEnabled"] and len(rules_list) == 0:
                continue

            for rule in rules:
                try:
                    if rule["isEnabled"]:
                        rules_file.write(rule["rule"] + "\n")
                except KeyError as key_error:
                    rq_logger.exception(f"Failed to write suricata rule {rule} because it is missing {str(key_error)} field inside of the object.")
                    self._send_notification(f"Failed to write suricata rule {rule} because it is missing {str(key_error)} field inside of the object.",
                                            NotificationCode.ERROR.name,
                                            key_error)

        rules_file.seek(0, os.SEEK_END)
        if rules_file.tell() == 0:
            rules_file.write("# No rulesets where enabled for this Sensor.")
        rules_file.close()
        return rules_file

    def _set_suricata_rulesets(self, fabric: Connection, ip_address: str, hostname: str, suricata_pod_name: str) -> None:
        try:
            if suricata_pod_name is not None:
                self._run_cmd_or_raise(fabric, f"kubectl delete pod {suricata_pod_name}")
            self._set_suricata_states(hostname, ip_address, RULESET_STATES[2])
            self._send_notification(f"Successfully synchronized Suricata signatures for {hostname}.",
                                    NotificationCode.DEPLOYED.name)
        except RuleSyncError as rule_sync_error:
            rq_logger.exception(f"Failed to delete Suricata pod {suricata_pod_name} on node {ip_address}")
            self._send_notification(f"Failed to delete Suricata pod {suricata_pod_name} on node {ip_address}",
                                    NotificationCode.ERROR.name,
                                    rule_sync_error)
            raise RuleSyncError from rule_sync_error

    def _set_suricata_states(self, hostname: str, ip_address: str, statestr: str) -> None:
        self._set_states(hostname, ip_address, statestr, RULE_TYPES[0])

    def _sync_zeek_items(self, fabric: Connection, ip_address: str, hostname: str) -> None:
        zeek_pod_name = None
        try:
            zeek_pod_name = get_zeek_pod_name(ip_address)
        except ValueError as value_error:
            rq_logger.exception(str(value_error))
            self._send_notification(f"Zeek != installed on {hostname}",
                                    NotificationCode.CANCELLED.name)
        finally:
            self._fabric_put_zeek_scripts(fabric, ip_address)
            self._fabric_put_zeek_intel(fabric, ip_address)
            self._fabric_put_zeek_sigs(fabric, ip_address)
            self._set_zeek_items(fabric, ip_address, hostname, zeek_pod_name)

    def _zeek_scripts_folder_creation(self, fabric: Connection) -> None:
        try:
            self._run_cmd_or_raise(fabric, f"mkdir -p {ZEEK_SCRIPTS_DIR}")
        except RuleSyncError as rule_sync_error:
            rq_logger.exception(f"Failed to make zeek scripts directory")
            raise RuleSyncError from rule_sync_error

    def _fabric_put_zeek_scripts(self, fabric: Connection, ip_address: str) -> None:
        scripts_dir = self._build_zeek_scripts_file(ip_address)
        tmp_file = "/tmp/zeek_scripts.zip"
        try:
            self._run_cmd_or_raise(fabric, f"rm -rf {ZEEK_SCRIPTS_DIR}/*")
            make_archive("/tmp/zeek_scripts", "zip", scripts_dir.name)
            fabric.put(tmp_file, tmp_file)
            self._zeek_scripts_folder_creation(fabric)
        except RuleSyncError as rule_sync_error:
            rq_logger.exception(f"Failed to create Zeek scripts folder for ip address: {ip_address}")
            self._send_notification(f"Failed to create Zeek scripts folder for ip address: {ip_address}",
                                    NotificationCode.ERROR.name,
                                    rule_sync_error)
            raise RuleSyncError from rule_sync_error
        finally:
            self._unzip_zeek_scripts(fabric, ip_address, tmp_file)
            scripts_dir.cleanup()
            os.unlink(tmp_file)

    def _build_zeek_scripts_file(self, ip_address: str):
        zeek_load_dir = tempfile.TemporaryDirectory()
        load_file_path = os.path.join(zeek_load_dir.name, "__load__.zeek")
        load_file = open(load_file_path, "w")
        for rule_set in self._get_rulesets():
            if rule_set["appType"] != RULE_TYPES[1]:
                continue

            if not rule_set["isEnabled"]:
                continue

            if not self._is_sensor_in_ruleset(ip_address, rule_set):
                continue

            rule_set_name = self._convert_zeek_ruleset_name(rule_set["name"])
            rule_set_dir = os.path.join(zeek_load_dir.name, rule_set_name)
            os.mkdir(rule_set_dir)

            rules = mongo_rule().find({"rule_set_id": rule_set["_id"]})
            rules_list = list(mongo_rule().find({"rule_set_id": rule_set["_id"]}))

            if rule_set["isEnabled"] and len(rules_list) == 0:
                continue

            for rule in rules:
                if not rule["isEnabled"]:
                    continue

                try:
                    rule_name = self._convert_zeek_rule_name(rule["ruleName"])
                    script_file = os.path.join(rule_set_dir, rule_name)
                    with open(script_file, "w") as script_file_opened:
                        script_file_opened.write(rule["rule"])
                    pos = rule_name.rfind(".")
                    load_file.write(f"@load custom/{rule_set_name}/{rule_name[0:pos]}\n")
                except KeyError as key_error:
                    rq_logger.exception(f"Failed to write Zeek script {rule} because it is missing {str(key_error)} field inside of the object.")
                    self._send_notification(f"Failed to write Zeek script {rule} because it is missing {str(key_error)} field inside of the object.",
                                            NotificationCode.ERROR.name,
                                            key_error)
        load_file.seek(0, os.SEEK_END)
        if load_file.tell() == 0:
            load_file.write("# No scripts were enabled for this Sensor.")
        load_file.close()
        return zeek_load_dir

    def _convert_zeek_ruleset_name(self, name: str) -> str:
        return name.replace(" ", "_")

    def _convert_zeek_rule_name(self, name: str) -> str:
        pos = name.rfind(".zeek")
        if pos == -1:
            name = name + ".zeek"
        return name.replace(" ", "_")

    def _unzip_zeek_scripts(self, fabric: Connection, ip_address: str, tmp_file: str) -> None:
        try:
            self._run_cmd_or_raise(fabric, f"[[ -f {tmp_file} ]]")
        except RuleSyncError as rule_sync_error:
            rq_logger.exception(f"Failed to unzip Zeek scripts folder for ip address: {ip_address}")
            self._send_notification(f"Failed to unzip Zeek scripts folder for ip address: {ip_address}",
                                    NotificationCode.ERROR.name,
                                    rule_sync_error)
            raise RuleSyncError from rule_sync_error
        finally:
            self._run_cmd_or_raise(fabric, f"unzip /tmp/zeek_scripts.zip -d {ZEEK_SCRIPTS_DIR}")
            self._run_cmd_or_raise(fabric, f"chmod 0744 {ZEEK_SCRIPTS_DIR}")
            self._run_cmd_or_raise(fabric, f"rm -rf {tmp_file}")

    def _fabric_put_zeek_intel(self, fabric: Connection, ip_address: str) -> None:
        intel_file = self._build_zeek_intel_file(ip_address)
        try:
            fabric.put(intel_file.name, ZEEK_INTEL_PATH)
        finally:
            os.remove(intel_file.name)

    def _build_zeek_intel_file(self, ip_address: str) -> tempfile.NamedTemporaryFile:
        intel_file = tempfile.NamedTemporaryFile(mode="w", delete=False)
        for rule_set in self._get_rulesets():
            if rule_set["appType"] != RULE_TYPES[2]:
                continue

            if not self._is_sensor_in_ruleset(ip_address, rule_set):
                continue

            if not rule_set["isEnabled"]:
                continue

            rules = mongo_rule().find({"rule_set_id": rule_set["_id"]})
            rules_list = list(mongo_rule().find({"rule_set_id": rule_set["_id"]}))

            if rule_set["isEnabled"] and len(rules_list) == 0:
                continue

            for rule in rules:
                try:
                    if rule["isEnabled"]:
                        intel_file.write(rule["rule"] + "\n")
                except KeyError as key_error:
                    rq_logger.exception(f"Failed to write Zeek intel {rule} because it is missing {str(key_error)} field inside of the object.")
                    self._send_notification(f"Failed to write Zeek intel {rule} because it is missing {str(key_error)} field inside of the object.",
                                            NotificationCode.ERROR.name,
                                            key_error)

        intel_file.seek(0, os.SEEK_END)
        if intel_file.tell() == 0:
            intel_file.write("# No rulesets where enabled for this Sensor.")
        intel_file.close()
        return intel_file

    def _fabric_put_zeek_sigs(self, fabric: Connection, ip_address: str) -> None:
        sigs_file = self._build_zeek_signatures_file(ip_address)
        try:
            fabric.put(sigs_file.name, ZEEK_SIG_PATH)
        finally:
            os.remove(sigs_file.name)

    def _build_zeek_signatures_file(self, ip_address: str) -> tempfile.NamedTemporaryFile:
        sigs_file = tempfile.NamedTemporaryFile(mode="w", delete=False)
        for rule_set in self._get_rulesets():
            if rule_set["appType"] != RULE_TYPES[3]:
                continue

            if not self._is_sensor_in_ruleset(ip_address, rule_set):
                continue

            if not rule_set["isEnabled"]:
                continue

            rules = mongo_rule().find({"rule_set_id": rule_set["_id"]})
            rules_list = list(mongo_rule().find({"rule_set_id": rule_set["_id"]}))

            if rule_set["isEnabled"] and len(rules_list) == 0:
                continue

            for rule in rules:
                try:
                    if rule["isEnabled"]:
                        sigs_file.write(rule["rule"] + "\n")
                except KeyError as key_error:
                    rq_logger.exception(f"Failed to write Zeek signature {rule} because it is missing {str(key_error)} field inside of the object.")
                    self._send_notification(f"Failed to write Zeek signature {rule} because it is missing {str(key_error)} field inside of the object.",
                                            NotificationCode.ERROR.name,
                                            key_error)

        sigs_file.seek(0, os.SEEK_END)
        if sigs_file.tell() == 0:
            sigs_file.write("# No rulesets where enabled for this Sensor.")
        sigs_file.close()
        return sigs_file

    def _is_sensor_in_ruleset(self, ip_address: str, rule_set: RuleSetModel) -> bool:
        if rule_set["sensors"] is None or len(rule_set["sensors"]) == 0:
            return False

        for sensor in rule_set["sensors"]:
            if sensor["management_ip"] == ip_address:
                return True
        return False

    def _set_zeek_items(self, fabric: Connection, ip_address: str, hostname: str, zeek_pod_name: str) -> None:
        try:
            if zeek_pod_name is not None:
                self._run_cmd_or_raise(fabric, f"kubectl delete pod {zeek_pod_name}")
            self._set_zeek_script_states(hostname, ip_address, RULESET_STATES[2])
            self._set_zeek_intel_states(hostname, ip_address, RULESET_STATES[2])
            self._set_zeek_signatures_states(hostname, ip_address, RULESET_STATES[2])
            self._send_notification(f"Successfully synchronized Zeek scripts, intel, and signatures for {hostname}.",
                                    NotificationCode.DEPLOYED.name)
        except RuleSyncError as rule_sync_error:
            rq_logger.exception(f"Failed to delete Zeek pod {zeek_pod_name} on node {ip_address}")
            self._send_notification(f"Failed to delete Zeek pod {zeek_pod_name} on node {ip_address}",
                                    NotificationCode.ERROR.name,
                                    rule_sync_error)
            raise RuleSyncError from rule_sync_error

    def _set_zeek_script_states(self, hostname: str, ip_address: str, statestr: str) -> None:
        self._set_states(hostname, ip_address, statestr, RULE_TYPES[1])

    def _set_zeek_intel_states(self, hostname: str, ip_address: str, statestr: str) -> None:
        self._set_states(hostname, ip_address, statestr, RULE_TYPES[2])

    def _set_zeek_signatures_states(self, hostname: str, ip_address: str, statestr: str) -> None:
        self._set_states(hostname, ip_address, statestr, RULE_TYPES[3])

    def _set_states(self, hostname: str, ip_address: str, statestr: str, app_type: str) -> None:
        for rule_set in self._get_rulesets():
            rules_length = self._get_rule_set_rules_length(rule_set["_id"])
            # has at least one rule enabled
            has_a_rule_enabled = self._rules_enabled_check(rule_set["_id"])
            if rule_set["appType"] != app_type:
                continue
            if (self._is_sensor_in_ruleset(ip_address, rule_set) and rule_set["isEnabled"]):
                state_obj = None
                if rules_length == 0 or not has_a_rule_enabled:
                    state_obj = {"hostname": hostname, "state": RULESET_STATES[3]}
                else:
                    state_obj = {"hostname": hostname, "state": statestr}
                if self._check_sensor_states_for_state_obj(rule_set["_id"], state_obj):
                    ret_val = mongo_ruleset().update_one({"_id": rule_set["_id"]},
                                                        {"$push": {"sensor_states": state_obj}})  # type: UpdateResult
                    if ret_val.modified_count == 0:
                        self._send_notification(
                            "Failed to update rule set ID {} with {}".format(
                                rule_set["_id"], str(state_obj)
                            )
                        )

    def _clear_states(self) -> None:
        for rule_set in self._get_rulesets():
            self._clear_state(rule_set)

    def _clear_state(self, rule_set: RuleSetModel.DTO) -> None:
        mongo_ruleset_id = rule_set["_id"]
        try:
            # Clear states incase remove node triggered
            mongo_ruleset().update_one({"_id": mongo_ruleset_id},
                                       {"$set": {"sensor_states": []}})
            self._send_notification(f"Clear states for rule set ID {mongo_ruleset_id}",
                                    NotificationCode.COMPLETED.name)
        except Exception as exception:
            rq_logger.exception(f"mongo db update ruleset sensor state exception {str(exception)}")
            self._send_notification(f"Failed to clear states for rule set ID {mongo_ruleset_id}",
                                    NotificationCode.ERROR.name,
                                    exception)

    def _update_rule_set_states(self) -> None:
        for rule_set in self._get_rulesets():
            self._update_rule_set_state(rule_set)

    def _update_rule_set_state(self, rule_set: RuleSetModel.DTO) -> None:
        state = None
        try:
            mongo_ruleset_id = rule_set["_id"]
            rules_length = self._get_rule_set_rules_length(mongo_ruleset_id)
            state = self._get_worse_state_from_sensor_states(rule_set, rules_length)
            mongo_ruleset().update_one({"_id": mongo_ruleset_id},
                                       {"$set": {"state": state}})

            rq_logger.info(f"Setting ruleset state equal to worest sensor state: {state}.")
        except Exception as exception:
            rq_logger.info(f"Setting ruleset state equal to worest sensor state failed see exception below. {str(exception)}")
            rq_logger.exception(exception)

    def _get_rule_set_rules_length(self, rule_set_id: str) -> int:
        rules = list(mongo_rule().find({'rule_set_id': rule_set_id},
                                       projection={"rule": False}))
        return len(rules)

    def _rules_enabled_check(self, rule_set_id: str) -> bool:
        rules = list(mongo_rule().find({'rule_set_id': rule_set_id},
                                       projection={"rule": False}))
        rule_enabled = 0
        for rule in rules:
            if rule["isEnabled"]:
                rule_enabled += 1
        return rule_enabled > 0

    def _check_sensor_states_for_state_obj(self, rule_set_id: str, state_obj: str) -> bool:
        rule_set = mongo_ruleset().find_one({'_id': rule_set_id})
        if state_obj not in rule_set["sensor_states"]:
            return True
        return False

    def _get_worse_state_from_sensor_states(self, rule_set: RuleSetModel.DTO, rules_length: int) -> str:
        state = RULESET_STATES[2]
        if len(rule_set["sensor_states"]) > 0 and rules_length > 0:
            for sensor_state in rule_set["sensor_states"]:
                if sensor_state["state"] == RULESET_STATES[3]:
                    state = RULESET_STATES[3]
                    break
        else:
            state = RULESET_STATES[3]
        return state

    def _can_sync(self, node: Node) -> bool:
        """
        _can_sync checks if we processing this node when syncing rulesets.

        If the node is a valid sensor (is of type sensor and has deviceFacts defined) then we should
        process the node. The function will return True since we DO NOT want to skip processing.

        Args:
            node (Model): Node to check.

        Returns:
            bool: True if we should skip processing this node, False otherwise.
        """
        return (node.node_type == NODE_TYPES.sensor.value and self._has_device_facts(node))

    def _has_device_facts(self, node: Node) -> bool:
        """
        _has_device_facts checks if the node has device facts.

        This method also sends a warning to the User via notifications if deviceFacts is missing.
        This is usually caused due to improper handling of nodes in the database.

        Args:
            node (Node): A Node object

        Returns:
            bool: True if the node has device facts, False otherwise
        """
        if not node.deviceFacts:
            device_facts_warning = f"Node {node.hostname} is missing deviceFacts. Has {node.hostname} been properly removed from the cluster?"
            rq_logger.warning(device_facts_warning)
            self.notification.set_message(device_facts_warning)
            self.notification.post_to_websocket_api()
            return False
        return True

    def sync_all_rulesets(self, nodes, password: Optional[str] = None) -> None:
        """
        sync_all_rulesets Handles synchronization state changes from IN_PROGRESS to FINISHED

        TODO: Refactor the nasty try-except hell we are in

        Args:
            nodes (_type_): list of nodes to process and sync their rulesets
            password (Optional[str], optional): The password to connect to the node. Defaults to None.
        """
        # Inform user the rule sync is now in progress
        self._send_notification("Rule synchronization in progress.",
                                NotificationCode.IN_PROGRESS.name)
        sync_errors = False
        password = [form.password for form in [KitSettingsForm.load_from_db()] if form is not None and form.password is not None][0]

        # TODO: Fix this very large problem
        for node in nodes:  # type: Node
            ip_address = node.deviceFacts["default_ipv4_settings"]["address"]
            hostname = node.deviceFacts["hostname"]
            with FabricConnection(ip_address, password) as fabric:
                try:
                    # TODO: Specify the exact types of errors we want to catch
                    self._sync_suricata_rulesets(fabric, ip_address, hostname)
                except Exception as exception:
                    rq_logger.exception(f"sync suricata rulesets exception {str(exception)}")
                    # TODO: Get rid of this sync_errors variable
                    sync_errors = True
                    self._set_suricata_states(hostname, ip_address, RULESET_STATES[3])
                    self._send_notification(f"Failed to synchronize Suricata rules for {hostname}.",
                                            NotificationCode.ERROR.name,
                                            exception)

                try:
                    # TODO: Specify the exact types of errors we want to catch
                    self._sync_zeek_items(fabric, ip_address, hostname)
                except Exception as exception:
                    rq_logger.exception(f"sync zeek items exception {str(exception)}")
                    # TODO: Get rid of this sync_errors variable
                    sync_errors = True  # TODO: Get rid of this sync_errors variable
                    self._set_zeek_script_states(hostname, ip_address, RULESET_STATES[3])
                    self._set_zeek_intel_states(hostname, ip_address, RULESET_STATES[3])
                    self._set_zeek_signatures_states(hostname, ip_address, RULESET_STATES[3])
                    self._send_notification(f"Failed to synchronize Zeek scripts, intel, and signatures for {hostname}.",
                                            NotificationCode.ERROR.name,
                                            exception)

                self._update_rule_set_states()

        # TODO: Get rid of this sync_errors variable
        self._send_sync_finished_notification(sync_errors)

    def _send_sync_finished_notification(self, sync_errors: bool) -> None:
        """
        _send_sync_finished_notification Sends the final notification in the syncing process

        Sends a Success or Error message depending on if there were errors that occurred during sync

        Args:
            sync_errors (bool): True if there were errors during sync, False if not
        """
        if sync_errors:
            self._send_notification("Rule synchronization completed with errors!",
                                    NotificationCode.ERROR.name)
        else:
            self._send_notification("Rule synchronization completed successfully!",
                                    NotificationCode.COMPLETED.name)

    def prepare_for_ruleset_sync(self) -> None:
        """
        prepare_for_ruleset_sync the first step in syncing the rulesets

        Puts the ruleset synchronization process in a STARTED state and calls self._clear_states
        which performs these actions: set every sensor states in db as []
        """
        self._send_notification("Rule synchronization started.",
                                NotificationCode.STARTED.name)
        self._clear_states()

    def sync_rulesets(self) -> None:
        """
        sync_rulesets performs the full action of syncing the rulesets against all syncable nodes

        TODO: State Machine that has STARTED -> IN_PROGRESS -> FINISHED
        """
        try:
            nodes = [node for node in Node.load_all_from_db()
                         if self._can_sync(node)] # type: List[Node]
            self.prepare_for_ruleset_sync()
            self.sync_all_rulesets(nodes)
        except (Exception, KeyError) as exception:
            rq_logger.exception(f"sync rulesets exception {str(exception)}")
            self._send_notification(f"Error of type: {type(exception)} in sync_ruleset | Please confirm the results of your action | {exception}",
                                    NotificationCode.ERROR.name,
                                    exception)


@job("default", connection=REDIS_CLIENT, timeout="30m")
def perform_rulesync() -> None:
    get_app_context().push()
    rule_synchronization = RuleSynchronization()
    rule_synchronization.sync_rulesets()
    notify_ruleset_refresh()
