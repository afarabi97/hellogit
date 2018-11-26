# yum install -y python34
# yum install -y python34-pip
# pip install selenium beautifulsoup4
# chromedriver from: http://chromedriver.chromium.org/downloads


import logging
import time
from datetime import datetime, timedelta
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from lib.model.kickstart_configuration import KickstartConfiguration
from lib.model.kit import Kit
from lib.connection_mngs import MongoConnectionManager


def _create_browser():
    """
    Creates a web browser which the test framework can use to interact with the frontend

    :returns (selenium.webdriver.chrome.webdriver.WebDriver): An instance of a Selenium web browser
    """
    chrome_options = Options()

    #chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--ignore-certificate-errors')
    # chrome_options.add_argument('--disable-dev-shm-usage')
    # TODO: Need to make this path not hardcoded
    browser = webdriver.Chrome(chrome_options=chrome_options, executable_path='/usr/local/bin/chromedriver')

    return browser


def _run_DHCP_settings_section(kickstart_configuration: KickstartConfiguration, browser) -> None:
    """
    Using selenium this fucntion test the elements in the DHCP Settings Section

    :returns:
    """
    element = browser.find_element_by_name("dhcp_start")
    element.send_keys(kickstart_configuration.dhcp_start)

    element = browser.find_element_by_name("dhcp_end")
    element.send_keys(kickstart_configuration.dhcp_end)


def _run_static_interface_settings_section(kickstart_configuration: KickstartConfiguration, browser) -> None:
    """
    Using selenium this fucntion test the elements in the Static Interface Settings Section

    :returns:
    """
    element = browser.find_element_by_name("gateway")
    element.send_keys(kickstart_configuration.gateway)

    element = browser.find_element_by_name("netmask")
    element.clear()
    element.send_keys(kickstart_configuration.netmask)


def _run_system_settings_section(root_password: str, browser) -> None:
    """
    Using selenium this fucntion test the elements in the System Settings Section

    :returns:
    """
    element = browser.find_element_by_name("root_password")
    element.send_keys(root_password)

    element = browser.find_element_by_name("re_password")
    element.send_keys(root_password)


def run_controller_interface_settings_section(nodes: list, browser) -> None:
    """
    Using selenium this fucntion test the elements in the Controller Interface Settings Section

    :returns:
    """
    try:
        i = 0
        for node in nodes:
            if node.type == "controller":
                element = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.NAME, "controller_interface_" + node.management_interface.ip_address)))
                element.click()
            else:
                logging.debug("Not a controller")
            i = i + 1
    except Exception as e:
        logging.exception(e)
        logging.critical("Could not find the controller interface. Exiting.")
        exit(0)


def _run_add_node_section(nodes: list, browser) -> None:
    """
    Using selenium this fucntion test the elements in the Add Node Section

    :returns:
    """
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

            elif node.type == "sensor":

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


def wait_for_mongo_job(job_name: str, mongo_ip: str, minutes_timeout: int):
    """
    Connects to a mongo database and waits for a specific job name to complete.

    Example record in mongo it is looking for:
    { "_id" : "Kickstart", "return_code" : 0, "date_completed" : "2018-11-27 22:24:07", "message" : "Successfully executed job." }

    :param job_name: The name of the job.
    :param mongo_ip: The IP Address of the mongo instance.
    :param timeout: The timeout in minutes.
    :return:
    """
    future_time = datetime.utcnow() + timedelta(minutes=minutes_timeout)
    with MongoConnectionManager(mongo_ip) as mongo_manager:
        while True:
            if future_time <= datetime.utcnow():
                logging.error("The {} took way too long.".format(job_name))
                exit(3)

            result = mongo_manager.mongo_last_jobs.find_one({"_id": job_name})
            if result:
                if result["return_code"] != 0:
                    logging.error(
                        "{name} failed with message: {message}".format(name=result["_id"], message=result["message"]))
                    exit(2)
                else:
                    logging.info("{name} Job completed successfully".format(name=job_name))
                break
            else:
                logging.info("Waiting for {} to complete sleeping 5 seconds then rechecking.".format(job_name))
                time.sleep(5)


def run_kickstart_configuration(kit: Kit, webserver_ip: str) -> None:
    """
    Runs the frontend's kickstart configuration.

    :param kit:
    :param webserver_ip:
    :return:
    """
    with MongoConnectionManager(webserver_ip) as mongo_manager:
        mongo_manager.mongo_kickstart.drop()
        mongo_manager.mongo_last_jobs.drop()

    kickstart_configuration = kit.kickstart_configuration
    nodes = kit.get_nodes()
    browser = _create_browser()
    try:
        # Use selenium with beautiful soup to get the text from each of the examples
        browser.get("https://" + webserver_ip + "/kickstart")

        # DHCP Settings Section
        _run_DHCP_settings_section(kickstart_configuration, browser)

        # Static Interface Settings Section
        _run_static_interface_settings_section(kickstart_configuration, browser)

        # System Settings Section
        _run_system_settings_section(kit.password, browser)

        # Controller Interface Settings Section
        run_controller_interface_settings_section(nodes, browser)

        # Add Node Section
        _run_add_node_section(nodes, browser)

        # Execute's Kickstart when all fields are configured
        element = browser.find_element_by_name("execute_kickstart")
        element.click()
        wait_for_mongo_job("Kickstart", webserver_ip, 30)
    finally:
        # will close out of the driver and allow for the process to be killed
        # if you wish to keep the browser up comment out this line
        browser.quit()


def run_global_setting_section(kit_configuration: Kit, browser) -> None:
    """
    Using selenium this fucntion test the elements in the Global Settings Section

    :returns:
    """
    element = browser.find_element_by_name("sensor_storage_type")
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


def run_total_sensor_resources_section(kit_configuration: Kit, browser) -> None:
    """
    Using selenium this fucntion test the elements in the Total Sensor Sesources Section

    :returns:
    """
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

    x = 0  # type: int

    for home_net in kit_configuration.home_nets:
        element = browser.find_element_by_name("add_home_net")
        element.click()

        element = browser.find_element_by_name("home_net" + str(x))
        element.send_keys(home_net)

        # This condition is to ensure when the add home net button is
        # clicked it doesn't add more home nets than we have
        if x < len(kit_configuration.home_nets) - 1:
            x += 1

    x = 0  # type: int

    if kit_configuration.external_nets is not None:
        for external_net in kit_configuration.external_nets:
            element = browser.find_element_by_name("add_external_net")
            element.click()

            element = browser.find_element_by_name("external_net" + str(x))
            element.send_keys(external_net)

            # This condition is to ensure when the add home net button is
            # clicked it doesn't add more home nets than we have
            if x < len(kit_configuration.external_nets) - 1:
                element = browser.find_element_by_name("add_external_net")
                element.click()
                x += 1

    # Loop through for all sensors, and click all the necessary buttons
    nodes = kit_configuration.get_nodes()
    i = 0
    for node in nodes:
        if node.type != "sensor" and node.type != "remote-sensor":
            continue

        try:
            # The two lines below are necessary due to a bug in the Chromedriver. They don't do anything except bring
            # the gather facts button into view
            element = browser.find_element_by_name("host_sensor" + str(i))
            element.send_keys()

            element = browser.find_element_by_name("btn_host_sensor" + str(i))
            element.click()

            if kit_configuration.use_ceph_for_pcap:
                for drive_name in node.ceph_drives:
                    ceph_drive_ident = "ceph_drives_sensor{sensor_index}_{drive_name}".format(sensor_index=str(i),
                                                                                              drive_name=drive_name)
                    element = WebDriverWait(browser, 10).until(
                        EC.presence_of_element_located((By.NAME, ceph_drive_ident)))
                    actions = ActionChains(browser)
                    actions.move_to_element(element).perform()
                    element.click()
            else:
                for drive_name in node.pcap_drives:
                    pcap_drive_ident = "pcap_drives{sensor_index}_{drive_name}".format(sensor_index=str(i),
                                                                                       drive_name=drive_name)
                    element = WebDriverWait(browser, 10).until(
                        EC.presence_of_element_located((By.NAME, pcap_drive_ident)))
                    actions = ActionChains(browser)
                    actions.move_to_element(element).perform()
                    element.click()
        except Exception as e:
            logging.exception(e)

        for iface_name in node.monitoring_ifaces:
            try:
                monitor_iface_ident = "monitor_interface{sensor_index}_{interface_name}".format(
                    sensor_index=str(i), interface_name=iface_name)
                element = WebDriverWait(browser, 10).until(
                    EC.presence_of_element_located((By.NAME, monitor_iface_ident)))
                actions = ActionChains(browser)
                actions.move_to_element(element).perform()
                element.click()
            except Exception as e:
                logging.exception(e)

        i += 1


def run_total_server_resources_section(kit_configuration: Kit, browser) -> None:
    """
    Using selenium this fucntion test the elements that in the Total Server Resources Section

    :returns:
    """
    # Gather facts on server

    nodes = kit_configuration.get_nodes()
    i = 0
    for node in nodes:
        if node.type == "master-server" or node.type == "server":
            # The two lines below are necessary due to a bug in the Chromedriver. They don't do anything except bring
            # the gather facts button into view
            element = browser.find_element_by_name("host_server" + str(i))
            element.send_keys()

            element = browser.find_element_by_name("btn_host_server" + str(i))
            element.click()

            if node.type == "master-server":
                element = browser.find_element_by_name("is_master_server" + str(i))
                element.click()

            for drive_name in node.ceph_drives:
                ceph_drive_ident = "ceph_drives_server{server_index}_{drive_name}".format(server_index=str(i),
                                                                                          drive_name=drive_name)
                element = WebDriverWait(browser, 10).until(
                    EC.presence_of_element_located((By.NAME, ceph_drive_ident)))
                actions = ActionChains(browser)
                actions.move_to_element(element).perform()
                element.click()
            i = i + 1


def run_execute_kit(browser) -> None:
    # Execute's Kickstart when all fields are configured
    element = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.NAME, "execute_kit")))
    actions = ActionChains(browser)
    actions.move_to_element(element).perform()
    element.click()

    currentdate = datetime.utcnow()
    # Right now there are no names on the frontend for this elements using xpath should be temporary until the frontend
    # elements are given a name.
    # input the current hour in utc time
    element = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.XPATH, '//*[@id="execute_kit_modal"]/div/div/form/div[2]/div[2]/app-time-picker/div/ngb-timepicker/fieldset/div/div[1]/input')))
    actions = ActionChains(browser)
    actions.move_to_element(element).perform()
    # element = browser.find_element_by_xpath('//*[@id="execute_kit_modal"]/div/div/form/div[2]/div[2]/app-time-picker/div/ngb-timepicker/fieldset/div/div[1]/input')
    element.send_keys(str(currentdate.hour))

    # input the current minutes in utc time
    element = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.XPATH, '//*[@id="execute_kit_modal"]/div/div/form/div[2]/div[2]/app-time-picker/div/ngb-timepicker/fieldset/div/div[3]/input')))
    actions = ActionChains(browser)
    actions.move_to_element(element).perform()
    element.send_keys(str(currentdate.minute))
    element.click()

    # input the current date
    element = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.NAME, 'date')))
    actions = ActionChains(browser)
    actions.move_to_element(element).perform()

    element.send_keys(str(currentdate.year) + '-' + str(currentdate.month) + '-' + str(currentdate.day))

    # clicks on the execute button
    # element = browser.find_element_by_xpath('//*[@id="execute_kit_modal"]/div/div/form/div[3]/button[2]')
    element = WebDriverWait(browser, 10).until(EC.presence_of_element_located((By.XPATH, '//*[@id="execute_kit_modal"]/div/div/form/div[3]/button[2]')))
    actions = ActionChains(browser)
    actions.move_to_element(element).perform()
    element.click()


def run_tfplenum_configuration(kit_configuration: Kit, webserver_ip: str, port="443") -> None:
    """
    Runs the frontend's kit configuration.

    :returns:
    """

    with MongoConnectionManager(webserver_ip) as mongo_manager:
        mongo_manager.mongo_kit.drop()
        mongo_manager.mongo_last_jobs.drop()

    browser = _create_browser()  # type: selenium.webdriver.chrome.webdriver.WebDriver
    try:
        # Use selenium with beautiful soup to get the text from each of the examples
        browser.get("https://" + webserver_ip + "/kit_configuration")
        run_global_setting_section(kit_configuration, browser)
        # Gather fact on sensor and server
        run_total_server_resources_section(kit_configuration, browser)
        run_total_sensor_resources_section(kit_configuration, browser)
        # Execute's Kickstart when all fields are configured
        run_execute_kit(browser)
        wait_for_mongo_job("Kit", webserver_ip, 60)
    finally:
        # will close out of the driver and allow for the process to be killed
        # if you wish to keep the browser up comment out this line
        browser.quit()
