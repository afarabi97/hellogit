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
        element = WebDriverWait(browser, 30).until(EC.presence_of_element_located((By.NAME, "controller_interface")))
        element.click()
    except:
        logging.critical("Could not find the controller interface " + controller_interface + ". Exiting.")
        exit(0)

    for i, node in enumerate(nodes, start=0):

        if node.type == "controller":
            logging.debug("Skipping controller")
        else:

            index = str(i)

            try:
                element = WebDriverWait(browser, 30).until(EC.presence_of_element_located((By.NAME, "add_node")))
                element.click()
            except:
                logging.critical("Could not click button Add Node")
                exit(0)

            try:
                element = WebDriverWait(browser, 30).until(EC.presence_of_element_located((By.NAME, "node_type" + index)))
                element.click()
            except:
                logging.critical("Could not click the button Node Type")
                exit(0)

            if node.type == "server" or node.type == "master-server":

                try:
                    element = WebDriverWait(browser, 30).until(EC.presence_of_element_located((By.NAME, "Server" + index)))
                    element.click()
                except:
                    logging.critical("Could not find the controller interface " + controller_interface + ". Exiting.")
                    exit(0)
            else:
                try:
                    element = WebDriverWait(browser, 30).until(EC.presence_of_element_located((By.NAME, "Sensor" + index)))
                    element.click()
                except:
                    logging.critical("Could not find the controller interface " + controller_interface + ". Exiting.")
                    exit(0)

            element = browser.find_element_by_name("hostname")
            element.clear()
            element.send_keys(node.hostname)

            time.sleep(10)
