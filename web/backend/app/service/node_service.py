from app import celery, logger, CORE_DIR, STIGS_DIR, conn_mng
from app.inventory_generator import KitInventoryGenerator, KickstartInventoryGenerator
from app.service.socket_service import NotificationMessage, NotificationCode
from app.service.job_service import AsyncJob
from pathlib import Path
from shared.constants import KICKSTART_ID, KIT_ID, ADDNODE_ID

_JOB_NAME_NOTIFICATION = "kit"


def _remove_node_kick_inventory(node_to_remove):
    current_kickstart_config = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    kick_nodes = list(current_kickstart_config["form"]["nodes"])
    for node in kick_nodes:
        node_fqdn = "{}.{}".format(node["hostname"], current_kickstart_config["form"]["domain"])
        if node_fqdn == str(node_to_remove):
            kick_nodes.remove(node)
    current_kickstart_config["form"]["nodes"] = kick_nodes
    conn_mng.mongo_kickstart.find_one_and_replace({"_id": KICKSTART_ID}, {"_id": KICKSTART_ID, "form": current_kickstart_config["form"]})
    kick_generator = KickstartInventoryGenerator(current_kickstart_config["form"])
    kick_generator.generate()


def _remove_node_kit_inventory(node_to_remove):
    current_kit_configuration = conn_mng.mongo_kit.find_one({"_id": KIT_ID})
    current_kickstart_config = conn_mng.mongo_kickstart.find_one({"_id": KICKSTART_ID})
    kit_nodes = list(current_kit_configuration["form"]["nodes"])
    for node in kit_nodes:
        if str(node["hostname"]) == str(node_to_remove):
            kit_nodes.remove(node)
    current_kit_configuration["form"]["nodes"] = kit_nodes

    if "remove_node" in current_kit_configuration["form"]:
        del current_kit_configuration["form"]["remove_node"]

    conn_mng.mongo_kit.find_one_and_replace({"_id": KIT_ID},{"_id": KIT_ID, "form": current_kit_configuration["form"]})
    kit_generator = KitInventoryGenerator(current_kit_configuration["form"], current_kickstart_config["form"])
    kit_generator.generate()


def _execute_job(cmd_object: dict) -> int:
    conn_mng.mongo_celery_tasks.find_one_and_replace({"_id": cmd_object["job_name"]},
                                                    {"_id": cmd_object["job_name"], "task_id": "", "pid": ""},
                                                    upsert=True)
    job = AsyncJob(job_name=cmd_object["job_name"], command=cmd_object["command"], working_dir=cmd_object["cwd_dir"], use_shell=True)
    ret_val = job.run_asycn_command()
    conn_mng.mongo_celery_tasks.delete_one({"_id": cmd_object["job_name"]})
    return ret_val


@celery.task
def add_node(node_payload, password):
    node_hostname = None

    if "hostname" in node_payload:
        node_hostname = node_payload['hostname']

    notification = NotificationMessage(role=_JOB_NAME_NOTIFICATION)
    notification.set_message("Adding {} node job started.".format(node_hostname))
    notification.set_status(NotificationCode.STARTED.name)
    notification.post_to_websocket_api()

    command_list = [
        {
            "command": "ansible-playbook site.yml -i inventory.yml -t update-dnsmasq-hosts",
            "cwd_dir": str(CORE_DIR / "playbooks"),
            "job_name": "Addnode"
        }, {
            "command": ("ansible-playbook site.yml -i inventory.yml "
                        "-e ansible_ssh_pass='{playbook_pass}' -t repos,update-dns "
                        "--limit localhost,{node}"
                        ).format(playbook_pass=password, node=node_hostname),
           	            "cwd_dir": str(CORE_DIR / "playbooks"),
           	            "job_name": "Addnode"
        }, {
            "command": ("ansible-playbook site.yml -i inventory.yml "
                        "-e ansible_ssh_pass='{playbook_pass}' -t genkeys,preflight,common,openvpn"
                        ).format(playbook_pass=password),
           	            "cwd_dir": str(CORE_DIR / "playbooks"),
           	            "job_name": "Addnode"
        }, {
            "command": ("ansible-playbook site.yml -i inventory.yml "
                        "-t certificate_authority/common,crio,kube-node,logs,audit,node-health "
                        "--limit localhost,{node}"
                        ).format(node=node_hostname),
           	            "cwd_dir": str(CORE_DIR / "playbooks"),
           	            "job_name": "Addnode"
        }, {
            "command": "make dip-stigs",
            "cwd_dir": str(STIGS_DIR / "playbooks"),
            "job_name": "Addnode"
        }
    ]
    rc_list = []
    for cmd in command_list:
        rtn_code = _execute_job(cmd)
        rc_list.append(rtn_code)
        if rtn_code > 0:
            break

    msg = "Adding {} node successfully completed.".format(node_hostname)
    if sum(rc_list) == 0:
        notification.set_message(msg)
        notification.set_status(NotificationCode.COMPLETED.name)
        notification.post_to_websocket_api()

        # Remove the state of the add node wizard
        # Only remove add node wizard form on successful add node
        conn_mng.mongo_add_node_wizard.delete_one({"_id": ADDNODE_ID})

    if sum(rc_list) > 0:
        msg = "Adding {} node failed.".format(node_hostname)
        notification.set_message(msg)
        notification.set_status(NotificationCode.ERROR.name)
        notification.post_to_websocket_api()
        # Remove the node from kit form if the add node fails
        # This allows the user to retry the add node without duplicating the node in kit form
        _remove_node_kit_inventory(node_hostname)
    return


@celery.task
def remove_node(node, password):

    notification = NotificationMessage(role=_JOB_NAME_NOTIFICATION)
    notification.set_message("Removing {} node job started.".format(node))
    notification.set_status(NotificationCode.STARTED.name)
    notification.post_to_websocket_api()

    cmd = {
        "command": ("ansible-playbook remove-node.yml -i inventory.yml "
                    "-e ansible_ssh_pass='{playbook_pass}' -e node='{node}'"
                    ).format(playbook_pass=password, node=node),
        "cwd_dir": str(CORE_DIR / "playbooks"),
        "job_name": "Removenode"
    }

    ret_val = _execute_job(cmd)

    msg = "{} has been successfully removed.".format(node)
    if ret_val == 0:
        _remove_node_kit_inventory(node)
        _remove_node_kick_inventory(node)
        notification.set_message(msg)
        notification.set_status(NotificationCode.COMPLETED.name)
        notification.post_to_websocket_api()
    if ret_val > 0:
        msg = "Removing {} node failed.".format(node)
        notification.set_message(msg)
        notification.set_status(NotificationCode.ERROR.name)
        notification.post_to_websocket_api()

    return
