import os
import re
import tempfile

from shutil import make_archive
from typing import Dict, List, Optional

from app.models import Model
from app.models.nodes import Node
from app.models.ruleset import RuleSetModel
from app.models.settings.kit_settings import KitSettingsForm
from app.service.socket_service import (NotificationCode, NotificationMessage,
                                        notify_ruleset_refresh)
from app.utils.collections import mongo_rule, mongo_ruleset
from app.utils.connection_mngs import (REDIS_CLIENT, FabricConnection,
                                       KubernetesWrapper)
from app.utils.constants import NODE_TYPES, RULE_TYPES, RULESET_STATES
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


def _get_pod_name(ip_address: str, component: str) -> str:
    with KubernetesWrapper() as kube_apiv1:
        api_response = kube_apiv1.list_pod_for_all_namespaces(watch=False)
        for pod in api_response.to_dict()["items"]:
            if ip_address == pod["status"]["host_ip"]:
                try:
                    if component == pod["metadata"]["labels"]["component"]:
                        return pod["metadata"]["name"]
                except KeyError:
                    pass

    raise ValueError("Failed to find %s pod name." % component)


def get_suricata_pod_name(ip_address: str) -> str:
    return _get_pod_name(ip_address, "suricata")


def get_zeek_pod_name(ip_address: str) -> str:
    return _get_pod_name(ip_address, "zeek")


class RuleSyncError(Exception):
    def __init__(self, msg=""):
        super(RuleSyncError, self).__init__(msg)


class RuleSynchronization:
    def __init__(self):
        self.rule_sets = None  # type: List[Dict]
        self.notification = NotificationMessage(role="rulesync")

    def _send_notification(
        self, msg: str, status: str = NotificationCode.ERROR.name, exception: Optional[Exception] = None
    ):
        rq_logger.debug(msg)
        self.notification.set_status(status=status)
        self.notification.set_message(msg)
        self.notification.set_exception(exception)
        self.notification.post_to_websocket_api()

    def _is_sensor_in_ruleset(self, ip_address: str, rule_set: Dict) -> bool:
        if rule_set["sensors"] is None or len(rule_set["sensors"]) == 0:
            return False

        for sensor in rule_set["sensors"]:
            if sensor["management_ip"] == ip_address:
                return True
        return False

    def _clear_enabled_rulesets(self, nodes: List[Node]):
        ids_to_reset = []
        rq_logger.debug(
            f"_clear_enabled_rulesets | nodes | Type: {type(nodes)}")

        for node in nodes:
            if node.node_type != NODE_TYPES.sensor.value:
                continue

            ip_address = node.deviceFacts["default_ipv4_settings"]["address"]
            for rule_set in self._get_rulesets():
                if not self._is_sensor_in_ruleset(ip_address, rule_set):
                    continue

                try:
                    if rule_set["isEnabled"]:
                        ids_to_reset.append(rule_set["_id"])
                except KeyError:
                    self._send_notification("Failed to clear " + str(rule_set))

        mongo_ruleset().update_many(
            {"_id": {"$in": ids_to_reset}}, {"$set": {"sensor_states": []}}
        )

    def _build_suricata_rule_file(self, ip_address: str) -> tempfile.NamedTemporaryFile:
        rq_logger.info(
            "Building suricata rule file for {}.".format(ip_address))
        rules_file = tempfile.NamedTemporaryFile(mode="w", delete=False)
        for rule_set in self.rule_sets:
            if rule_set["appType"] != RULE_TYPES[0]:
                continue

            if not self._is_sensor_in_ruleset(ip_address, rule_set):
                continue

            if not rule_set["isEnabled"]:
                continue

            rules = mongo_rule().find({"rule_set_id": rule_set["_id"]})
            for rule in rules:
                try:
                    if rule["isEnabled"]:
                        rules_file.write(rule["rule"] + "\n")
                except KeyError as e:
                    self._send_notification(
                        "Failed to write suricata rule {} because it is missing {} field inside of the object.".format(
                            rule, str(e)
                        )
                    )

        rules_file.seek(0, os.SEEK_END)
        if rules_file.tell() == 0:
            rules_file.write("# No rulesets where enabled for this Sensor.")
        rules_file.close()
        return rules_file

    def _build_zeek_intel_file(self, ip_address: str) -> tempfile.NamedTemporaryFile:
        rq_logger.info("Building zeek intel file for {}.".format(ip_address))
        intel_file = tempfile.NamedTemporaryFile(mode="w", delete=False)
        for rule_set in self.rule_sets:
            if rule_set["appType"] != RULE_TYPES[2]:
                continue

            if not self._is_sensor_in_ruleset(ip_address, rule_set):
                continue

            if not rule_set["isEnabled"]:
                continue

            rules = mongo_rule().find({"rule_set_id": rule_set["_id"]})
            for rule in rules:
                try:
                    if rule["isEnabled"]:
                        intel_file.write(rule["rule"] + "\n")
                except KeyError as e:
                    self._send_notification(
                        "Failed to write Zeek intel {} because it is missing {} field inside of the object.".format(
                            rule, str(e)
                        )
                    )

        intel_file.seek(0, os.SEEK_END)
        if intel_file.tell() == 0:
            intel_file.write("# No rulesets where enabled for this Sensor.")
        intel_file.close()
        return intel_file

    def _build_zeek_signatures_file(
        self, ip_address: str
    ) -> tempfile.NamedTemporaryFile:
        rq_logger.debug(
            "Building zeek signatures file for {}.".format(ip_address))
        sigs_file = tempfile.NamedTemporaryFile(mode="w", delete=False)
        for rule_set in self.rule_sets:
            if rule_set["appType"] != RULE_TYPES[3]:
                continue

            if not self._is_sensor_in_ruleset(ip_address, rule_set):
                continue

            if not rule_set["isEnabled"]:
                continue

            rules = mongo_rule().find({"rule_set_id": rule_set["_id"]})
            for rule in rules:
                try:
                    if rule["isEnabled"]:
                        sigs_file.write(rule["rule"] + "\n")
                except KeyError as e:
                    self._send_notification(
                        "Failed to write Zeek signature {} because it is missing {} field inside of the object.".format(
                            rule, str(e)
                        )
                    )

        sigs_file.seek(0, os.SEEK_END)
        if sigs_file.tell() == 0:
            sigs_file.write("# No rulesets where enabled for this Sensor.")
        sigs_file.close()
        return sigs_file

    def _set_states(
        self, hostname: str, ip_address: str, statestr: str, app_type: str
    ) -> None:
        for rule_set in self.rule_sets:
            if rule_set["appType"] != app_type:
                continue

            if (
                self._is_sensor_in_ruleset(ip_address, rule_set)
                and rule_set["isEnabled"]
            ):
                state_obj = {"hostname": hostname, "state": statestr}
                ret_val = mongo_ruleset().update_one(
                    {"_id": rule_set["_id"]}, {
                        "$push": {"sensor_states": state_obj}}
                )  # type: UpdateResult
                if ret_val.modified_count == 0:
                    self._send_notification(
                        "Failed to update rule set ID {} with {}".format(
                            rule_set["_id"], str(state_obj)
                        )
                    )

    def _set_suricata_states(
        self, hostname: str, ip_address: str, statestr: str
    ) -> None:
        self._set_states(hostname, ip_address, statestr, RULE_TYPES[0])

    def _set_zeek_script_states(
        self, hostname: str, ip_address: str, statestr: str
    ) -> None:
        self._set_states(hostname, ip_address, statestr, RULE_TYPES[1])

    def _set_zeek_intel_states(
        self, hostname: str, ip_address: str, statestr: str
    ) -> None:
        self._set_states(hostname, ip_address, statestr, RULE_TYPES[2])

    def _set_zeek_signatures_states(
        self, hostname: str, ip_address: str, statestr: str
    ) -> None:
        self._set_states(hostname, ip_address, statestr, RULE_TYPES[3])

    def _get_suricata_pod_name(self, ip_address: str) -> str:
        with KubernetesWrapper() as kube_apiv1:
            api_response = kube_apiv1.list_pod_for_all_namespaces(watch=False)
            for pod in api_response.to_dict()["items"]:
                if (
                    ip_address == pod["status"]["host_ip"]
                    and "suricata" == pod["metadata"]["labels"]["component"]
                ):
                    return pod["metadata"]["name"]

        raise ValueError("Failed to find Suricata pod name.")

    def _sync_suricata_rulesets(
        self, fabric: Connection, ip_address: str, hostname: str
    ):
        try:
            suricata_pod_name = get_suricata_pod_name(ip_address)
        except ValueError as e:
            rq_logger.warn(str(e))
            self._send_notification(
                "Suricata is not installed on {}".format(hostname),
                NotificationCode.CANCELLED.name,
            )
            return

        rules_file = self._build_suricata_rule_file(ip_address)
        try:
            fabric.put(rules_file.name, SURICATA_RULESET_LOC)
        finally:
            os.remove(rules_file.name)

        try:
            self._run_cmd_or_raise(
                fabric, "kubectl delete pod %s" % suricata_pod_name)
            self._set_suricata_states(hostname, ip_address, RULESET_STATES[2])
            self._send_notification(
                "Successfully synchronized Suricata signatures for {}.".format(
                    hostname
                ),
                NotificationCode.DEPLOYED.name,
            )
        except RuleSyncError as e:
            self._set_suricata_states(hostname, ip_address, RULESET_STATES[3])
            self._send_notification(
                "Failed to synchronize Suricata signatures on pod {} on node {}".format(
                    suricata_pod_name, ip_address
                )
            )
            raise e

    def _run_cmd_or_raise(self, fabric: Connection, cmd: str):
        ret_val = fabric.run(cmd)
        if ret_val.return_code != 0:
            raise RuleSyncError("Failed to run %s" % cmd)

    def _convert_zeek_ruleset_name(self, name: str) -> str:
        return name.replace(" ", "_")

    def _convert_zeek_rule_name(self, name: str) -> str:
        pos = name.rfind(".zeek")
        if pos == -1:
            name = name + ".zeek"
        return name.replace(" ", "_")

    def _build_zeek_intel_scripts_file(self, ip_address: str):
        zeek_load_dir = tempfile.TemporaryDirectory()
        load_file_path = os.path.join(zeek_load_dir.name, "__load__.zeek")
        load_file = open(load_file_path, "w")
        for rule_set in self.rule_sets:
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
            for rule in rules:
                if not rule["isEnabled"]:
                    continue

                try:
                    rule_name = self._convert_zeek_rule_name(rule["ruleName"])
                    script_file = os.path.join(rule_set_dir, rule_name)
                    with open(script_file, "w") as sf:
                        sf.write(rule["rule"])
                    pos = rule_name.rfind(".")
                    load_file.write(
                        "@load custom/{}/{}\n".format(rule_set_name,
                                                      rule_name[0:pos])
                    )
                except KeyError as e:
                    self._send_notification(
                        "Failed to write Zeek script {} because it is missing {} field inside of the object.".format(
                            rule, str(e)
                        )
                    )
        load_file.seek(0, os.SEEK_END)
        if load_file.tell() == 0:
            load_file.write("# No scripts were enabled for this Sensor.")
        load_file.close()
        return zeek_load_dir

    def _sync_zeek_items(self, fabric: Connection, ip_address: str, hostname: str):
        rq_logger.info(
            f"Synchronizing Zeek scripts, intel, and signatures for {hostname}.")

        try:
            zeek_pod_name = get_zeek_pod_name(ip_address)
        except ValueError as e:
            rq_logger.warn(str(e))
            self._send_notification(
                "Zeek is not installed on {}".format(hostname),
                NotificationCode.CANCELLED.name,
            )
            return

        intel_file = self._build_zeek_intel_file(ip_address)
        fabric.put(intel_file.name, ZEEK_INTEL_PATH)
        os.remove(intel_file.name)

        sigs_file = self._build_zeek_signatures_file(ip_address)
        fabric.put(sigs_file.name, ZEEK_SIG_PATH)
        os.remove(sigs_file.name)

        scripts_dir = self._build_zeek_intel_scripts_file(ip_address)
        self._run_cmd_or_raise(fabric, "rm -rf {}/*".format(ZEEK_SCRIPTS_DIR))
        tmp_file = "/tmp/zeek_scripts.zip"
        make_archive("/tmp/zeek_scripts", "zip", scripts_dir.name)
        fabric.put(tmp_file, tmp_file)
        self._run_cmd_or_raise(
            fabric, "unzip /tmp/zeek_scripts.zip -d {}".format(
                ZEEK_SCRIPTS_DIR)
        )
        self._run_cmd_or_raise(
            fabric, "chmod 0744 {}".format(ZEEK_SCRIPTS_DIR))
        self._run_cmd_or_raise(fabric, "rm -rf {}".format(tmp_file))
        scripts_dir.cleanup()
        os.unlink(tmp_file)

        try:
            self._run_cmd_or_raise(
                fabric, "kubectl delete pod %s" % zeek_pod_name)
            self._set_zeek_intel_states(
                hostname, ip_address, RULESET_STATES[2])
            self._set_zeek_script_states(
                hostname, ip_address, RULESET_STATES[2])
            self._set_zeek_signatures_states(
                hostname, ip_address, RULESET_STATES[2])
            self._send_notification(
                "Successfully synchronized Zeek scripts, intel, and signatures for {}.".format(
                    hostname
                ),
                NotificationCode.DEPLOYED.name,
            )
        except RuleSyncError as e:
            self._set_zeek_intel_states(
                hostname, ip_address, RULESET_STATES[3])
            self._set_zeek_script_states(
                hostname, ip_address, RULESET_STATES[3])
            self._set_zeek_signatures_states(
                hostname, ip_address, RULESET_STATES[3])
            self._send_notification(
                "Failed to synchronize Zeek scripts, intel, and signatures rules on pod {} on node {}".format(
                    zeek_pod_name, ip_address
                )
            )
            raise e

    def _get_rulesets(self):
        self.rule_sets = list(mongo_ruleset().find({}))
        return self.rule_sets  # type: ignore

    def _clear_states(self, rule_sets: Optional[List[RuleSetModel]] = None) -> None:
        if rule_sets is None:
            rule_sets = self._get_rulesets()  # type: ignore
        else:
            # type: ignore
            [self._clear_state(ruleset) for ruleset in rule_sets]

    def _clear_state(self, rule_set: RuleSetModel.DTO) -> None:
        mongo_ruleset_id = rule_set["_id"]
        try:
            # Clear states incase remove node triggered
            mongo_ruleset().update_one({"_id": mongo_ruleset_id}, {
                "$set": {"sensor_states": []}})
            self._send_notification(
                f"Clear states for rule set ID {mongo_ruleset_id}", NotificationCode.COMPLETED.name)
        except Exception as exception:
            self._send_notification(
                f"Failed to clear states for rule set ID {mongo_ruleset_id}", NotificationCode.ERROR.name, exception)

    def _update_rule_set_states(self, rule_sets: List[RuleSetModel]) -> None:
        for rule_set in rule_sets:
            self._update_rule_set_state(rule_set)

    def _update_rule_set_state(self, rule_set: RuleSetModel.DTO) -> None:
        mongo_ruleset_id = rule_set["_id"]
        state = self._get_worse_state_from_sensor_states(rule_set)
        try:
            # Clear states incase remove node triggered
            mongo_ruleset().update_one(
                {"_id": mongo_ruleset_id}, {"$set": {"state": state}})

            rq_logger.info(
                "Setting ruleset state equal to worest sensor state: {}.".format(state))
        except Exception as exception:
            rq_logger.info(
                "Setting ruleset state equal to worest sensor state failed see exception below.")
            rq_logger.exception(exception)

    def _get_worse_state_from_sensor_states(self, rule_set: RuleSetModel.DTO) -> str:
        state = RULESET_STATES[2]
        if "sensor_states" in rule_set:
            for sensor_state in rule_set["sensor_states"]:
                if sensor_state["state"] == RULESET_STATES[3]:
                    state = RULESET_STATES[3]
                    break
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
        if node.node_type == NODE_TYPES.sensor.value and self._has_device_facts(node):
            return True
        return False

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

    def sync_all_rulesets(self, nodes, password: Optional[str] = None, before_action: Optional[object] = None):
        """
        sync_all_rulesets Handles synchronization state changes from IN_PROGRESS to FINISHED

        TODO: Refactor the nasty try-except hell we are in

        Args:
            nodes (_type_): list of nodes to process and sync their rulesets
            password (Optional[str], optional): The password to connect to the node. Defaults to None.
            before_action (Optional[object], optional): A function you wish to call before syncing begins. Defaults to None.
        """
        # Inform user the rule sync is now in progress
        self._send_notification(
            "Rule synchronization in progress.", NotificationCode.IN_PROGRESS.name)
        sync_errors = False
        if before_action:
            before_action()  # type: ignore

        password = [form.password for form in [
            KitSettingsForm.load_from_db()] if form != None and form.password != None][0]

        # TODO: Fix this very large problem
        for node in nodes:  # type: Node
            ip_address = node.deviceFacts["default_ipv4_settings"]["address"]
            hostname = node.deviceFacts["hostname"]
            with FabricConnection(ip_address, password) as fabric:
                try:
                    # TODO: Specify the exact types of errors we want to catch
                    self._sync_suricata_rulesets(
                        fabric, ip_address, hostname)
                except Exception as e:
                    sync_errors = True  # TODO: Get rid of this sync_errors variable
                    self._set_suricata_states(
                        hostname, ip_address, RULESET_STATES[3]
                    )
                    self._send_notification(
                        f"Failed to synchronize Suricata rules for {hostname}.", NotificationCode.ERROR.name, exception=e)

                try:
                    # TODO: Specify the exact types of errors we want to catch
                    self._sync_zeek_items(fabric, ip_address, hostname)
                except Exception as e:
                    # TODO: Get rid of this sync_errors variable
                    sync_errors = True  # TODO: Get rid of this sync_errors variable
                    self._send_notification(
                        f"Failed to synchronize Zeek scripts, intel, and signatures for {hostname}.", NotificationCode.ERROR.name, exception=e)
                    self._set_zeek_intel_states(
                        hostname, ip_address, RULESET_STATES[3]
                    )
                    self._set_zeek_script_states(
                        hostname, ip_address, RULESET_STATES[3]
                    )
                    self._set_zeek_signatures_states(
                        hostname, ip_address, RULESET_STATES[3]
                    )

                # TODO: Understand this
                # Need to update each rule set state to reflect the status of the sensors
                self._update_rule_set_states(self.rule_sets)

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
            self._send_notification(
                "Rule synchronization completed with errors!", NotificationCode.ERROR.name)
        else:
            self._send_notification(
                "Rule synchronization completed successfully!", NotificationCode.COMPLETED.name)

    def prepare_for_ruleset_sync(self, nodes: List[Node]):
        """
        prepare_for_ruleset_sync the first step in syncing the rulesets

        Puts the ruleset synchronization process in a STARTED state and calls self._clear_enabled_rulesets
        which performs these actions: Get Nodes, Get Password and Clears Each Nodes Enabled Rulesets

        Args:
            nodes (List[Node]): List of nodes that will have their enabled rulesets cleared
        """
        self._send_notification(
            "Rule synchronization started.", NotificationCode.STARTED.name)
        self._clear_enabled_rulesets(nodes)

    def sync_rulesets(self):
        """
        sync_rulesets performs the full action of syncing the rulesets against all syncable nodes

        TODO: State Machine that has STARTED -> IN_PROGRESS -> FINISHED
        """
        try:
            kit_nodes = [node for node in Node.load_all_from_db()
                         if self._can_sync(node)]

            self.prepare_for_ruleset_sync(kit_nodes)

            # (fix) finding/THISISCVAH-12535
            self.sync_all_rulesets(kit_nodes, before_action=self._clear_states)

        except (Exception, KeyError) as e:
            self._send_notification(
                f"Error of type: {type(e)} in sync_ruleset | Please confirm the results of your action | {e}", NotificationCode.ERROR.name, exception=e)


@job("default", connection=REDIS_CLIENT, timeout="30m")
def perform_rulesync():
    get_app_context().push()
    rs = RuleSynchronization()
    rs.sync_rulesets()
    notify_ruleset_refresh()
