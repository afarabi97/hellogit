import os
import sys
from typing import List, Tuple
from diagnostic_util import parse_systemctl_show, run_command, add_spinner, tree_to_string, log_write
from constants import LOG_PATH
from time import sleep


CONTROLLER_SERVICES = [
        "tfplenum-backend.service", "redis.service", "mongod.service",
        "keycloak.service", "httpd.service", "shibd.service",
        "auditbeat.service", "dnsmasq.service",
        "system-rqworker.slice"
    ]

def get_service_state(name: str) -> Tuple[str, str, str]:
    state = None
    status = None
    load_state = None
    stdout, rtn_code = run_command("systemctl show {}".format(name))
    if rtn_code == 0 and stdout:
        results = parse_systemctl_show(stdout.split('\n'))
        if "ActiveState" in  results:
            state = results["ActiveState"]
        if "SubState" in  results:
            status = results["SubState"]
        if "LoadState" in results:
            load_state = results["LoadState"]
    return state, status, load_state

def get_service_logs(service):
    stdout, rtn_code = run_command("journalctl -u {}".format(service))
    if rtn_code == 0:
        log_write("{}/{}.log".format(LOG_PATH, service), stdout)

def check_services_status(service: str) -> Tuple[bool, dict]:
    sleep(0.2)
    return_text = None
    return_flag = True
    try:
        state, status, load_state = get_service_state(service)
        if load_state != "loaded":
            return_flag = False
            return_text = { "name": "{} service is not found".format(service)}
        if status != "running" and status != "active":
            return_flag = False
        if state != "active":
            return_flag = False
        if not return_flag:
            return_text = { "name": "{} service is {} and {}".format(service, state, status)}
            get_service_logs(service)
        return (return_flag, return_text)
    except:
        return (False, { "name": "Error checking {} service".format(service)})

@add_spinner
def check_controller_services():
    data = {"name": ""}
    services = []
    return_flag = True
    return_text = "All services are ready"
    for service in CONTROLLER_SERVICES:
        flag, text = check_services_status(service=service)
        if not flag:
            return_flag = False
            services.append(text)
    if len(services) > 0:
        data["children"] = services
        return_text = tree_to_string(data)
    return (return_flag, return_text)
