#!/opt/tfplenum/web/tfp-env/bin/python

import json
import yaml
import subprocess
import sys
import os.path
from kubernetes import client, config

HOST_FILE = "/etc/dnsmasq_hosts/kube_hosts"
EXTERNAL_KUBE_DNS = "/etc/dnsmasq.d/20-kube-dns.conf"
DEPLOYER_INVENTORY = "/opt/tfplenum/deployer/playbooks/inventory.yml"

try:
    config.load_kube_config()
    kube_api = client.CoreV1Api()
except Exception as exc:
    print(str(exc))
    sys.exit(1)

def get_kit_domain():
    with open(DEPLOYER_INVENTORY) as file:
        inventory = yaml.load(file, Loader=yaml.FullLoader)
    return inventory["all"]["vars"]["kit_domain"]

KIT_DOMAIN = get_kit_domain()

def convert(svcs) -> list:
    svc_list = []
    for svc in svcs:
        svc_list.append("{} {}\n".format(svc["ip"], svc["name"]))
    return svc_list


def parse_current_hosts() -> list:
    current_list = []
    try:

        if not os.path.exists(HOST_FILE):
            open(HOST_FILE, "w")

        with open(HOST_FILE, 'r') as f:
            Lines = f.readlines()
            for line in Lines:
                ip, name = line.rstrip('\n').split(" ")
                current_list.append({ "name": name, "ip": ip })
    except Exception as exc:
        print(str(exc))
    return current_list


def get_svc() -> list:
    svc_list = []
    try:
        services = kube_api.list_service_for_all_namespaces()
        for service in services.items:
            name = service.metadata.name
            if "kube-dns-external" not in name and service.status.load_balancer.ingress:
                ip = service.status.load_balancer.ingress[0].ip
                svc_list.append({"name": "{}.{}".format(name, KIT_DOMAIN), "ip": ip})
    except Exception as exc:
        print(str(exc))
    return svc_list


def update_kube_hosts():
    curr = parse_current_hosts()
    kube_svcs = get_svc()
    if len(kube_svcs) > 0 and curr != kube_svcs:
        with open(HOST_FILE, 'w') as f:
            f.writelines(convert(kube_svcs))


def get_external_dns():
    service = kube_api.read_namespaced_service(name="kube-dns-external", namespace="kube-system")
    return service.status.load_balancer.ingress[0].ip


def update_dnsmasq_conf():
    external_dns_ip = get_external_dns()
    if not os.path.exists(EXTERNAL_KUBE_DNS):
        open(EXTERNAL_KUBE_DNS, "w")
    with open(EXTERNAL_KUBE_DNS, 'r') as org_file:
        if external_dns_ip not in org_file.read():
            with open(EXTERNAL_KUBE_DNS, 'w') as config_file:
                config_file.write("server=/cluster.local/{}\n".format(external_dns_ip))
            subprocess.Popen('systemctl restart dnsmasq', shell=True)


if __name__ == "__main__":
    update_kube_hosts()
    update_dnsmasq_conf()
