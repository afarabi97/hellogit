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

with open(sys.argv[1], 'r') as kit_schema:
    try:
        configuration = yaml.load(kit_schema)

        # Returns a list of kit objects
        kits = transform(configuration["kits"])  # type: List[Kit]

    except yaml.YAMLError as exc:
        print(exc)

chrome_options = Options()
#chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
#chrome_options.add_argument('--disable-dev-shm-usage')
browser = webdriver.Chrome('/home/assessor/selenium_testing/chromedriver', chrome_options=chrome_options)

# Use selenium with beautiful soup to get the text from each of the examples
browser.get("http://172.16.73.20:4200/kickstart")

#html_source = browser.page_source
#soup = BeautifulSoup(html_source, 'html.parser')
#print(soup)

element = browser.find_element_by_name("dhcp_start")
element.send_keys("172.16.70.5")

element = browser.find_element_by_name("dhcp_end")
element.send_keys("172.16.70.5")
