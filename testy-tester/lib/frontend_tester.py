# yum install -y python34
# yum install -y python34-pip
# pip install selenium beautifulsoup4
# chromedriver from: http://chromedriver.chromium.org/downloads

import yaml
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.options import Options
from lib.util import get_controller
from lib.model.kickstart_configuration import KickstartConfiguration

def run_kickstart_configuration(kickstart_configuration: KickstartConfiguration, webserver_ip: str, port="80"):

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
    element.send_keys(kickstart_configuration.netmask)
