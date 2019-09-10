from app import app, logger, conn_mng, UPGRADES_DIR, CORE_DIR, celery
from shared.connection_mngs import FabricConnection
from app.common import OK_RESPONSE, ERROR_RESPONSE, JSONEncoder
import requests
import os
import json
from app import version_controller
import subprocess
from app.inventory_generator import KitInventoryGenerator
from celery import chain, group, chord
from app.service.kickstart_service import perform_kickstart
from app.service.job_service import AsyncJob
from shared.constants import KICKSTART_ID, KIT_ID, DATE_FORMAT_STR
from app.inventory_generator import KitInventoryGenerator
from app.inventory_generator import KickstartInventoryGenerator
import os
from app.service.socket_service import NotificationMessage, NotificationCode

_JOB_NAME = "upgrade"
_MESSAGETYPE_PREFIX = "upgrade"

def get_upgrade_paths(original_controller_ip: str) -> list:
    """
    Returns a list of compatible upgrades

    :param original_controller_ip: original_controller_ip
    : return (list): Returns a list of upgrades
    """

    local_version_json = version_controller.get_version().json
    if "version" in local_version_json:
        local_version = local_version_json["version"]

    version_response = requests.get('https://' + original_controller_ip + '/api/version', verify=False)
    try:
        version_response.raise_for_status()
    except requests.exceptions.HTTPError as err:
        return err

    upgrades = [ name for name in os.listdir(UPGRADES_DIR) if os.path.isdir(os.path.join(UPGRADES_DIR, name)) ]
    version_response_json = version_response.json()
    if "version" in version_response_json:
        current_dip_version = version_response_json['version']

    if current_dip_version and local_version:
        upgrade_test = current_dip_version + "-" + local_version

    compatible_upgrades = []
    for upgrade in upgrades:
        if upgrade_test in upgrade:
            compatible_upgrades.append(upgrade)

    if len(compatible_upgrades) == 0:
        compatible_upgrades.append("Unable to determine upgrade path.")
    return compatible_upgrades


def generate_kickstart_inventory() -> None:
    kickstart_form = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    kickstart_generator = KickstartInventoryGenerator(kickstart_form["form"])
    kickstart_generator.generate()


def generate_kit_inventory() -> None:
    kit_form = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    kit_generator = KitInventoryGenerator(kit_form["form"])
    kit_generator.generate()


@celery.task
def execute_upgrade(upgrade_path: str):
    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX)


    try:
        notification.setStatus(status=NotificationCode.IN_PROGRESS.name)
        notification.setMessage("Executing " + upgrade_path + " upgrade playbook.")
        notification.post_to_websocket_api()

        cwd_dir = str(UPGRADES_DIR / upgrade_path / "playbooks")
        command = ("ansible-playbook site.yml")
        job = AsyncJob(_JOB_NAME.capitalize(), command, working_dir=cwd_dir)
        ret_val = job.run_asycn_command()

        notification.setStatus(status=NotificationCode.COMPLETED.name)
        notification.setMessage("Upgrade " + upgrade_path + " completed.")
        notification.post_to_websocket_api()

    except Exception as err:
        logger.exception(err)
        notification.setStatus(status=NotificationCode.ERROR.name)
        notification.setMessage("Upgrade encountered an error")
        notification.setException(exception=str(err))
        notification.post_to_websocket_api()
        raise e

    return ret_val


def execute(upgrade_path: str) -> dict:

    cmd_to_execute = ("ansible-playbook site.yml -i inventory.yml -t preflight,setup,dnsmasq,kickstart,profiles")

    kickstart_task_id = perform_kickstart.delay(cmd_to_execute)
    upgrade_task_id = execute_upgrade.delay(upgrade_path=upgrade_path)

    conn_mng.mongo_celery_tasks.find_one_and_replace({"_id": "Kickstart"},
                                                    {"_id": "Kickstart", "task_id": str(kickstart_task_id), "pid": ""},
                                                    upsert=True)

    conn_mng.mongo_celery_tasks.find_one_and_replace({"_id": "Upgrade"},
                                                    {"_id": "Upgrade", "task_id": str(upgrade_task_id), "pid": ""},
                                                    upsert=True)

    return({"kickstart_task_id": str(kickstart_task_id),
     "upgrade_task_id": str(upgrade_task_id)})


def get_ssh_keys(fabric: FabricConnection) -> None:
    # Create ssh directory on controller
    ssh_dir = "/root/.ssh"
    cmd_to_list_ssh_files = ("for i in /root/.ssh/*; do echo $i; done")
    cmd_selinux = ("chcon -R -t ssh_home_t " + ssh_dir)
    try:
        if not os.path.exists(ssh_dir):
            os.mkdir(ssh_dir)
            proc = subprocess.Popen(cmd_selinux, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            out, err = proc.communicate()
            logger.info(out.decode('utf-8'))
        files_string_ = fabric.run(cmd_to_list_ssh_files).stdout.strip()
        files_list = files_string_.replace("\r","").split("\n")
        for f in files_list:
            fabric.get(f, f)
    except Exception as e:
        raise e


def get_kube_config(fabric: FabricConnection) -> None:
    kube_dir = "/root/.kube"
    try:
        if not os.path.exists(kube_dir):
            os.mkdir(kube_dir)
        fabric.get(kube_dir + "/config", kube_dir + "/config")
    except Exception as e:
        raise e


def migrate_controller(original_controller_ip: str, username: str, password: str) -> None:
    """
    Returns

    :param original_controller_ip: original_controller_ip
    :param username: username
    :param password: password
    : return(bool)
    """

    conn_mng.mongo_kit.delete_many({})
    conn_mng.mongo_kickstart.delete_many({})
    jobs_results = {}
    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX)

    try:
        with FabricConnection(ip_address=original_controller_ip,username=username, password=password) as fabric:
            cmd=("mongodump --archive=tfplenum_database.gz --gzip --db tfplenum_database")
            fabric.run(cmd)
            fabric.get("tfplenum_database.gz", "/tmp/tfplenum_database.gz")
            # Copy ssh directory to new controller
            get_ssh_keys(fabric)
            # Copy .kube directory to new controller
            get_kube_config(fabric)

        cmd = ("mongo tfplenum_database --eval \"db.dropDatabase()\"")
        proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        out, err = proc.communicate()
        logger.info(out.decode('utf-8'))

        cmd = ("mongorestore --gzip --archive=/tmp/tfplenum_database.gz --db tfplenum_database")
        proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        out, err = proc.communicate()
        logger.info(out.decode('utf-8'))
    except Exception as e:
        logger.exception(e)
        notification.setStatus(status=NotificationCode.ERROR.name)
        notification.setMessage("Upgrade encountered an error")
        notification.setException(exception=str(e))
        notification.post_to_websocket_api()
        raise e


def update_controller_ip(new_controller_ip: str) -> None:
    conn_mng.mongo_kickstart.find_one_and_update({"_id": KICKSTART_ID},
        {'$set': {'form.controller_interface': [new_controller_ip]}},
        upsert=False
    )


def upgrade(original_controller_ip: str, username: str, password: str, new_controller_ip: str, upgrade_path: str):
    notification = NotificationMessage(role=_MESSAGETYPE_PREFIX)
    notification.setStatus(status=NotificationCode.STARTED.name)
    notification.setMessage("Upgrade started.")
    notification.post_to_websocket_api()

    jobs_results = {}
    try:
        notification.setStatus(status=NotificationCode.IN_PROGRESS.name)
        notification.setMessage("Migrating data from old controller.")
        notification.post_to_websocket_api()
        migrate_controller(original_controller_ip, username, password)
    except Exception as e:
        logger.exception(e)
        notification.setStatus(status=NotificationCode.ERROR.name)
        notification.setMessage("Upgrade encountered an error")
        notification.setException(exception=str(e))
        notification.post_to_websocket_api()
        return e

    notification.setStatus(status=NotificationCode.IN_PROGRESS.name)
    notification.setMessage("Restoring configurations.")
    notification.post_to_websocket_api()

    update_controller_ip(new_controller_ip)
    generate_kickstart_inventory()
    generate_kit_inventory()

    notification.setStatus(status=NotificationCode.IN_PROGRESS.name)
    notification.setMessage("Executing kit upgrade path.")
    notification.post_to_websocket_api()
    jobs_results = execute(upgrade_path)

    return jobs_results
