from components.controller import check_controller_services
from components.kube import check_kubernetes
from components.elastic import check_elastic
from components.metrics import check_node_metrics
from datetime import date
import os
import time
import configparser

def get_version():
    config = configparser.ConfigParser()
    config.read("/etc/tfplenum/tfplenum.ini")
    return config["tfplenum"]["version"]

def collect_logs():
    tar_name = "tfplenum-logs-{}-{}.tar.gz".format(date.today(), get_version())
    os.system("mkdir -p /var/www/html/downloads > /dev/null 2>&1")
    os.system(f"tar -czvf /var/www/html/downloads/{tar_name} -C /var/log . > /dev/null 2>&1")
    print("=====> {} created in /var/www/html/downloads".format(tar_name))

def start_diagnostic():
    check_controller_services()
    kube = check_kubernetes()
    check_node_metrics(kube)
    check_elastic(kube)
    collect_logs()

if __name__ == '__main__':
    start_diagnostic()
