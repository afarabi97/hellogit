from robot.libraries.BuiltIn import BuiltIn
from robot.api import logger
import requests
from robot.api.deco import library, keyword


@library(scope="SUITE", version="0.1")
class TFPlenumLibrary:
    CURRENT_USER_ENDPOINT = "/current_user"
    RULESETS_ENDPOINT = "/policy/ruleset"
    SENSOR_INFO_ENDPOINT = "/policy/sensor/info"
    ZEEK_CHART_STATUS_ENDPOINT = "/catalog/chart/zeek/status"
    SURICATA_CHART_STATUS_ENDPOINT = "/catalog/chart/suricata/status"
    EVERY_CHART_STATUS_ENDPOINT = "/catalog/charts/status"
    KIT_NODES_ENDPOINT = "/kit/nodes"

    def __init__(self):
        self.COLOR_HEADER = "\033[95m"
        self.COLOR_FAIL = "\033[91m"
        self.COLOR_ENDC = "\033[0m"
        self.COLOR_WARNING = "\033[93m"
        self.TOKEN = None
        self.HEADERS = None
        self.HOST = None
        self.BASE_API_URL = None
        self.ruleset_machine: RulesetMachine = None

    @staticmethod
    @keyword(name="Inject")
    def inject(template_string: str, *injections, replacement_pattern="~") -> str:
        """inject   injects text into the template string upon every occurrence of the replacement_pattern

        If there is more than 1 injection given, injections will be applied one at a time and the result
        of all the injections will be returned.

        Args:
            template_string (str): A string that will be used as a template.
            replacement_pattern (str, optional): The string pattern that will be replaced. Defaults to "~".

        Returns:
            str: The returned version of the template_string with all injections applied
        """
        print(
            f"TFPlenum Library | inject | Applying Injections To template_string {template_string} | Using replacement_pattern: {replacement_pattern}"
        )
        ret_string = template_string
        rcount = -1
        if len(injections) > 1:
            rcount = 1
        for injection in injections:
            ret_string = ret_string.replace(
                replacement_pattern, injection, rcount)
        print("TFPlenum Library | inject | Injection was successful!")
        print(
            f"TFPlenum Library | inject | The new string is {ret_string}\n\n")
        return ret_string

    @staticmethod
    @keyword(name="Convert Ruleset Key To Robot String")
    def machineKeyToRobotString(ruleset_type_key: str):
        robot_string = f"{' '.join(ruleset_type_key.split('_')).title()}s"
        if ruleset_type_key.lower() == "suricata":
            robot_string = ruleset_type_key.title()
        logger.console(
            f"TFPlenumLibrary | Convert Ruleset Key To Robot String | Returning {robot_string}"
        )
        return robot_string

    @keyword()
    def get_rulesets_state_machine(self, use_cached=True):
        """
        get_rulesets_state_machine

        Retrieves the underlying statemachine for rulesets. Query the server to
        generate the ruleset or use the state machine already cached in memory

        Args:
            use_cached (bool, optional):    Use the state machine in memory or send requests to generate a new one. Defaults to True.

        Returns:
            [RulesetMachine]: Rulesets state machine
        """
        if not self.ruleset_machine or not use_cached:
            ruleset_response = self.api_get_rulesets(jsonify=False)
            # sensors_response = self.api_get_sensor_info(jsonify=False)
            zeek_response = self.api_get_deployed_sensors(
                self.ZEEK_CHART_STATUS_ENDPOINT, jsonify=False
            )
            suricata_response = self.api_get_deployed_sensors(
                self.SURICATA_CHART_STATUS_ENDPOINT, jsonify=False
            )
            self.ruleset_machine = RulesetMachine(
                response_object=ruleset_response,
                zeek_response_object=zeek_response,
                suricata_response_object=suricata_response,
            )
            return self.ruleset_machine
        return self.ruleset_machine

    @keyword()
    def does_ruleset_exist(self, ruleset_type_key: str) -> bool:
        """
        does_ruleset_exist

        Check if a specific ruleset exists in the Ruleset State Machine

        Args:
            ruleset_type_key (str): The type of ruleset you are querying for. (Zeek Scripts, Zeek Signatures, Suricata)

        Returns:
            bool: True if the ruleset exists in the state machine. False if it doesn't
        """
        logger.console("Does Ruleset Exist\n_____________\n")
        exists = False

        logger.console(
            f"type(self.ruleset_machine): {type(self.ruleset_machine)}")
        logger.console(
            f"type(self.ruleset_machine.rulesets_state): {self.ruleset_machine.rulesets_state}"
        )
        if self.ruleset_machine and self.ruleset_machine.get(ruleset_type_key):
            exists = True
        return exists

    @keyword()
    def is_ruleset_field_synchronized(
        self, ruleset_type_key: str, key: str, target_state
    ):
        machine = self.get_rulesets_state_machine()
        is_synchronized, ret_target_state = machine.is_state_synchronized(
            ruleset_type_key, key, target_state
        )
        result = {"synced_state": is_synchronized,
                  "target_state": ret_target_state}
        return is_synchronized, result

    @keyword()
    def check_catalog_applications_for_state(self, *applications, expected_state="DEPLOYED"):
        """
        check_catalog_applications_for_state Use the api to check if the applications have reached the expected state

        Use the api to check if the applications have reached the expected state
        We evaluate only the applications that robot is trying to install
        This should run only once after you try install each app in the applications list


        # [full_app_item for full_app_item in json_response if full_app_item['nodes']]
        # [full_app_item for full_app_item in json_response if full_app_item['nodes']
        #     for n in full_app_item['nodes'] if n['status'] == 'DEPLOYED']
        # pending_applications = [full_app_item for full_app_item in json_response if full_app_item['nodes']
        #                         for n in full_app_item['nodes'] if n['status'] == 'PENDING INSTALL' and n['application'] in application_strings]
        # empty_applications = [full_app_item for full_app_item in json_response if full_app_item['nodes'] == [
        # ] and full_app_item['application'] in application_strings]
        # response_info_dict = {"status": False,
        #                       "deployed": deployed_applications}
        # Catastrophic failure because we tried to install but it didn't even attempt to install
        # if len(empty_applications) > 0:
        #     empty_app_names = [app_names['application'] for app_names in pending_applications]
        #     BuiltIn().fatal_error(msg=f"Installation has failed for the following applications: {empty_app_names}")
        # There are still some applications that have not deployed
        # if len([app['application'] for app in deployed_applications if app['application'] not in application_strings]) > 0:
        #     return response_info_dict
        # elif len(pending_applications) > 0:
        #     # There are still some applications that have not deployed
        #     return response_info_dict
        # else:
        #     response_info_dict['status'] = True
        #     return response_info_dict

        Args:
            expected_state (str, optional): _description_. Defaults to "DEPLOYED".

        Returns:
            dict: {status:bool, verified_applications:list}
        """
        assert expected_state == "DEPLOYED" or "PENDING INSTALL" or "NONE"
        assert applications
        application_strings = [x.lower() for x in applications]
        response = self.api_get_chart_statuses(jsonify=False)
        json_response = response.json()

        verified_applications = [full_app_item for full_app_item in json_response if full_app_item['nodes']
                                 for n in full_app_item['nodes'] if n['status'] == str(expected_state) and n['application'] in application_strings]

        if len(verified_applications) < len(application_strings) or len(verified_applications) > len(application_strings):
            return {"status": False, "verified": verified_applications}
        else:
            return {"status": True, "verified": verified_applications}

    @keyword
    def check_for_sensor_with_available_interface(self):
        """
        Uses the TFPlenum Backend API to look for a sensor that has an ingest
        interface available. This is necessary for installing certain PMO apps
        from the Catalog Page (Arkime, Suricata, Zeek).

        Returns:
            string: name of sensor with available ingest interface
        """
        response = self.api_get_kit_nodes_info(jsonify=False)
        json_response = response.json()

        for node in json_response:
            if node['node_type'].lower() == "sensor":
                sensor_name = node['hostname']
                for interface in node['deviceFacts']['interfaces']:
                    if interface['speed'] > -1 and not interface['ip_address']:
                        return sensor_name
        return None

    # API Calls (not to be used in robot tests directly)

    def api_get_current_user(self, jsonify=True):
        return self.execute_request(self.CURRENT_USER_ENDPOINT, jsonify=jsonify)

    def api_get_rulesets(self, jsonify=True):
        return self.execute_request(self.RULESETS_ENDPOINT, jsonify=jsonify)

    def api_get_sensor_info(self, jsonify=True):
        return self.execute_request(self.SENSOR_INFO_ENDPOINT, jsonify=jsonify)

    def api_get_deployed_sensors(self, endpoint, jsonify=True):
        return self.execute_request(endpoint, jsonify=jsonify)

    def api_get_chart_statuses(self, jsonify=True):
        return self.execute_request(self.EVERY_CHART_STATUS_ENDPOINT, jsonify=jsonify)

    def api_get_kit_nodes_info(self, jsonify=True):
        return self.execute_request(self.KIT_NODES_ENDPOINT, jsonify=jsonify)

    def execute_request(self, endpoint, request_type="GET", payload={}, jsonify=True):
        self._tfplenum_lib_test_setup()
        # TODO: Actully handle exceptions correctly
        try:
            request_type = request_type.upper()
            endpoint = endpoint.strip().lstrip("/")
            url = f"{self.BASE_API_URL}/{endpoint}"
            response = requests.request(
                request_type, url, headers=self.HEADERS, data=payload
            )
            response.raise_for_status()
        except:
            self._alogger("THERE WAS AN ERROR", endpoint, request_type)
        else:
            if jsonify:
                self._alogger(response.json(), endpoint, request_type)
                return response.json()
            self._alogger(response.text, endpoint, request_type)
            return response

    def _tfplenum_lib_test_setup(self):
        if not self.TOKEN:
            self.TOKEN = BuiltIn().get_variable_value(name="${API_TOKEN}")
            self.HOST = BuiltIn().get_variable_value(name="${HOST}")
            self.HEADERS = {"Authorization": f"Bearer {self.TOKEN}"}
            self.BASE_API_URL = f"http://{self.HOST}/api"

    def _alogger(self, msg, endpoint=None, request_type=None):
        if not endpoint:
            endpoint = ""
        else:
            if request_type:
                endpoint = f"{self.COLOR_ENDC}| {self.COLOR_HEADER}{request_type}  {endpoint}{self.COLOR_ENDC} "
            else:
                endpoint = f"{self.COLOR_ENDC}| {self.COLOR_HEADER}{endpoint}{self.COLOR_ENDC} "
        log_header = f"{self.COLOR_FAIL}API LIBRARY {endpoint}"
        log_message = f"{log_header} | {self.COLOR_WARNING} {msg} {self.COLOR_HEADER}{self.COLOR_ENDC}"
        logger.console(log_message)


class RulesetMachine:
    ZEEK_SCRIPTS_APP_TYPE = "Zeek Scripts"
    ZEEK_SIGNATURES_APP_TYPE = "Zeek Signatures"
    SURICATA_APP_TYPE = "Suricata"

    def __init__(
        self, response_object, zeek_response_object=None, suricata_response_object=None
    ):
        self.rulesets_state = self._populate(
            response_object, zeek_response_object, suricata_response_object
        )

    def get(self, key, default: dict = {}):
        logger.console(
            f"Retrieving the underlying ruleset_state for key: {key}")
        return self.rulesets_state.get(key, default)

    def is_state_synchronized(self, ruleset_type, key, target_state):
        isSynchronized = True
        ruleset = self.rulesets_state.get(ruleset_type)
        ret_target_state = target_state

        if ruleset:  # There is a ruleset with that type
            logger.console(
                f"\nThere is a ruleset with that type:  key {key}\n")
            val = ruleset.get(key)

            if key == "ruleset_state":
                logger.console(
                    f"\n\nINSIDE OF IF KEY == RULESET_STATE: key: {key}")
                # The state can be either ("Dirty", "Created", "Synced" or a List object)
                # isSynchronized = is_ruleset_state_field_synced(val, target_state)
                val_type = type(val).__name__
                if val_type == "list":  # has sensors with sensor states
                    for sensor in val:
                        if sensor["state"].lower() is not target_state.lower():
                            logger.console(
                                f'sensor["state"].lower() | {sensor["state"].lower()}'
                            )
                            isSynchronized = False
                else:  # has a string state (Dirty, Synced, Created)
                    logger.console(f"HAS A STRING STATE: {val}")
                    if val.lower() != target_state.lower():
                        isSynchronized = False
                return isSynchronized, ret_target_state
            elif (
                key == "ruleset_name"
                or key == "ruleset_clearance"
                or key == "ruleset_appType"
            ):
                if val.lower() != target_state.lower():
                    logger.console(
                        f"is_state_synchronized | Key: {key} | val.lower(): {val.lower()}"
                    )
                    logger.console(
                        f"is_state_synchronized | Key: {key} | target_state.lower(): {target_state.lower()}"
                    )
                    isSynchronized = False
            elif key == "ruleset_enabled":
                if val is not target_state:
                    isSynchronized = False
            elif key == "ruleset_sensors":
                # True = You DO want sensors Assigned
                # False = You DO NOT want sensors Assigned
                (
                    isSynchronized,
                    ret_target_state,
                ) = self._is_ruleset_sensors_field_synced(
                    ruleset["ruleset_deployed_sensors"],
                    assigned_sensors=val,
                    assign=target_state,
                )
        else:  # Ruleset Type Does not exist
            logger.console("NO RULESET WITH THAT TYPE EXISTS")

            if key == "ruleset_sensors":

                # True = You DO want sensors Assigned
                # False = You DO NOT want sensors Assigned
                available_sensors = self._get_all_available_sensors_by_type(
                    ruleset_type
                )

                (
                    isSynchronized,
                    ret_target_state,
                ) = self._is_ruleset_sensors_field_synced(
                    available_sensors, assigned_sensors=[], assign=target_state
                )

            elif key == "ruleset_enabled" and target_state:
                # The enabled state starts at True
                logger.console("New Rulesets start at an enabled=True state")
                logger.console(
                    "So, if your target_state is enabled=True then it is synchronized"
                )
                isSynchronized = True
            else:
                isSynchronized = False
        return isSynchronized, ret_target_state

    def _is_ruleset_sensors_field_synced(
        self, available_sensors, assigned_sensors, assign
    ):
        # TODO: Actually do some sensor calculation instead of count
        isSynchronized = True
        unsynced_sensors = []

        logger.console(f"ASSIGN AT THE BEGINNING: {assign}")

        if available_sensors and assigned_sensors:  # There are assigned sensors
            logger.console(
                f"AVAILABLE SENSORS | Length: {len(available_sensors)} | Sensors: {available_sensors}"
            )
            logger.console(
                f"ASSIGNED SENSORS | Length: {len(assigned_sensors)} | Sensors: {assigned_sensors}"
            )
            if len(assigned_sensors) != len(available_sensors) and assign:
                logger.console(
                    "Sensor Lengths Are NOT equal. All Sensors Must Be Assigned"
                )
                isSynchronized = False

                # I DO want sensors assigned to this ruleset
                # I need to return sensors that:
                # - (ARE IN available_sensors) AND (ARE NOT IN assigned_sensors)

                # unsynced_sensors: sensors that need to be clicked
                unsynced_sensors = [
                    x["hostname"]
                    for x in available_sensors
                    if x not in assigned_sensors
                ]

                logger.console(f"isSynchronized: {isSynchronized}")
                logger.console(f"unsynced_sensors: {unsynced_sensors}")

            elif len(assigned_sensors) != len(available_sensors) and not assign:
                logger.console(
                    "Sensor Lengths Are NOT equal. All Sensors Must NOT Be Assigned"
                )
                isSynchronized = False

                # I DO NOT want sensors assigned to this ruleset
                # I need to return sensors that:
                # - (ARE IN available_sensors) AND (ARE NOT IN assigned_sensors)

                # unsynced_sensors: sensors currently assinged that need to be unassigned
                unsynced_sensors = [x["hostname"] for x in assigned_sensors]
                logger.console(
                    f"\nI DO WANT SENSORS ASSIGNED | unsynced_sensors: {unsynced_sensors}\n"
                )

            elif len(assigned_sensors) == len(available_sensors) and not assign:
                logger.console(
                    "Sensor Lengths Are Equal. All Sensors Must NOT Be Assigned"
                )
                # Number of assigned and available sensors are EQUAL
                # WE DO NOT WANT THEM ASSIGNED THOUGH
                isSynchronized = False

                # If you DO NOT want to assign sensors
                # - return the sensors that are currently assigned
                unsynced_sensors = [x["hostname"] for x in assigned_sensors]
                logger.console(
                    f"I DO NOT WANT THEM ASSIGNED | isSynchronized: {isSynchronized}"
                )
                logger.console(
                    f"I DO NOT WANT THEM ASSIGNED | unsynced_sensors: {unsynced_sensors}"
                )
        elif available_sensors and not assigned_sensors:
            # There are available_sensors but no assigned sensors
            logger.console(
                f"AVAILABLE SENSORS | Length: {len(available_sensors)} | Sensors: {available_sensors}"
            )
            logger.console("NO ASSIGNED SENSORS")

            if assign:  # You want assigned sensors
                isSynchronized = False  # Sensors are not synced

                # Assign all of the available sensors to the ruleset
                unsynced_sensors = [x["hostname"] for x in available_sensors]

                logger.console(
                    f"I WANT THEM ASSIGNED | isSynchronized: {isSynchronized}"
                )
                logger.console(
                    f"I WANT THEM ASSIGNED | unsynced_sensors: {unsynced_sensors}"
                )
        else:
            pass
        return isSynchronized, unsynced_sensors

    def _get_all_available_sensors_by_type(self, ruleset_type_key) -> list:
        ret_sensors = []
        ruleset_type = ruleset_type_key.split("_")[0]
        all_deployed_sensors = self.rulesets_state.get("all_deployed_sensors")

        if all_deployed_sensors:
            ret_sensors = [
                x
                for x in all_deployed_sensors
                if x["application"].lower() == ruleset_type.lower()
            ]
        return ret_sensors

    def _populate(
        self, response_object, zeek_response_object=None, suricata_response_object=None
    ) -> dict:
        """_populate Internal method that populates the machines underlying dictionary

        Given a valid json ruleset response and an optional sensor info response from the api
        this method populates the underlying dictionary and changes the names of the fields
        to more accurately represent the state of the system of rulesets as a whole

        Args:
            response_object ([Request]): The API request from the /policy/rulesets endpoint

            sensor_response_object ([type], optional): The API request from the '/policy/sensor/info' endpoint. Defaults to None.

            zeek_response_object ([type], optional): The API request from the '/catalog/chart/zeek/status' endpoint. Defaults to None

            suricata_response_object ([type], optional): The API request from the '/catalog/chart/suricata/status' endpoint. Defaults to None
        Returns:
            [type]: [description]
        """
        rulesets_state = {}
        # This is updated for each appType
        rulesets_state["all_deployed_sensors"] = []

        for item in response_object.json():
            ruleset_dict = {
                "ruleset_id": item["_id"],
                "ruleset_appType": item["appType"],
                "ruleset_name": item["name"],
                "ruleset_clearance": item["clearance"],
                "ruleset_enabled": item["isEnabled"],
                "ruleset_sensors": item["sensors"],
                "ruleset_state": item["state"],
                "ruleset_deployed_sensors": [],
            }
            if item["appType"] == self.SURICATA_APP_TYPE and suricata_response_object:
                ruleset_dict[
                    "ruleset_deployed_sensors"
                ] = self._populate_deployed_sensors(suricata_response_object)
                rulesets_state["all_deployed_sensors"].extend(
                    ruleset_dict["ruleset_deployed_sensors"]
                )

            if (
                item["appType"] == self.ZEEK_SCRIPTS_APP_TYPE
                or item["appType"] == self.ZEEK_SIGNATURES_APP_TYPE
                and zeek_response_object
            ):
                ruleset_dict[
                    "ruleset_deployed_sensors"
                ] = self._populate_deployed_sensors(zeek_response_object)
                rulesets_state["all_deployed_sensors"].extend(
                    ruleset_dict["ruleset_deployed_sensors"]
                )
            if (
                item["appType"] == self.SURICATA_APP_TYPE
                and item["name"] == "Emerging Threats"
            ):
                rulesets_state["suricata"] = ruleset_dict
            elif (
                item["appType"] == self.ZEEK_SCRIPTS_APP_TYPE
                and item["name"] == "Zeek Sample Scripts"
            ):
                rulesets_state["zeek_script"] = ruleset_dict
            elif (
                item["appType"] == self.ZEEK_SIGNATURES_APP_TYPE
                and item["name"] == "Zeek Integration Test Sample"
            ):
                rulesets_state["zeek_signature"] = ruleset_dict

        return rulesets_state

    def _populate_deployed_sensors(self, response_object) -> list:
        deployed_sensors: list = []
        if response_object:
            for item in response_object.json():
                if item["status"] == "DEPLOYED" and item["node_type"] == "Sensor":
                    logger.console(
                        f'Adding Sensor: {item["hostname"]} to deployed_sensors'
                    )
                    deployed_sensors.append(
                        {
                            "application": item["application"],
                            "hostname": item["hostname"],
                        }
                    )
            logger.console(
                f"_populate_deployed_sensors | deployed_sensors: {deployed_sensors}"
            )
        return deployed_sensors

    def __str__(self):
        return f"\033[93mRulesetMachine | \033[0mRuleset State Dictionary:\t{self.rulesets_state}"

    def __repr__(self):
        return self.__str__()
