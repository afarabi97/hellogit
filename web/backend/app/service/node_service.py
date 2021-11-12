from datetime import datetime, timedelta
from time import sleep
from typing import Dict, List, Union

from app.models.device_facts import (DeviceFacts,
                                     create_device_facts_from_ansible_setup)
from app.models.nodes import Command, Node, NodeJob, NodeSchema
from app.models.settings.esxi_settings import EsxiSettingsForm
from app.models.settings.general_settings import GeneralSettingsForm
from app.models.settings.kit_settings import KitSettingsForm
from app.models.settings.mip_settings import MipSettingsForm
from app.service.job_service import AsyncJob
from app.service.socket_service import (NotificationCode, NotificationMessage,
                                        log_to_console, notify_node_management)
from app.utils.connection_mngs import REDIS_CLIENT
from app.utils.constants import (CORE_DIR, DEPLOYMENT_JOBS, DEPLOYMENT_TYPES,
                                 JOB_CREATE, JOB_DEPLOY, JOB_PROVISION,
                                 JOB_REMOVE, LOG_PATH, MIP_DIR, NODE_TYPES)
from app.utils.logging import rq_logger
from app.utils.utils import get_app_context
from rq import get_current_job
from rq.decorators import job
from rq.job import Job
from rq.timeouts import JobTimeoutException


class JobFailed(Exception):
    pass

_JOB_NAME_NOTIFICATION = "Nodes"
GENERAL_SETTINGS_PATH = str(CORE_DIR / "playbooks/inventory/settings.yml")

class Timeout(Exception):
    pass


def update_job(node: Node, stage, from_function: str):
    node_job = NodeJob.load_job_by_node(node=node, job_name=stage)
    if node_job:
        if from_function == "handle_success":
            node_job.set_complete()
        elif from_function == "handle_failure":
            node_job.set_error("Something broke check the logs.")

def get_all_nodes_with_jobs() -> list:
    results = []
    nodes = Node.load_all_from_db() # type: List[Node]
    for node in nodes:
        job_list = []
        jobs = NodeJob.load_jobs_by_node(node) # type: List[NodeJob]
        for job in jobs:
            job_list.append(job.to_dict())
        node_dict = node.to_dict() # type: Dict
        node_dict["jobs"] = job_list
        results.append(node_dict)
    return results


def get_kit_status() -> dict:
    control_plane_deployed = False
    general_settings_configured = False
    kit_settings_configured = False
    esxi_settings_configured = False
    base_kit_deployed = False
    ready_to_deploy = False
    jobs_running = False
    deploy_kit_running = False
    num_of_servers_provisioned = 0
    num_of_servers_deployed = 0
    jobs_error = 0
    jobs_complete = 0
    jobs_inprogress = 0
    jobs_pending = 0

    settings = GeneralSettingsForm.load_from_db() # type: GeneralSettingsForm
    if settings and settings.job_completed:
        general_settings_configured = True

    kit_settings = KitSettingsForm.load_from_db() # type: KitSettingsForm
    if kit_settings and kit_settings.job_completed:
        kit_settings_configured = True

    esxi_settings = EsxiSettingsForm.load_from_db() # type: EsxiSettingsForm
    if esxi_settings:
        esxi_settings_configured = True

    nodes = Node.load_dip_nodes_from_db() # type: List[Node]
    all_jobs = NodeJob.load_all_jobs() # type: List[NodeJob]

    for node in nodes:
        job_list = [job for job in all_jobs if node._id == job.node_id]
        for node_job in job_list:
            if node_job.exec_type == str(DEPLOYMENT_JOBS.base_kit):
                deploy_kit_running = True
                if node_job.complete or node_job.error:
                    deploy_kit_running = False
            if node_job.name == JOB_DEPLOY:
                if node.node_type == NODE_TYPES.control_plane.value and node_job.complete:
                    control_plane_deployed = True
                if node.node_type == NODE_TYPES.server.value and node_job.complete:
                    num_of_servers_deployed += 1
                if node_job.complete:
                    jobs_complete += 1
                elif node_job.inprogress:
                    jobs_inprogress += 1
            elif node_job.name == JOB_PROVISION:
                if node.node_type == NODE_TYPES.server.value and node_job.complete:
                    num_of_servers_provisioned += 1
                if node_job.complete:
                    jobs_complete += 1
                elif node_job.inprogress:
                    jobs_inprogress += 1
                elif node_job.pending:
                    jobs_pending += 1
            if jobs_inprogress > 0:
                jobs_running = True

    if control_plane_deployed \
        and general_settings_configured \
        and kit_settings_configured \
        and esxi_settings_configured:
        if num_of_servers_provisioned >= 2 and jobs_inprogress == 0 and jobs_pending == 0:
            ready_to_deploy = True
        if num_of_servers_deployed >= 2:
            base_kit_deployed = True

    return {"control_plane_deployed": control_plane_deployed,
            "general_settings_configured": general_settings_configured,
            "kit_settings_configured": kit_settings_configured,
            "esxi_settings_configured": esxi_settings_configured,
            "ready_to_deploy": ready_to_deploy,
            "base_kit_deployed": base_kit_deployed,
            "jobs_running": jobs_running,
            "deploy_kit_running": deploy_kit_running}


def _execute_job(cmd_object: Command) -> bool:
    async_job = AsyncJob(job_name=cmd_object.job_name, job_id=cmd_object.job_id, command=cmd_object.command, working_dir=cmd_object.cwd_dir, use_shell=True)
    ret_val = async_job.run_async_command()
    if ret_val == 0:
        return True
    return False

def send_notification() -> None:
    notify_node_management(kit_status=get_kit_status(), node_data=get_all_nodes_with_jobs())

@job('default', connection=REDIS_CLIENT, timeout="5m")
def update_device_facts_job(node: Node, settings: Union[KitSettingsForm, MipSettingsForm]) -> None:
    get_app_context().push()
    try:
        notification = NotificationMessage(role=_JOB_NAME_NOTIFICATION.lower())
        device_facts = create_device_facts_from_ansible_setup(str(node.ip_address), settings.password)
        if device_facts:
            node.deviceFacts = device_facts.to_dict()
            node.save_to_db()
            notification.set_and_send(message="{} device facts updated.".format(node.hostname), status=NotificationCode.COMPLETED.name)
        return True
    except Exception as exc:
        rq_logger.error(str(exc))
        notification.set_and_send(message="Unable to update {} device facts.".format(node.hostname), status=NotificationCode.ERROR.name)
        return False
    return True

@job('default', connection=REDIS_CLIENT, timeout="120m")
def gather_device_facts(node: Node, settings: Union[KitSettingsForm, MipSettingsForm]):
    get_app_context().push()
    try:
        job = get_current_job() # type: Job
        job.meta['node_id'] = node._id
        job.meta['job_name'] = DEPLOYMENT_JOBS.gather_device_facts.value
        job.save_meta()

        JOB_TIMEOUT = 90
        future_time = datetime.utcnow() + timedelta(minutes=JOB_TIMEOUT)
        failed = False
        node_job = NodeJob.load_job_by_node(node=node, job_name=JOB_PROVISION) # type: NodeJob
        node_job.set_inprogress(job.id)

        # update node status on node management
        send_notification()

        notification = NotificationMessage(role=_JOB_NAME_NOTIFICATION.lower())
        while True:
            device_facts = None
            try:
                device_facts = create_device_facts_from_ansible_setup(str(node.ip_address), settings.password) # type: DeviceFacts
            except Exception as exc:
                pass
            if device_facts:
                node.deviceFacts = device_facts.to_dict()
                node.save_to_db()
                if node_job:
                    node_job.set_job_state()
                    node_job.set_complete()
                    log_text = "INFO:{}: {} successfully provisioned.".format(str(datetime.now()), node.hostname)
                    rq_logger.info(log_text)
                    log_to_console(_JOB_NAME_NOTIFICATION, job.id, log_text, "green")

                if node.node_type == NODE_TYPES.mip.value:
                    execute.delay(node=node, exec_type=DEPLOYMENT_JOBS.mip_deploy, stage=JOB_DEPLOY)
                elif node.node_type == NODE_TYPES.control_plane.value and node.deployment_type == DEPLOYMENT_TYPES.baremetal.value:
                    execute.delay(node=node, exec_type=DEPLOYMENT_JOBS.setup_control_plane, stage=JOB_DEPLOY)
                else:
                    kit_status = get_kit_status()
                    if kit_status["base_kit_deployed"]:
                        execute.delay(node=node, exec_type=DEPLOYMENT_JOBS.add_node, stage=JOB_DEPLOY)
                break
            elif future_time <= datetime.utcnow():
                msg = "ERROR:{}: Unable to find {} provisioning timeout.".format(str(datetime.now()), node.hostname)
                log_to_console(_JOB_NAME_NOTIFICATION, job.id, msg, "red")
                notification.set_and_send(message=msg,
                    status=NotificationCode.ERROR.name)
                if node_job:
                    node_job.set_error(message=msg)
                failed = True
                break
            else:
                sleep(10)
                log_text = "INFO:{}: Waiting for node {} to provision - This can take a while, you may want to grab a coffee".format(str(datetime.now()), node.hostname)
                log_to_console(_JOB_NAME_NOTIFICATION, job.id, log_text)
                rq_logger.info(log_text)
        send_notification()
        if failed:
            raise JobFailed("An unknown error occurred check the rq logs")
            return False
    except JobTimeoutException as exc:
        if node:
            msg = "ERROR:{}: Unable to find {} provisioning timeout.".format(str(datetime.now()), node.hostname)
            log_to_console(_JOB_NAME_NOTIFICATION, job.id, msg, "red")
            notification.set_and_send(message=msg, status=NotificationCode.ERROR.name)
        if node_job:
            node_job.set_error(message=msg)
        raise
    return True


class NodeService():
    def __init__(self, job_id: str, exec_type: DEPLOYMENT_JOBS, stage: str, node: Union[Node, List[Node]]=None):
        self.job_id = job_id
        self.exec_type = exec_type
        self.stage = stage
        self.node = node
        self.job_id = job_id

    def get_cmd(self) -> str:
        # Base_Kit
        if self.exec_type == DEPLOYMENT_JOBS.base_kit:
            vpn_node = False
            skip_tags = ""
            for n in self.node:
                if n.vpn_status:
                    vpn_node = True
            if vpn_node:
                skip_tags = "--skip-tags openvpn"
            self.cmd = ("export ANSIBLE_LOG_PATH={log_path}/core.log;"
                "ansible-playbook site.yml -i inventory {skip_tags}".format(log_path=LOG_PATH, skip_tags=skip_tags))
        # Add Node
        elif self.exec_type == DEPLOYMENT_JOBS.add_node:
            skip_tags = ""
            if self.node.deployment_type == DEPLOYMENT_TYPES.iso.value:
                skip_tags = "--skip-tags openvpn"
            self.cmd = ("export ANSIBLE_LOG_PATH={log_path}/core.log;"
                "ansible-playbook add_node.yml -i inventory "
                "--limit localhost,{node} {skip_tags}".format(log_path=LOG_PATH, node=self.node.hostname, skip_tags=skip_tags))
        # Remove Node
        elif self.exec_type == DEPLOYMENT_JOBS.remove_node:
            self.cmd = ("export ANSIBLE_LOG_PATH={log_path}/remove-node.log;"
                "ansible-playbook remove_node.yml -i inventory "
                "-e node='{node}'").format(log_path=LOG_PATH, node=self.node.hostname)

        # Control Plane
        elif self.exec_type == DEPLOYMENT_JOBS.setup_control_plane and self.stage == JOB_DEPLOY:
            self.cmd = ("export ANSIBLE_LOG_PATH={log_path}/control-plane.log;"
                        "ansible-playbook control_plane_playbook.yml -i inventory -t deploy-control-plane").format(log_path=LOG_PATH)

        elif self.exec_type == DEPLOYMENT_JOBS.provision_virtual or \
                (self.exec_type == DEPLOYMENT_JOBS.setup_control_plane and self.stage == JOB_PROVISION):
            self.cmd = ("export ANSIBLE_LOG_PATH={log_path}/virtual-node.log;"
                "ansible-playbook virtual_node_playbook.yml -i inventory -t provision-virtual-machine "
                "-i {mip_dir} -e node='{node}'").format(log_path=LOG_PATH, node=self.node.hostname, mip_dir=str(MIP_DIR / "inventory"))

        elif self.exec_type == DEPLOYMENT_JOBS.create_virtual or \
                (self.exec_type == DEPLOYMENT_JOBS.setup_control_plane and self.stage == JOB_CREATE):
            self.cmd = ("export ANSIBLE_LOG_PATH={log_path}/virtual-node.log;"
                "ansible-playbook virtual_node_playbook.yml -i inventory -t create-virtual-machine "
                "-i {mip_dir} -e node='{node}'").format(log_path=LOG_PATH, node=self.node.hostname, mip_dir=str(MIP_DIR / "inventory"))

        # Kickstart Profiles
        elif self.exec_type == DEPLOYMENT_JOBS.kickstart_profiles:
            self.cmd = ("export ANSIBLE_LOG_PATH={log_path}/kickstart-profiles.log;"
                        "ansible-playbook kickstart_profiles.yml -i inventory "
                        "-i {mip_dir} -e node={node}").format(log_path=LOG_PATH, mip_dir=str(MIP_DIR / "inventory"), node=self.node.hostname)

        # Setup Controller Run on Save General Settings
        elif self.exec_type == DEPLOYMENT_JOBS.setup_controller:
            settings = GeneralSettingsForm.load_from_db() # type: GeneralSettingsForm
            rq_logger.debug(settings)
            settings.job_id = self.job_id
            settings.job_completed = False
            settings.save_to_db()
            self.cmd = ("export ANSIBLE_LOG_PATH={log_path}/kit-setting.log;"
                        "ansible-playbook controller_playbook.yml -i inventory -i {mip_dir}").format(log_path=LOG_PATH, mip_dir=str(MIP_DIR / "inventory"))

        #Save Kit Settings
        elif self.exec_type == DEPLOYMENT_JOBS.setup_controller_kit_settings:
            kit_settings = KitSettingsForm.load_from_db() # type: KitSettingsForm
            kit_settings.job_id = self.job_id
            kit_settings.job_completed = False
            kit_settings.save_to_db()
            self.cmd = ("export ANSIBLE_LOG_PATH={log_path}/kit-setting.log;"
                        "ansible-playbook controller_playbook.yml -i inventory -i {mip_dir} "
                        "-t create-assessor-user,setup_controller_kit_settings").format(log_path=LOG_PATH, mip_dir=str(MIP_DIR / "inventory"))

        #MIP
        elif self.exec_type == DEPLOYMENT_JOBS.mip_deploy:
            settings = MipSettingsForm.load_from_db() # type: MipSettingsForm
            self.cmd = ("export ANSIBLE_LOG_PATH={log_path}/{mip_job}.log;"
                        "ansible-playbook site.yml -i inventory -i {settings} "
                        "--limit localhost,{node} "
                        "-t {op_type}").format(log_path=LOG_PATH, settings=GENERAL_SETTINGS_PATH, node=self.node.hostname, mip_job=self.exec_type, op_type=settings.operator_type)

        return self.cmd

    def handle_success(self) -> None:
        notification = NotificationMessage(role=_JOB_NAME_NOTIFICATION.lower())
        msg = "{} {} job successfully completed.".format(self.exec_type.value, self.stage)
        if isinstance(self.node, list):
            for nodevar in self.node:
                update_job(nodevar, self.stage, self.handle_success.__name__)
        elif self.node and isinstance(self.node, Node):
            msg = "{} {} job successfully completed on node '{}'.".format(self.exec_type.value, self.stage, self.node.hostname)
            update_job(self.node, self.stage, self.handle_success.__name__)
        notification.set_and_send(message=msg,
            status=NotificationCode.COMPLETED.name)
        if self.exec_type == DEPLOYMENT_JOBS.setup_control_plane:
            if self.stage == JOB_CREATE:
                execute.delay(node=self.node, exec_type=self.exec_type, stage=JOB_PROVISION)
            if self.stage == JOB_PROVISION:
                kit_settings = KitSettingsForm.load_from_db()
                gather_device_facts(self.node, kit_settings)
                execute.delay(node=self.node, exec_type=self.exec_type, stage=JOB_DEPLOY)
        elif self.exec_type == DEPLOYMENT_JOBS.remove_node:
            self.node.delete()
        elif self.exec_type == DEPLOYMENT_JOBS.setup_controller:
            settings = GeneralSettingsForm.load_from_db() # type: GeneralSettingsForm
            settings.job_completed = True
            settings.save_to_db()
        elif self.exec_type == DEPLOYMENT_JOBS.setup_controller_kit_settings:
            settings = KitSettingsForm.load_from_db() # type: GeneralSettingsForm
            settings.job_completed = True
            settings.save_to_db()
        elif self.exec_type == DEPLOYMENT_JOBS.create_virtual:
            execute.delay(node=self.node, exec_type=DEPLOYMENT_JOBS.provision_virtual, stage=JOB_PROVISION)
        elif self.exec_type == DEPLOYMENT_JOBS.provision_virtual:
            kit_settings = KitSettingsForm.load_from_db()
            gather_device_facts(self.node, kit_settings)

    def handle_failure(self) -> None:
        notification = NotificationMessage(role=_JOB_NAME_NOTIFICATION.lower())
        msg = "{} {} job failed.".format(self.exec_type.value, self.stage)
        if isinstance(self.node, list):
            for nodevar in self.node:
                update_job(nodevar, self.stage, self.handle_failure.__name__)
        elif self.node and isinstance(self.node, Node):
            msg = "{} {} job failed on node '{}'.".format(self.exec_type.value, self.stage, self.node.hostname)
            update_job(self.node, self.stage, self.handle_failure.__name__)
        notification.set_and_send(message=msg,
            status=NotificationCode.ERROR.name)
    def job_update(self, single_node: Node) -> None:
        if self.stage == JOB_REMOVE:
            NodeJob.create_remove_node_job(node=single_node, job_id=self.job_id)
        else:
            node_job = NodeJob.load_job_by_node(node=single_node, job_name=self.stage) # type: NodeJob
            if node_job:
                node_job.set_job_state(job_id=self.job_id)
                node_job.set_execution_type(self.exec_type)
                node_job.save_to_db()

    def update_node_job_state(self) -> None:
        if isinstance(self.node, list):
            for nodevar in self.node:
                self.job_update(nodevar)
        if isinstance(self.node, Node):
            self.job_update(self.node)
        send_notification()


@job('default', connection=REDIS_CLIENT, timeout="120m")
def execute(exec_type: DEPLOYMENT_JOBS=DEPLOYMENT_JOBS.base_kit, stage: str=JOB_CREATE, node: Union[Node, List[Node]]=None):
    get_app_context().push()
    try:
        success = False
        job_id = get_current_job().id
        node_service = NodeService(job_id=job_id, exec_type=exec_type, stage=stage, node=node) # type: NodeService
        if node:
            node_service.update_node_job_state()

        notification = NotificationMessage(role=_JOB_NAME_NOTIFICATION.lower())
        msg = ""
        if isinstance(node, Node):
            msg = "{} {} job started on node '{}'.".format(exec_type.value, stage, node.hostname)
        else:
            msg = "{} {} job started.".format(exec_type.value, stage)
        notification.set_and_send(message=msg, status=NotificationCode.STARTED.name)

        cmd = node_service.get_cmd()

        dir = ""
        if exec_type == DEPLOYMENT_JOBS.mip_deploy and node.node_type == NODE_TYPES.mip.value:
            dir = str(MIP_DIR)
        else:
            dir = str(CORE_DIR / "playbooks")

        rq_logger.info(cmd)
        rq_logger.info(dir)
        command = Command(command=cmd, cwd_dir=dir,
                          job_name=_JOB_NAME_NOTIFICATION,
                          job_id=job_id)

        is_successful = _execute_job(command)

        if is_successful:
            node_service.handle_success()
            success = True
        if not is_successful:
            node_service.handle_failure()
            success = False

        send_notification()

        if success:
            return True
        if not success:
            raise JobFailed("An unknown error occurred check the rq logs")
    except Exception as exc:
        rq_logger.exception(exc)
        if node_service:
            node_service.handle_failure()
            success = False
            log_to_console(_JOB_NAME_NOTIFICATION, node_service.job_id, "An exception occurred: {}".format(str(exc)), "red")
        raise
    return False

@job('default', connection=REDIS_CLIENT, timeout="120m")
def refresh_kit(nodes: List[Node], new_control_plane: List[Node]):
    get_app_context().push()
    notification = NotificationMessage(role=_JOB_NAME_NOTIFICATION.lower())
    notification.set_and_send(message="Kit Refresh started.",
        status=NotificationCode.STARTED.name)

    results = []

    for node in nodes:
        if node.node_type == NODE_TYPES.sensor.value:
            results.append(execute(node=node, exec_type=DEPLOYMENT_JOBS.remove_node))
        else:
            node.delete()
            node.create()
            if node.deployment_type == DEPLOYMENT_TYPES.baremetal.value:
                results.append(execute.delay(exec_type=DEPLOYMENT_JOBS.kickstart_profiles, node=node))
            elif node.deployment_type == DEPLOYMENT_TYPES.virtual.value:
                results.append(execute.delay(exec_type=DEPLOYMENT_JOBS.create_virtual, node=node))

    results.append(execute.delay(node=new_control_plane[0], exec_type=DEPLOYMENT_JOBS.setup_control_plane))

    msg = "All refresh jobs started."
    notification.set_and_send(message=msg,
        status=NotificationCode.COMPLETED.name)
