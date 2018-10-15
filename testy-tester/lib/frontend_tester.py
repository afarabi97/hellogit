# yum install -y python34
# yum install -y python34-pip
# pip install selenium beautifulsoup4
# chromedriver from: http://chromedriver.chromium.org/downloads

import yaml
import logging
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.options import Options
from lib.util import get_controller
from lib.model.kickstart_configuration import KickstartConfiguration
from lib.model.node import Node
from lib.model.kit import Kit
import time

def _create_browser():
    """
    Creates a web browser which the test framework can use to interact with the frontend

    :returns (selenium.webdriver.chrome.webdriver.WebDriver): An instance of a Selenium web browser
    """
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--ignore-certificate-errors')
    #chrome_options.add_argument('--disable-dev-shm-usage')
    # TODO: Need to make this path not hardcoded
    browser = webdriver.Chrome('chromedriver', chrome_options=chrome_options)

    return browser


def run_kickstart_configuration(kickstart_configuration: KickstartConfiguration, nodes: list, webserver_ip: str, port="443") -> None:
    """
    Runs the frontend's kickstart configuration.

    :return:
    """

    browser = _create_browser()

    # Use selenium with beautiful soup to get the text from each of the examples
    browser.get("https://" + webserver_ip + ":" + port + "/kickstart")

    element = browser.find_element_by_name("dhcp_start")
    element.send_keys(kickstart_configuration.dhcp_start)

    element = browser.find_element_by_name("dhcp_end")
    element.send_keys(kickstart_configuration.dhcp_end)

    element = browser.find_element_by_name("gateway")
    element.send_keys(kickstart_configuration.gateway)

    element = browser.find_element_by_name("netmask")
    element.clear()
    element.send_keys(kickstart_configuration.netmask)

    element = browser.find_element_by_name("root_password")
    element.send_keys(kickstart_configuration.root_password)

    element = browser.find_element_by_name("re_password")
    element.send_keys(kickstart_configuration.root_password)

    try:
        element = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.NAME, "controller_interface")))
        element.click()
    except:
        logging.critical("Could not find the controller interface. Exiting.")
        exit(0)

    i = 0
    for node in nodes:

        if node.type == "controller":
            logging.debug("Skipping controller")
        else:

            index = str(i)

            element = browser.find_element_by_name("add_node")
            element.click()

            element = browser.find_element_by_name("node_type" + index)
            element.click()

            if node.type == "server" or node.type == "master-server":

                element = browser.find_element_by_name("Server" + index)
                element.click()

            elif node.type== "sensor":

                element = browser.find_element_by_name("Sensor" + index)
                element.click()
            else:
                element = browser.find_element_by_name("Remote Sensor" + index)
                element.click()

            element = browser.find_element_by_name("hostname" + index)
            element.clear()
            element.send_keys(node.hostname)

            element = browser.find_element_by_name("ip_address" + index)
            element.send_keys(node.management_interface.ip_address)

            element = browser.find_element_by_name("mac_address" + index)
            element.send_keys(node.management_interface.mac_address)

            element = browser.find_element_by_name("boot_drive" + index)
            element.send_keys(node.boot_drive)

            i = i + 1

    element = browser.find_element_by_name("execute_kickstart")
    element.click()

def run_tfplenum_configuration(kit_configuration: Kit, nodes: list, webserver_ip: str, port="443") -> None:

    browser = _create_browser() # type: selenium.webdriver.chrome.webdriver.WebDriver

    # Use selenium with beautiful soup to get the text from each of the examples
    browser.get("http://" + webserver_ip + ":" + port + "/kit_configuration")

    element = browser.find_element_by_name("sensor_storage_type") # type: selenium.webdriver.remote.webelement
    element.click()

    if kit_configuration.use_ceph_for_pcap:
        element = browser.find_element_by_name("Use Ceph clustered storage for PCAP")
        element.click()

        if kit_configuration.moloch_pcap_storage_percentage is not None:
            element = browser.find_element_by_name("moloch_pcap_storage_percentage")
            element.clear()
            element.send_keys(str(kit_configuration.moloch_pcap_storage_percentage))
    else:
        element = browser.find_element_by_name("Use hard drive for PCAP storage")
        element.click()

    if kit_configuration.elasticsearch_cpu_percentage is not None:
        element = browser.find_element_by_name("elastic_cpu_percentage")
        element.clear()
        element.send_keys(str(kit_configuration.elasticsearch_cpu_percentage))

    if kit_configuration.elasticsearch_ram_percentage is not None:
        element = browser.find_element_by_name("elastic_memory_percentage")
        element.clear()
        element.send_keys(str(kit_configuration.elasticsearch_ram_percentage))

    if kit_configuration.logstash_server_cpu_percentage is not None:
        element = browser.find_element_by_name("logstash_cpu_percentage")
        element.clear()
        element.send_keys(str(kit_configuration.logstash_server_cpu_percentage))

    if kit_configuration.logstash_replicas is not None:
        element = browser.find_element_by_name("logstash_replicas")
        element.clear()
        element.send_keys(str(kit_configuration.logstash_replicas))

    if kit_configuration.es_storage_space_percentage is not None:
        element = browser.find_element_by_name("elastic_storage_percentage")
        element.clear()
        element.send_keys(str(kit_configuration.es_storage_space_percentage))

    if kit_configuration.kafka_cpu_percentage is not None:
        element = browser.find_element_by_name("kafka_cpu_percentage")
        element.clear()
        element.send_keys(str(kit_configuration.kafka_cpu_percentage))

    element = browser.find_element_by_name("kubernetes_services_cidr")
    element.send_keys(str(kit_configuration.kubernetes_cidr))

    if kit_configuration.ideal_es_cpus_per_instance is not None or kit_configuration.es_cpu_to_memory_ratio_default is not None:

        element = browser.find_element_by_name("advanced_settings")
        actions = ActionChains(browser)
        actions.move_to_element(element).perform()
        element.click()

        if kit_configuration.ideal_es_cpus_per_instance is not None:
            element = browser.find_element_by_name("elastic_cpus_per_instance_ideal")
            actions = ActionChains(browser)
            actions.move_to_element(element).perform()
            element.clear()
            element.send_keys(str(kit_configuration.ideal_es_cpus_per_instance))

        if kit_configuration.es_cpu_to_memory_ratio_default is not None:
            element = browser.find_element_by_name("elastic_cpus_to_mem_ratio")
            actions = ActionChains(browser)
            actions.move_to_element(element).perform()
            element.clear()
            element.send_keys(str(kit_configuration.es_cpu_to_memory_ratio_default))

    x = 0 # type: int

    for home_net in kit_configuration.home_nets:
        element = browser.find_element_by_name("home_net" + str(x))
        element.send_keys(home_net)

        # This condition is to ensure when the add home net button is
        # clicked it doesn't add more home nets than we have
        if x < len(kit_configuration.home_nets) - 1:
            element = browser.find_element_by_name("add_home_net")
            element.click()
            x = x+1

    if kit_configuration.external_nets is not None:
        x = 0 # type: int

        for external_net in kit_configuration.external_nets:
            element = browser.find_element_by_name("external_net" + str(x))
            element.send_keys(external_net)

            # This condition is to ensure when the add home net button is
            # clicked it doesn't add more home nets than we have
            if x < len(kit_configuration.external_nets) - 1:
                element = browser.find_element_by_name("add_external_net")
                element.click()
                x = x+1

    if kit_configuration.moloch_cpu_percentage is not None:
        element = browser.find_element_by_name("moloch_cpu_percentage")
        element.clear()
        element.send_keys(str(kit_configuration.moloch_cpu_percentage))

    if kit_configuration.bro_cpu_percentage is not None:
        element = browser.find_element_by_name("bro_cpu_percentage")
        element.clear()
        element.send_keys(str(kit_configuration.bro_cpu_percentage))

    if kit_configuration.suricata_cpu_percentage is not None:
        element = browser.find_element_by_name("suricata_cpu_percentage")
        element.clear()
        element.send_keys(str(kit_configuration.suricata_cpu_percentage))

    if kit_configuration.zookeeper_cpu_percentage is not None:
        element = browser.find_element_by_name("zookeeper_cpu_percentage")
        element.clear()
        element.send_keys(str(kit_configuration.zookeeper_cpu_percentage))

    server_index = 0 # type: int
    sensor_index = 0 # type: int

    for node in nodes:

        if node.type == "server" or node.type == "master-server":

            # The two lines below are necessary due to a bug in the Chromedriver. They don't do anything except bring
            # the gather facts button into view
            element = browser.find_element_by_name("host_server" + str(server_index))
            element.send_keys()

            element = browser.find_element_by_name("btn_host_server" + str(server_index))
            element.click()

            if node.type == "master-server":
                element = browser.find_element_by_name("is_master_server" + str(server_index))
                element.click()

            element = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.NAME, "ceph_drives_server" + str(server_index))))
            actions = ActionChains(browser)
            actions.move_to_element(element).perform()
            element.click()

            server_index = server_index + 1

        elif node.type == "sensor" or node.type == "remote-sensor":

            # The two lines below are necessary due to a bug in the Chromedriver. They don't do anything except bring
            # the gather facts button into view
            element = browser.find_element_by_name("host_sensor" + str(sensor_index))
            element.send_keys()

            element = browser.find_element_by_name("btn_host_sensor" + str(sensor_index))
            element.click()

            if kit_configuration.use_ceph_for_pcap and node.type == "sensor" or True: # TODO remove the true
                element = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.NAME, "ceph_drives_sensor" + str(sensor_index))))
                actions = ActionChains(browser)
                actions.move_to_element(element).perform()
                element.click()
            else:
                element = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.NAME, "pcap_drives" + str(sensor_index))))
                actions = ActionChains(browser)
                actions.move_to_element(element).perform()
                element.click()

            element = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.NAME, "monitor_interface" + str(sensor_index))))
            actions = ActionChains(browser)
            actions.move_to_element(element).perform()
            element.click()         

            sensor_index = sensor_index + 1

    element = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.NAME, "execute_kit")))
    actions = ActionChains(browser)
    actions.move_to_element(element).perform()
    element.click()

    time.sleep(500000000)
