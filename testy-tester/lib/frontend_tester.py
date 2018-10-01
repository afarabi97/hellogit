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
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.options import Options
from lib.util import get_controller
from lib.model.kickstart_configuration import KickstartConfiguration
from lib.model.node import Node
import time

def run_kickstart_configuration(kickstart_configuration: KickstartConfiguration, nodes: list, webserver_ip: str, port="80"):
    """
    Runs the frontend's kickstart configuration.
    """

    chrome_options = Options()
    #chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    #chrome_options.add_argument('--disable-dev-shm-usage')
    # TODO: Need to make this path not hardcoded
    browser = webdriver.Chrome('/home/assessor/selenium_testing/chromedriver', chrome_options=chrome_options)

    # Use selenium with beautiful soup to get the text from each of the examples
    browser.get("http://" + webserver_ip + ":" + port + "/kickstart")

    #html_source = browser.page_source
    #soup = BeautifulSoup(html_source, 'html.parser')
    #print(soup)

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
        logging.critical("Could not find the controller interface " + controller_interface + ". Exiting.")
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

            else:

                element = browser.find_element_by_name("Sensor" + index)
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
    #time.sleep(100)

def run_tfplenum_configuration(tfplenum_configuration: TfplenumConfiguration, nodes: list, webserver_ip: str, port="80"):
    print("test")
