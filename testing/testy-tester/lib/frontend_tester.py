import logging
import time

from datetime import datetime
from lib.connection_mngs import MongoConnectionManager
from lib.model.kickstart_configuration import KickstartConfiguration
from lib.model.kit import Kit
from lib.model.node import Node
from lib.util import zero_pad, get_node, wait_for_mongo_job, retry
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.webdriver import WebDriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver import DesiredCapabilities
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from typing import List


KICKSTART_ID = "kickstart_form"


class SeleniumRunner:
    """
    Super class that has common functionality that is shared between all Selenium runners.
    """

    def __init__(self, is_headless: bool, controller_ip: str):
        self._is_headless = is_headless
        self._browser = None
        self._controller_ip = controller_ip

    def _create_browser(self) -> WebDriver:
        """
        Creates a web browser which the test framework can use to interact with the frontend

        :param is_headless: Runs the browser in headless mode if its set to true.
        :returns (selenium.webdriver.chrome.webdriver.WebDriver): An instance of a Selenium web browser
        """
        chrome_options = Options()
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--ignore-certificate-errors')
        if self._is_headless:
            chrome_options.add_argument('--headless')
            chrome_options.add_argument("--allow-insecure-localhost")
            capabilities = DesiredCapabilities.CHROME.copy()
            capabilities['acceptSslCerts'] = True
            capabilities['acceptInsecureCerts'] = True
            browser = webdriver.Chrome(chrome_options=chrome_options,
                                       executable_path='/usr/local/bin/chromedriver',
                                       desired_capabilities=capabilities)
            return browser
        else:
            browser = webdriver.Chrome(chrome_options=chrome_options,
                                       executable_path='/usr/local/bin/chromedriver')
            return browser
        
    def _perform_send_keys(self, selector: str, value: str, locate_by=By.NAME):
        """
        Performs a send keys operation to an element and execute send_keys.

        :param selector: Id or name or css selector etc
        :param value: The value you want to fill the html element with.
        :param locate_by: By.NAME is the default
        :return:
        """
        element = WebDriverWait(self._browser, 10).until(EC.presence_of_element_located((locate_by, selector)))
        actions = ActionChains(self._browser)
        actions.move_to_element(element).perform()
        element.send_keys(value)
    
    def _perform_click_action(self, element_by_name: str, locate_by=By.NAME):
        element = WebDriverWait(self._browser, 10).until(
                                EC.presence_of_element_located((locate_by, element_by_name)))
        actions = ActionChains(self._browser)
        actions.move_to_element(element).perform()
        element.click()


class KickstartSeleniumRunner(SeleniumRunner):
    """
    This class is responsible for any functionality needed to run
    selenium tests on the Kickstart page of the frontend application.
    """

    def __init__(self, is_headless: bool, controller_ip: str):
        """
        Initializes the Selenium runner for the Kickstart page.

        :param is_headless: A boolean that indicates whether or not
                            a browser should run in headless or non headless mode.
        :param controller_ip: The controller IP Address that is hosting the frontend
        """
        super(KickstartSeleniumRunner, self).__init__(is_headless, controller_ip)

    def _run_static_interface_settings_section(self, kickstart_config: KickstartConfiguration) -> None:
        """
        Using selenium this method test the elements in the Static Interface Settings Section

        :param kickstart_config:
        :return:
        """
        element = self._browser.find_element_by_name("gateway")
        element.send_keys(kickstart_config.gateway)

        element = self._browser.find_element_by_name("netmask")
        element.clear()
        element.send_keys(kickstart_config.netmask)

    def _run_system_settings_section(self, root_password: str) -> None:
        """
        Using selenium this fucntion test the elements in the System Settings Section

        :returns:
        """
        element = self._browser.find_element_by_name("root_password")
        element.send_keys(root_password)

        element = self._browser.find_element_by_name("re_password")
        element.send_keys(root_password)

    def _run_controller_interface_settings_section(self, ctrl_node: Node) -> None:
        """
        Using selenium this fucntion test the elements in the Controller Interface Settings Section

        :param ctrl_node: The controller node from the Kit.
        :return:
        """
        try:
            self._perform_click_action("controller_interface_" + ctrl_node.management_interface.ip_address)
        except Exception as e:
            logging.exception(e)
            logging.critical("Could not find the controller interface. Exiting.")
            exit(0)

    def _add_node(self, index: int, node: Node):
        """
        Adds a node to the Kickstart configuration page.

        :param index:
        :param node:
        :return:
        """
        index = str(index)

        self._perform_click_action("add_node")
        element = self._browser.find_element_by_name("hostname" + index)
        element.clear()
        element.send_keys(node.hostname)

        element = self._browser.find_element_by_name("ip_address" + index)
        element.send_keys(node.management_interface.ip_address)

        element = self._browser.find_element_by_name("mac_address" + index)
        element.send_keys(node.management_interface.mac_address)

        element = self._browser.find_element_by_name("boot_drive" + index)
        element.clear()
        element.send_keys(node.boot_drive)

    def _run_add_node_section(self, nodes: List[Node]) -> None:
        """
        Using selenium this method test the elements in the Add Node Section

        :param nodes:
        :param browser:
        :return:
        """
        i = 0
        for node in nodes:

            if node.type == "controller":
                logging.debug("Skipping controller")
            else:
                self._add_node(i, node)
                i = i + 1

    def _execute_kickstart(self):
        """
        Execute's Kickstart when all fields are configured

        :return:
        """
        self._perform_click_action("execute_kickstart")

    def run_kickstart_configuration(self, kit: Kit) -> None:
        """
        Runs the frontend's kickstart configuration.

        :param kit: A Kit object that was transformed from the config file
        :param webserver_ip: The Ip address of the controller.
        :return:
        """
        with MongoConnectionManager(self._controller_ip) as mongo_manager:
            mongo_manager.mongo_kickstart.drop()
            mongo_manager.mongo_last_jobs.drop()

        kickstart_config = kit.kickstart_configuration
        nodes = kit.get_nodes()
        self._browser = self._create_browser()
        try:
            # Use selenium with beautiful soup to get the text from each of the examples
            self._browser.get("https://" + self._controller_ip + "/kickstart")
            # Static Interface Settings Section
            self._run_static_interface_settings_section(kickstart_config)
            # System Settings Section
            self._run_system_settings_section(kit.password)
            # Controller Interface Settings Section
            time.sleep(5)
            controller_node = get_node(kit)
            self._run_controller_interface_settings_section(controller_node)
            # Add Node Section
            self._run_add_node_section(nodes)
            time.sleep(5)
            self._execute_kickstart()
            wait_for_mongo_job("Kickstart", self._controller_ip, 30)
        finally:
            # will close out of the driver and allow for the process to be killed
            # if you wish to keep the browser up comment out this line
            self._browser.quit()

    def _remove_previous_add_node_entries(self, mongo_manager: MongoConnectionManager, kit: Kit):
        """
        Removes all previous add nodes from the Kickstart configuration.

        :param mongo_manager:
        :param kit:
        :return:
        """
        ret_val = mongo_manager.mongo_kickstart.find_one({"_id": KICKSTART_ID})
        if ret_val:
            nodes = kit.get_add_nodes()
            new_node_list = []
            for node in nodes:
                for compare_node in ret_val['payload']['nodes']:
                    if node.hostname != compare_node['hostname']:
                        new_node_list.append(compare_node)

            ret_val['payload']['nodes'] = new_node_list
            mongo_manager.mongo_kickstart.find_one_and_replace({"_id": KICKSTART_ID},
                                                               {"_id": KICKSTART_ID,
                                                                "payload": ret_val['payload']},
                                                               upsert=True)

    def run_kickstart_add_node(self, kit: Kit) -> None:
        """
        Runs the add node piece for selenium testing

        :param kit:
        :return:
        """
        self._browser = self._create_browser()
        with MongoConnectionManager(self._controller_ip) as mongo_manager:
            mongo_manager.mongo_last_jobs.drop()
            self._remove_previous_add_node_entries(mongo_manager, kit)

        try:
            self._browser.get("https://" + self._controller_ip + "/kickstart")
            time.sleep(10)
            index = len(kit.get_nodes()) - 1
            nodes = kit.get_add_nodes()
            for node in nodes:
                self._add_node(index, node)
                index += 1

            self._execute_kickstart()
            wait_for_mongo_job("Kickstart", self._controller_ip, 30)
        finally:
            self._browser.quit()


class KitSeleniumRunner(SeleniumRunner):

    def __init__(self, is_headless: bool, controller_ip: str):
        """
        Initializes the Selenium runner for the Kickstart page.

        :param is_headless: A boolean that indicates whether or not
                            a browser should run in headless or non headless mode.
        :param controller_ip: The controller IP Address that is hosting the frontend
        """
        super(KitSeleniumRunner, self).__init__(is_headless, controller_ip)    

    def _fill_out_server_node(self, index: int, node: Node):
        """
        Fills out a server in the server resources section of the Kit configuration page.

        :param index:
        :param node:
        :return:
        """
        if node.type not in Node.valid_server_types:
            raise TypeError("Invalid node type. It must be " + str(Node.valid_server_types))

        if node.type == "master-server":
            self._perform_click_action("is_master_server" + str(index))

        for drive_name in node.es_drives:
            es_drive_ident = "es_drives_server{server_index}_{drive_name}".format(server_index=str(index),
                                                                                  drive_name=drive_name)
            self._perform_click_action(es_drive_ident)    

    def _run_global_setting_section(self, kit: Kit) -> None:
        """
        Using selenium this fucntion test the elements in the Global Settings Section

        :returns:
        """        
        self._perform_click_action("kubernetes_services_cidrkube_dropdown")
        time.sleep(10)
        self._perform_click_action(kit.kubernetes_cidr + "kube_dropdown")        


    def _fill_out_sensor_node(self, index: int, node: Node):
        """
        Fills out a sensor node.

        :param index:
        :param node:
        :return:
        """
        if node.type not in Node.valid_sensor_types:
            raise TypeError("Invalid node type it must be " + str(Node.valid_sensor_types))

        try:
            # The two lines below are necessary due to a bug in the Chromedriver. They don't do anything except bring
            # the gather facts button into view

            try:
                for drive_name in node.es_drives:
                    es_drive_ident = "es_drives_sensor{sensor_index}_{drive_name}".format(sensor_index=str(index),
                                                                                              drive_name=drive_name)
                    self._perform_click_action(es_drive_ident)
            except:
                for drive_name in node.pcap_drives:
                    pcap_drive_ident = "pcap_drives{sensor_index}_{drive_name}".format(sensor_index=str(index),
                                                                                       drive_name=drive_name)
                    self._perform_click_action(pcap_drive_ident)
        except Exception as e:
            logging.exception(e)

        for interface in node.interfaces:
            if interface.monitoring_interface:
                try:
                    monitor_iface_ident = "monitor_interface{sensor_index}_{interface_name}".format(
                                           sensor_index=str(index), interface_name=interface.interface_name)
                    self._perform_click_action(monitor_iface_ident)
                except Exception as e:
                    logging.exception(e)    

    def _fill_out_global_IDS_settings(self, kit: Kit) -> None:
        """
        Using selenium this fucntion test the elements in the Total Sensor Sesources Section

        :returns:
        """
        x = 0  # type: int

        for home_net in kit.home_nets:
            self._perform_click_action("add_home_net")

            element = self._browser.find_element_by_name("home_net" + str(x))
            element.send_keys(home_net)

            # This condition is to ensure when the add home net button is
            # clicked it doesn't add more home nets than we have
            if x < len(kit.home_nets) - 1:
                x += 1

        x = 0  # type: int

        if kit.external_nets is not None:
            for external_net in kit.external_nets:
                self._perform_click_action("add_external_net")

                element = self._browser.find_element_by_name("external_net" + str(x))
                element.send_keys(external_net)

                # This condition is to ensure when the add home net button is
                # clicked it doesn't add more home nets than we have
                if x < len(kit.external_nets) - 1:
                    self._perform_click_action("add_external_net")
                    x += 1

    def _run_execute_kit(self) -> None:
        # Execute's Kickstart when all fields are configured
        self._perform_click_action("execute_kit")

        # clicks on the execute button
        time.sleep(10)
        self._perform_click_action("primary_btn_execute_kit_modal")

    def _run_execute_add_node(self) -> None:
        """
        Clicks the execute add node button on the form
        :return:
        """
        self._perform_click_action("execute_addnode")

    def _select_node_types(self, kit: Kit) -> None:
        index = 0
        for node in kit.nodes:
            # Ignore the controller node type here we only care about servers and sensors
            if node.type in Node.valid_server_types or node.type in Node.valid_sensor_types:
                self._perform_click_action("node_type" + str(index))
                if node.type == "server" or node.type == "master-server":
                    self._perform_click_action("Server" + str(index))
                    self._fill_out_server_node(index, node)
                elif node.type == "sensor":
                    self._perform_click_action("Sensor" + str(index))
                    self._fill_out_sensor_node(index, node)
                else:
                    self._perform_click_action("Sensor" + str(index))
                    self._perform_click_action("is_master_serveris_remote_" + str(index))
                    self._fill_out_sensor_node(index, node)
            
                index = index + 1

    def run_tfplenum_configuration(self, kit: Kit) -> None:
        """
        Runs the frontend's kit configuration.

        :param kit: A Kit object that was transformed from the config file
        :return:
        """
        with MongoConnectionManager(self._controller_ip) as mongo_manager:
            mongo_manager.mongo_kit.drop()
            mongo_manager.mongo_last_jobs.drop()

        self._browser = self._create_browser()  # type: WebDriver
        try:
            # Use selenium with beautiful soup to get the text from each of the examples
            self._browser.get("https://" + self._controller_ip + "/kit_configuration")
            # self._run_global_setting_section(kit)
            time.sleep(10)

            # Gather fact on sensor and server
            self._fill_out_global_IDS_settings(kit)
            self._select_node_types(kit)
            
            # Execute's Kickstart when all fields are configured
            self._run_execute_kit()
            wait_for_mongo_job("Kit", self._controller_ip, 60)
        finally:
            # will close out of the driver and allow for the process to be killed
            # if you wish to keep the browser up comment out this line
            self._browser.quit()

    def run_kit_add_node(self, kit: Kit):
        """
        Runs the add node test from the yml file.
        :param kit:
        :return:
        """
        # Run the Kit page side of this
        self._browser = self._create_browser()  # type: WebDriver
        try:
            self._browser.get("https://" + self._controller_ip + "/kit_configuration")
            server_index = len(kit.get_server_nodes())
            sensor_index = len(kit.get_sensor_nodes())

            for node in kit.get_add_nodes():
                if node.type in Node.valid_sensor_types:
                    self._fill_out_sensor_node(sensor_index,node)
                    sensor_index += 1
                elif node.type in Node.valid_server_types:
                    self._fill_out_server_node(server_index, node)
                    server_index += 1

            self._run_execute_add_node()
            wait_for_mongo_job("Add_Node", self._controller_ip, 30)
        finally:
            self._browser.close()
