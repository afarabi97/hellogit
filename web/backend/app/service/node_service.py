from app import logger, CORE_DIR, STIGS_DIR, conn_mng, REDIS_CLIENT, rq_logger
from app.inventory_generator import KitInventoryGenerator, KickstartInventoryGenerator
from app.models.kit_setup import DIPKickstartForm, DIPKickstartSchema, Node, DIPKitForm
from app.service.socket_service import NotificationMessage, NotificationCode
from app.service.job_service import AsyncJob
from pathlib import Path
from rq.decorators import job
from app.utils.constants import KICKSTART_ID, KIT_ID, ADDNODE_ID
from app.service.system_info_service import get_system_name

_JOB_NAME_NOTIFICATION = "Kit"


def _remove_node_kick_inventory(node_to_remove):
    current_kickstart_config = DIPKickstartForm.load_from_db() # type: DIPKickstartForm
    kick_nodes = current_kickstart_config.nodes
    for node in kick_nodes:  # type: Node
        if node.hostname == str(node_to_remove):
            kick_nodes.remove(node)

    current_kickstart_config.save_to_db()
    schema = DIPKickstartSchema()
    kick_generator = KickstartInventoryGenerator(schema.dump(current_kickstart_config))
    kick_generator.generate()


def _remove_node_kit_inventory(node_to_remove):
    current_kit_configuration = DIPKitForm.load_from_db() # type: DIPKitForm
    current_kickstart_config = DIPKickstartForm.load_from_db() # type: DIPKickstartForm
    kit_nodes = current_kit_configuration.nodes
    for node in kit_nodes:
        if node.hostname == str(node_to_remove):
            kit_nodes.remove(node)

    current_kit_configuration.save_to_db()
    kit_generator = KitInventoryGenerator(current_kit_configuration, current_kickstart_config)
    kit_generator.generate()


def _execute_job(cmd_object: dict) -> int:
    job = AsyncJob(job_name=cmd_object["job_name"], command=cmd_object["command"], working_dir=cmd_object["cwd_dir"], use_shell=True)
    ret_val = job.run_asycn_command()
    return ret_val


def execute_series(cmd_list: list) -> bool:
    rc_list = []
    for cmd in cmd_list:
        rtn_code = _execute_job(cmd)
        rc_list.append(rtn_code)
        if rtn_code > 0:
            break
    # Commands were all successful return True
    if sum(rc_list) == 0:
        return True
    # A command failed return False
    if sum(rc_list) > 0:
        return False
    return False


@job('default', connection=REDIS_CLIENT, timeout="120m")
def execute_kit(password: str):
    notification = NotificationMessage(role=_JOB_NAME_NOTIFICATION.lower())
    notification.set_and_send(message="{} started.".format(_JOB_NAME_NOTIFICATION),
        status=NotificationCode.STARTED.name)

    gip_tags = ""
    system_name = get_system_name()
    if system_name == "GIP":
        gip_tags = "--skip-tags moloch"
        do_stigs =  {
            "command": "make gip-server-stigs",
            "cwd_dir": str(STIGS_DIR),
            "job_name": _JOB_NAME_NOTIFICATION
        }
    else:
        do_stigs =  {
            "command": "make dip-stigs",
            "cwd_dir": str(STIGS_DIR),
            "job_name": _JOB_NAME_NOTIFICATION
        }

    command_list = [
        {
            "command": ("ansible-playbook site.yml -i inventory.yml "
                        "-e ansible_ssh_pass='{playbook_pass}' {gip}"
                        ).format(playbook_pass=password, gip=gip_tags),
                        "cwd_dir": str(CORE_DIR / "playbooks"),
                        "job_name": _JOB_NAME_NOTIFICATION
        }, do_stigs
    ]

    is_successful = execute_series(command_list)

    msg = "{} job successfully completed.".format(_JOB_NAME_NOTIFICATION)
    if is_successful:
        notification.set_and_send(message=msg,
            status=NotificationCode.COMPLETED.name)
        DIPKitForm.mark_complete_and_save()

    if not is_successful:
        msg = "{} job failed.".format(_JOB_NAME_NOTIFICATION)
        notification.set_and_send(message=msg,
            status=NotificationCode.ERROR.name)
        raise Exception("A command failed.")


@job('default', connection=REDIS_CLIENT, timeout="60m")
def add_node(node_payload, password):
    node_hostname = None

    if "hostname" in node_payload:
        node_hostname = node_payload['hostname']

    notification = NotificationMessage(role=_JOB_NAME_NOTIFICATION.lower())
    notification.set_and_send(message="Adding {} node job started.".format(node_hostname),
        status=NotificationCode.STARTED.name)

    playbook_dir = str(CORE_DIR / "playbooks")
    command_list = [
        {
            "command": ("ansible-playbook site.yml -i inventory.yml "
                        "-e ansible_ssh_pass='{playbook_pass}' -e addnode=true -t repos,update-dns "
                        "--limit localhost,{node}"
                        ).format(playbook_pass=password, node=node_hostname),
           	            "cwd_dir": playbook_dir,
           	            "job_name": "Addnode"
        }, {
            "command": ("ansible-playbook site.yml -i inventory.yml "
                        "-e ansible_ssh_pass='{playbook_pass}' -e addnode=true -t genkeys,preflight"
                        ).format(playbook_pass=password),
           	            "cwd_dir": playbook_dir,
           	            "job_name": "Addnode"
        },
        {
            "command": ("ansible-playbook site.yml -i inventory.yml "
                        "-e ansible_ssh_pass='{playbook_pass}' -e addnode=true -t common "
                        "--limit localhost,{node}"
                        ).format(playbook_pass=password, node=node_hostname),
           	            "cwd_dir": playbook_dir,
           	            "job_name": "Addnode"
        },
        {
            "command": ("ansible-playbook site.yml -i inventory.yml "
                        "-e ansible_ssh_pass='{playbook_pass}' -e addnode=true -t openvpn"
                        ).format(playbook_pass=password),
           	            "cwd_dir": playbook_dir,
           	            "job_name": "Addnode"
        },
        {
            "command": ("ansible-playbook site.yml -i inventory.yml "
                        "-e addnode=true "
                        "-t certificate_authority/common,crio,kube-node,storage,setup-elastic,logs,audit,node-health "
                        "--limit localhost,{node}"
                        ).format(node=node_hostname),
           	            "cwd_dir": playbook_dir,
           	            "job_name": "Addnode"
        }
        # TODO this needs to go back in when stigs are fixed.
        # ,{
        #     "command": "make dip-stigs",
        #     "cwd_dir": str(STIGS_DIR / "playbooks"),
        #     "job_name": "Addnode"
        # }
    ]

    is_successful = execute_series(command_list)

    msg = "Adding {} node successfully completed.".format(node_hostname)
    if is_successful:
        notification.set_and_send(message=msg,
            status=NotificationCode.COMPLETED.name)

        # Remove the state of the add node wizard
        # Only remove add node wizard form on successful add node
        conn_mng.mongo_add_node_wizard.delete_one({"_id": ADDNODE_ID})

    if not is_successful:
        msg = "Adding {} node failed.".format(node_hostname)
        notification.set_and_send(message=msg,
            status=NotificationCode.ERROR.name)
        # Remove the node from kit form if the add node fails
        # This allows the user to retry the add node without duplicating the node in kit form
        _remove_node_kit_inventory(node_hostname)


@job('default', connection=REDIS_CLIENT, timeout="30m")
def remove_node(node, password):
    notification = NotificationMessage(role=_JOB_NAME_NOTIFICATION.lower())
    notification.set_and_send(message="Removing {} node job started.".format(node),
        status=NotificationCode.STARTED.name)

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
        notification.set_and_send(message=msg,
            status=NotificationCode.COMPLETED.name)
    if ret_val > 0:
        msg = "Removing {} node failed.".format(node)
        notification.set_and_send(message=msg,
            status=NotificationCode.ERROR.name)

