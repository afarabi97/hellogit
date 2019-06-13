import shutil
import traceback
import os

from app import celery, logger, PLAYBOOK_DIR, conn_mng
from app.service.socket_service import NotificationMessage, NotificationCode, notify_page_refresh
from app.service.job_service import AsyncJob
from app.service.job_service import run_command2
from bson import ObjectId
from datetime import datetime
from shared.constants import TARGET_STATES, DATE_FORMAT_STR
from pathlib import Path


_JOB_NAME = "agent"


def _run_deploy_cmd(cmd: str, notification: NotificationMessage, target_name: str, action: str) -> int:
    cwd_dir = str(PLAYBOOK_DIR)
    ret_val = ~0
    try:
        stdout = run_command2(cmd, working_dir=cwd_dir)
        print(stdout)

        #Return value stored in file results.txt
        result_filename = '{}/results.txt'.format(cwd_dir)
        with open(result_filename, 'r') as result_file:
            ret_val = int(result_file.readline())
        os.remove(result_filename)

        if ret_val == 0:
            return ret_val

        if ret_val == 0b1:
            msg = "%s failed to %s Sysmon for %s." % (_JOB_NAME.capitalize(), action, target_name)
        elif ret_val == 0b10:
            msg = "%s failed to %s Winlogbeat for %s." % (_JOB_NAME.capitalize(), action, target_name)
        elif ret_val == 0b11:
            msg = "%s failed to %s Sysmon and Winlogbeat for %s." % (_JOB_NAME.capitalize(), action, target_name)
        elif ret_val == 0b100:
            msg = "%s failed to %s Endgame for %s." % (_JOB_NAME.capitalize(), action, target_name)
        elif ret_val == 0b101:
            msg = "%s failed to %s Sysmon and Endgame for %s." % (_JOB_NAME.capitalize(), action, target_name)
        elif ret_val == 0b110:
            msg = "%s failed to %s Winlogbeat and Endgame for %s." % (_JOB_NAME.capitalize(), action, target_name)
        elif ret_val == 0b111:
            msg = "%s failed to %s Sysmon, Winlogbeat and Endgame for %s." % (_JOB_NAME.capitalize(), action, target_name)
        else:
            msg = "%s failed to %s for %s. Unknown reason" % (_JOB_NAME.capitalize(), action, target_name)
    except Exception as e:
        msg = '_run_deploy_cmd, Caught exception: {}'.format(e)
        print(msg)
        traceback.print_exc()

    notification.setMessage(msg)
    notification.setStatus(NotificationCode.ERROR.name)
    notification.post_to_websocket_api()

    return ret_val


def _update_windows_host_state(target_config_id: str, hostname: str, new_state: str):
    """
    { "_id" : ObjectId("5d10f8af8937267d139f804a"), "name" : "test", "domain_name" : "bc_domain.sil.local", "dns_server" : "172.16.72.250",
    "key_controller" : "win-16bm96c237f.bc_domain.sil.local", "admin_server" : "win-16bm96c237f.bc_domain.sil.local",
    "targets" : [ { "hostname" : "desktop-rgg1jbk", "state" : "Uninstalled", "last_state_change" : "" } ] }
    """
    dt_string = datetime.utcnow().strftime(DATE_FORMAT_STR)
    new_target = { "hostname" : hostname, "state" : new_state, "last_state_change" : dt_string }
    ret_val = conn_mng.mongo_windows_target_lists.update_one({"_id": ObjectId(target_config_id), "targets.hostname": hostname},
                                                             {"$set": {"targets.$": new_target }} )
    if ret_val.modified_count != 1:
        print("==Failed to update the state of the Windows host")
        print("Modified count: %s" % str(ret_val.modified_count))
        print("==END")


@celery.task
def perform_agent_deploy(deploy_command: str, target_name: str, target_config_id: str, action: str):
    ret_val = ~0
    try:
        notification = NotificationMessage(role=_JOB_NAME)
        notification.setMessage("%s %s for %s in progress." % (_JOB_NAME.capitalize(), action, target_name) )
        notification.setStatus(NotificationCode.IN_PROGRESS.name)
        notification.post_to_websocket_api()

        ret_val = _run_deploy_cmd(deploy_command, notification, target_name, action)
        if ret_val != 0:
            _update_windows_host_state(target_config_id, target_name, TARGET_STATES.error.value)
            return ret_val

        msg = "%s %s successfully completed for Windows host: %s." % (_JOB_NAME.capitalize(), action, target_name)
        notification.setMessage(msg)
        notification.setStatus(NotificationCode.COMPLETED.name)
        notification.post_to_websocket_api()

        if action == 'uninstall':
            _update_windows_host_state(target_config_id, target_name, TARGET_STATES.uninstalled.value)
        else:
            _update_windows_host_state(target_config_id, target_name, TARGET_STATES.installed.value)
    except Exception as e:
        print("perform_agent_deploy: caught exception: {}".format(e))
        traceback.print_exc()
        _update_windows_host_state(target_config_id, target_name, TARGET_STATES.error.value)
        ret_val = -1
    finally:
        notify_page_refresh()

    return ret_val
