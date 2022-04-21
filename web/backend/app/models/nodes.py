"""
https://flask-restplus.readthedocs.io/en/0.9.2/example.html

"""
# imports for inventory generation
import os
import re
import uuid
from typing import Dict, List

from app.calculations import (get_sensors_from_list, get_servers_from_list,
                              server_and_sensor_count)
from app.models import Model, PostValidationError
from app.models.device_facts import DeviceFacts
from app.utils.collections import mongo_jobs, mongo_node
from app.utils.constants import (CORE_DIR, DEPLOYMENT_TYPES, JOB_CREATE,
                                 JOB_DEPLOY, JOB_PROVISION, JOB_REMOVE,
                                 MIP_DIR, NODE_TYPES, TEMPLATE_DIR)
from flask_restx import Namespace, fields
from jinja2 import Environment, FileSystemLoader, select_autoescape
from marshmallow import Schema, ValidationError
from marshmallow import fields as marsh_fields
from marshmallow import post_load, validate, validates
from pymongo import ReturnDocument

JINJA_ENV = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(['html', 'xml'])
)

KIT_SETUP_NS = Namespace("kit", description="Kit setup related operations.")


def has_consecutive_chars(password: str) -> bool:
    """
    Checks if the password has more than 2 of the same consecutive character.
    """
    same = 1
    cached = None
    for index, character in enumerate(password):
        if index == 0:
            cached = character
            same = 1
        else:
            if cached == character:
                same += 1
            else:
                if same > 2:
                    return True
                same = 1
                cached = character
    return False


def validate_mac_address_fn(value: str):
    pattern = '^([0-9a-fA-F]{2}[:]){5}([0-9a-fA-F]{2})$'
    if not re.match(pattern, value):
        raise ValidationError("{} is not a valid MAC address it must be in xx:xx:xx:xx:xx:xx format. "
                              "Also, MAC addresses can only contain upper and lower case letters A "
                              "through F and numbers.".format(value))


def validate_hostname_fn(value: str):
    domain = value.split(".")[-1]
    fqdn_length = len(domain) + 52
    pattern = "^[a-z]([a-z0-9-.]){4,%s}$" % fqdn_length
    if not re.match(pattern, value):
        raise ValidationError("Hostname must be alphanumeric with a length between 5 and {} characters. "
                              " Special characters are not allowed with the exception of dashes (IE -).".format(fqdn_length))


def _generate_inventory():
    _generate_nodes_inventory()
    _generate_cp_inventory()
    _generate_mip_nodes_inventory()


def _generate_nodes_inventory():
    nodes_list = []
    nodes = Node.load_all_servers_sensors_from_db()  # type: List[Node]
    for node_var in nodes:
        nodes_list.append(node_var.to_dict())
    nodes_generator = NodeInventoryGenerator({"nodes": nodes_list})
    nodes_generator.generate()


def _generate_cp_inventory():
    nodes_list = []
    nodes = Node.load_control_plane_from_db()  # type: List[Node]
    for node_var in nodes:
        nodes_list.append(node_var.to_dict())
    control_plane_generator = ControlPlaneInventoryGenerator(
        {"nodes": nodes_list})
    control_plane_generator.generate()


def _generate_mip_nodes_inventory():
    mips_list = []
    mips = Node.load_mips_from_db()
    for mip_var in mips:
        mips_list.append(mip_var.to_dict())
    mip_kickstart_generator = MIPNodesInventoryGenerator({"mips": mips_list})
    mip_kickstart_generator.generate()


class NodeBaseModel(Model):

    @classmethod
    def load_from_db(cls, node_ids: List[str]) -> List[Model]:
        ret_val = []
        for node in mongo_node().find({"_id": {"$in": node_ids}}):
            ret_val.append(cls.schema.load(node))

        return ret_val

    @classmethod
    def load_from_request(cls, payload: Dict) -> Model:
        new_node = cls.schema.load(payload)  # type: KitSettingsForm
        return new_node


class Command(Model):
    def __init__(self, command: str, cwd_dir: str, job_name: str, job_id: str):
        self.command = command
        self.cwd_dir = cwd_dir
        self.job_name = job_name
        self.job_id = job_id


class NodeSchema(Schema):
    _id = marsh_fields.Str()
    # TODO we need more validation here
    hostname = marsh_fields.Str(required=True)
    ip_address = marsh_fields.IPv4(required=True)
    mac_address = marsh_fields.Str(required=False, allow_none=True)
    data_drives = marsh_fields.List(marsh_fields.Str(
        required=True), required=False, allow_none=True)
    boot_drives = marsh_fields.List(marsh_fields.Str(
        required=True), required=False, allow_none=True)
    raid_drives = marsh_fields.List(marsh_fields.Str(
        required=False), required=False, allow_none=True)
    pxe_type = marsh_fields.Str(required=False, allow_none=True, validate=validate.OneOf(
        ["BIOS", "UEFI", "SCSI/SATA/USB", "NVMe"]))
    os_raid = marsh_fields.Bool(required=False, allow_none=True)
    os_raid_root_size = marsh_fields.Integer(required=False)
    node_type = marsh_fields.Str(required=False, validate=validate.OneOf(
        ["Server", "Sensor", "Undefined", "Control-Plane", "Minio", "MIP", "Service"]))
    error = marsh_fields.Str()
    deviceFacts = marsh_fields.Dict()
    deployment_type = marsh_fields.String(required=False, allow_none=True)
    vpn_status = marsh_fields.Bool(required=False, allow_none=True)
    virtual_cpu = marsh_fields.Integer(required=False)
    virtual_mem = marsh_fields.Integer(required=False)
    virtual_os = marsh_fields.Integer(required=False)
    virtual_data = marsh_fields.Integer(required=False)

    @post_load
    def create_Node(self, data: Dict, many: bool, partial: bool):
        return Node(**data)

    @classmethod
    def validate_drive(cls, drives: List[str], label: str):
        pattern = "^([a-z|0-9]{3,7})(,[a-z|0-9]{3,7})*$"
        errors = []
        for drive in drives:
            if not re.match(pattern, drive):
                errors.append("{} {} is not a valid drive string. It must be alphanumeric and "
                              "contain at least 2 lower case characters.".format(label, drive))
        if len(errors) > 0:
            raise ValidationError(errors)

    @validates("boot_drives")
    def validate_boot_drive(self, value: List[str]):
        self.validate_drive(value, "Boot drive")

    @validates("data_drives")
    def validate_data_drive(self, value: List[str]):
        self.validate_drive(value, "Data drive")

    @validates("raid_drives")
    def validate_data_drive(self, value: List[str]):
        self.validate_drive(value, "Raid drive")

    @validates("mac_address")
    def validate_mac_address(self, value: str):
        if value:
            validate_mac_address_fn(value)

    @validates("hostname")
    def validate_hostname(self, value: str):
        validate_hostname_fn(value)


class Node(NodeBaseModel):
    schema = NodeSchema()
    DTO = KIT_SETUP_NS.model('Node', {
        "hostname": fields.String(required=True, example="server1", description="The hostname of the node."),
        "ip_address": fields.String(required=True, example="10.40.12.146", description="The static IP Address of the node."),
        "mac_address": fields.String(required=True, example="00:0a:29:6e:7f:ff", description="The MAC Address of the node's management interface."),
        "data_drives": fields.List(fields.String(example="sdb",
                                                 description="Required field when os_raid is set to false. \
                                                              The data drive for the Node.  For servers, its \
                                                              used for Elasticsearch data and for sensors its \
                                                              used to store the raw PCAP data.")),
        "boot_drives": fields.List(fields.String(example="sda",
                                                 description="Required field when os_raid is set to false. \
                                                              The boot or operating system (OS) drive for \
                                                              the Node."),
                                   required=True),
        "raid_drives": fields.List(fields.String(example="sdb",
                                                 description="Required field with os_raid is set to true. \
                                                              A list of the drives being setup for OS Raid")),
        "pxe_type": fields.String(required=True, example="BIOS", description="Can be either UEFI or BIOS depending on hardware boot type."),
        "os_raid": fields.Boolean(required=True, default=False, description="When set to true OS is used for setting up the RAID. Set it to false if RAID is setup through BIOS on the hardware."),
        "os_raid_root_size": fields.Integer(description="Required field when os_raid is set to true. \
                                                         Size of os raid root size in GB."),
        "node_type": fields.String(example="Server", description="During Kit configuration this gets set to either Server or Sensor"),
        "deviceFacts": fields.Nested(DeviceFacts.DTO, default={}),
        "deployment_type": fields.String(example="Baremetal or Virtual"),
        "vpn_status": fields.Boolean(required=True, default=False, description="When the Node is connected or disconnected from vpn"),

        "virtual_cpu": fields.Integer(description="The number of virtual CPU cores."),
        "virtual_mem": fields.Integer(description="The number of virtual CPU cores."),
        "virtual_os": fields.Integer(description="The number of virtual CPU cores."),
        "virtual_data": fields.Integer(description="The number of virtual CPU cores.")
    })

    def __init__(self,
                 hostname: str,
                 ip_address: str,
                 mac_address: str,
                 pxe_type: str,
                 os_raid: bool = None,
                 data_drives: List[str] = [],
                 boot_drives: List[str] = [],
                 raid_drives: List[str] = [],
                 os_raid_root_size: int = 0,
                 node_type: str = "Undefined",
                 deviceFacts: Dict = {},
                 deployment_type: str = None,
                 vpn_status: bool = None,
                 virtual_cpu: int = 16,
                 virtual_mem: int = 16,
                 virtual_os: int = 100,
                 virtual_data: int = 500,
                 _id: str = None):
        self._id = _id or uuid.uuid4().hex
        self.hostname = hostname
        self.ip_address = ip_address
        self.mac_address = mac_address
        self.data_drives = data_drives
        self.boot_drives = boot_drives
        self.raid_drives = raid_drives
        self.pxe_type = pxe_type
        self.os_raid = os_raid
        self.os_raid_root_size = os_raid_root_size
        # Kit specific fields add later on
        self.node_type = node_type
        self.deviceFacts = deviceFacts
        self.deployment_type = deployment_type
        self.vpn_status = vpn_status

        self.virtual_cpu = virtual_cpu
        self.virtual_mem = virtual_mem
        self.virtual_os = virtual_os
        self.virtual_data = virtual_data

    def update_kit_specific_fields(self, payload: Dict):
        self.node_type = payload["node_type"]
        self.deviceFacts = payload["deviceFacts"]
        _generate_inventory()

    def create(self):
        # Create initial node
        doc = mongo_node().find_one_and_replace({"_id": self._id}, self.schema.dump(
            self), upsert=True, return_document=ReturnDocument.AFTER)
        node = self.schema.load(doc)
        if node.node_type == NODE_TYPES.sensor.value and node.deployment_type == DEPLOYMENT_TYPES.iso.value:
            createdjob = NodeJob(node_id=node._id, job_id=None, description="Creating Node Profiles", name=JOB_CREATE, pending=True,
                                 error=False, inprogress=False, complete=False, message=None)
            deployjob = NodeJob(node_id=node._id, job_id=None, description="Deploying Node", name=JOB_DEPLOY, pending=True,
                                error=False, inprogress=False, complete=False, message=None)
            createdjob.save_to_db()
            deployjob.save_to_db()
        else:
            # Create default jobs
            createdjob = NodeJob(node_id=node._id, job_id=None, description="Creating Kickstart Profiles", name=JOB_CREATE, pending=True,
                                 error=False, inprogress=False, complete=False, message=None)
            installjob = NodeJob(node_id=node._id, job_id=None, description="Installing RHLE8", name=JOB_PROVISION, pending=True,
                                 error=False, inprogress=False, complete=False, message=None)
            deployjob = NodeJob(node_id=node._id, job_id=None, description="Deploying Node", name=JOB_DEPLOY, pending=True,
                                error=False, inprogress=False, complete=False, message=None)
            createdjob.save_to_db()
            installjob.save_to_db()
            deployjob.save_to_db()
        _generate_inventory()

    def save_to_db(self, domain: str = None):
        """
        Saves Kickstart to mongo database.

        :param kickstart_form: Dictionary for the Kickstart form
        """
        # Keeps first label of hostname and appends domain to it.
        if domain:
            pos = self.hostname.find(".")
            if pos == -1:
                self.hostname = f"{self.hostname}.{domain}"
            else:
                self.hostname = f"{self.hostname[:pos]}.{domain}"

        mongo_node().find_one_and_replace(
            {"_id": self._id}, self.schema.dump(self), upsert=True)
        _generate_inventory()

    def find_one_and_update(self) -> Model:
        node = mongo_node().find_one_and_update({"hostname": self.hostname},
                                                {"$set": {
                                                    "node_type": self.node_type,
                                                    # "error": self.error,
                                                    "deviceFacts": self.deviceFacts
                                                }},
                                                return_document=ReturnDocument.AFTER)
        _generate_inventory()
        return self.schema.load(node)

    @classmethod
    def delete_all_from_db(cls):
        mongo_node().drop()
        _generate_inventory()

    def delete(self) -> None:
        mongo_jobs().delete_many({"node_id": self._id})
        mongo_node().delete_one({"_id": self._id})
        _generate_inventory()

    @classmethod
    def load_from_db(cls, node_ids: List[str]) -> List[Model]:
        ret_val = []
        for node in mongo_node().find({"_id": {"$in": node_ids}}):
            ret_val.append(cls.schema.load(node))

        return ret_val

    @classmethod
    def load_from_db_using_hostname(cls, hostname: str) -> Model:
        node = mongo_node().find_one({"hostname": hostname})
        if node:
            return cls.schema.load(node)
        return {}

    @classmethod
    def load_from_db_using_hostname_with_jobs(cls, hostname: str) -> dict:
        node = mongo_node().find_one({"hostname": hostname})
        if node:
            job_list = []
            for job in mongo_jobs().find({"node_id": node["_id"]}):
                job_list.append(job)
            node["jobs"] = job_list
            return node
        return {}

    @classmethod
    def load_control_plane_from_db(cls) -> List[Model]:
        ret_val = []
        query = {"node_type": "Control-Plane"}
        for node in mongo_node().find(query):
            ret_val.append(cls.schema.load(node))
        return ret_val

    @classmethod
    def load_mips_from_db(cls) -> List[Model]:
        ret_val = []
        query = {"node_type": "MIP"}
        for node in mongo_node().find(query):
            ret_val.append(cls.schema.load(node))
        return ret_val

    @classmethod
    def load_deployable_mips_from_db(cls) -> List[Model]:
        ret_val = []
        query = {"node_type": "MIP"}
        for node in mongo_node().find(query):
            ret_val.append(cls.schema.load(node))
        for node in ret_val:
            job = NodeJob.load_job_by_node(node, JOB_DEPLOY)
            if (job.pending or job.error):
                ret_val.remove(node)
        return ret_val

    @classmethod
    def load_minio_from_db(cls) -> List[Model]:
        ret_val = []
        query = {"node_type": "Minio"}
        for node in mongo_node().find(query):
            ret_val.append(cls.schema.load(node))
        return ret_val

    @classmethod
    def load_all_servers_sensors_from_db(cls) -> List[Model]:
        ret_val = []
        query = {"node_type": {"$in": ["Server", "Sensor", "Service"]}}
        for node in mongo_node().find(query):
            ret_val.append(cls.schema.load(node))
        return ret_val

    @classmethod
    def load_all_servers_from_db(cls) -> List[Model]:
        ret_val = []
        query = {"node_type": {"$in": ["Server"]}}
        for node in mongo_node().find(query):
            ret_val.append(cls.schema.load(node))
        return ret_val

    @classmethod
    def load_dip_nodes_from_db(cls) -> List['Node']:
        ret_val = []
        query = {"node_type": {
            "$in": ["Server", "Sensor", "Service", "Control-Plane"]}}
        for node in mongo_node().find(query):
            ret_val.append(cls.schema.load(node))
        return ret_val

    @classmethod
    def load_all_from_db(cls) -> List['Node']:
        ret_val = []
        for node in mongo_node().find({}):
            ret_val.append(cls.schema.load(node))
        return ret_val

    @classmethod
    def load_nodes_from_request(cls, payload: List[Dict]) -> List['Node']:
        results = []
        for node in payload:
            results.append(cls.schema.load(node))
        return results

    @classmethod
    def load_node_from_request(cls, payload: Dict) -> 'Node':
        return cls.schema.load(payload)  # type: ignore

    def post_validation(self):
        """
        These are other validation performed that cannot be done through marshmallow.
        """
        exc = PostValidationError()
        servers = self.load_all_servers_from_db()

        if self.node_type == "Server" and self.deployment_type == "Virtual":
            for server in servers:
                if server.deployment_type == "Virtual":
                    if server.virtual_cpu != self.virtual_cpu:
                        exc.append_error("CPU Cores must match {} resources.  Set CPU Core to {}\n".format(
                            server.hostname, server.virtual_cpu))

                    if server.virtual_mem != self.virtual_mem:
                        exc.append_error("Memory must match {} resources.  Set Memory to {}\n".format(
                            server.hostname, server.virtual_mem))

        if exc.has_errors():
            raise exc


class JobSchema(Schema):
    _id = marsh_fields.Str()
    message = marsh_fields.Str(required=False, allow_none=True)
    pending = marsh_fields.Bool()
    complete = marsh_fields.Bool()
    inprogress = marsh_fields.Bool()
    error = marsh_fields.Bool()
    name = marsh_fields.Str(required=True)
    description = marsh_fields.Str(required=False, allow_none=True)
    node_id = marsh_fields.Str()
    job_id = marsh_fields.Str(required=False, allow_none=True)
    exec_type = marsh_fields.Str(required=False, allow_none=True)

    @post_load
    def create_job(self, data: Dict, many: bool, partial: bool):
        return NodeJob(**data)


class NodeJob(Model):
    schema = JobSchema()
    DTO = KIT_SETUP_NS.model('NodeJob', {
        "message": fields.String(required=False, example="done", description="The status of the job."),
        "pending": fields.Boolean(example="True", description="True or False if the job is pending."),
        "complete": fields.Boolean(example="True", description="True or False if the job is complete."),
        "inprogress": fields.Boolean(example="True", description="True or False if the job is in-progress."),
        "error": fields.Boolean(example="True", description="True or False if the job failed."),
        "description": fields.String(required=False, example="Installing RHEL8", description="The name of the job."),
        "name": fields.String(required=True, example="Installing RHEL8", description="The name of the job."),
        "node_id": fields.String(required=True, example="a6141725669c4454829d9f71a34bbcac", description="The node id."),
        "job_id": fields.String(required=False),
        "exec_type": fields.String(required=False, description="The execution type."),
    })

    def __init__(self, message: str, name: str,
                 node_id: str,
                 pending: bool,
                 complete: bool,
                 inprogress: bool,
                 error: bool,
                 description: str,
                 job_id: str = None,
                 _id: str = None,
                 exec_type: str = None):
        self._id = _id or uuid.uuid4().hex
        self.message = message
        self.name = name
        self.node_id = node_id
        self.pending = pending
        self.complete = complete
        self.inprogress = inprogress
        self.error = error
        self.description = description
        self.job_id = job_id
        self.exec_type = exec_type

    def save_to_db(self):
        mongo_jobs().find_one_and_replace(
            {"_id": self._id}, self.schema.dump(self), upsert=True)

    def set_execution_type(self, exec_type: str):
        self.exec_type = exec_type

    def set_job_state(self, job_id: str = None) -> None:
        if self.name == JOB_DEPLOY:
            self.set_inprogress(job_id=job_id)

        if self.name == JOB_PROVISION or self.name == JOB_CREATE:
            job_deploy = NodeJob.load_job_by_node_id(self.node_id, JOB_DEPLOY)
            if job_deploy:
                job_deploy.set_pending()

        if self.name == JOB_PROVISION:
            self.set_inprogress(job_id=job_id)

        if self.name == JOB_CREATE:
            self.set_inprogress(job_id=job_id)
            job_prov = NodeJob.load_job_by_node_id(self.node_id, JOB_PROVISION)
            if job_prov:
                job_prov.set_pending()

    def set_pending(self) -> None:
        self.pending = True
        self.complete = False
        self.inprogress = False
        self.error = False
        self.message = None
        self.job_id = None
        self.save_to_db()

    def set_inprogress(self, job_id: str = None) -> None:
        self.pending = False
        self.inprogress = True
        self.complete = False
        self.error = False
        self.message = None
        if job_id:
            self.job_id = job_id
        self.save_to_db()

    def set_complete(self) -> None:
        self.complete = True
        self.pending = False
        self.inprogress = False
        self.error = False
        self.message = None
        self.save_to_db()

    def set_error(self, message: str = None) -> None:
        self.error = True
        self.pending = False
        self.inprogress = False
        self.complete = False
        self.message = message
        self.save_to_db()

    @classmethod
    def create_remove_node_job(cls, node: Node, job_id: str) -> None:
        mongo_jobs().delete_many({"node_id": node._id})
        removeJob = NodeJob(node_id=node._id, job_id=job_id, description="Removing Node", name=JOB_REMOVE, pending=False,
                            error=False, inprogress=True, complete=False, message=None)
        removeJob.save_to_db()

    @classmethod
    def load_job_by_node(cls, node: Node, job_name: str) -> Model:
        job = mongo_jobs().find_one(
            {"node_id": node._id, "name": job_name})  # type: NodeJob
        if job:
            return cls.schema.load(job)
        return None

    @classmethod
    def load_job_by_node_id(cls, node_id: str, job_name: str) -> Model:
        job = mongo_jobs().find_one(
            {"node_id": node_id, "name": job_name})  # type: NodeJob
        if job:
            return cls.schema.load(job)
        return None

    @classmethod
    def load_jobs_by_hostname(cls, hostname: str) -> List[Model]:
        query = {"hostname": hostname}
        node = mongo_node().find(query)  # type: Node
        results = []
        for job in mongo_jobs().find({"node_id": node._id}):
            results.append(cls.schema.load(job))
        return results

    @classmethod
    def load_jobs_by_node(cls, node: Node) -> List[Model]:
        results = []
        for job in mongo_jobs().find({"node_id": node._id}):
            results.append(cls.schema.load(job))
        return results

    @classmethod
    def load_jobs_by_node_id(cls, node_id: str) -> List[Model]:
        results = []
        for job in mongo_jobs().find({"node_id": node_id}):
            results.append(cls.schema.load(job))
        return results

    @classmethod
    def load_jobs_by_job_id(cls, node_id: str) -> Model:
        ret_val = mongo_jobs().find_one({"job_id": node_id})
        if ret_val:
            return cls.schema.load(ret_val)
        return None

    @classmethod
    def load_all_jobs(cls) -> List[Model]:
        results = []
        for job in mongo_jobs().find():
            results.append(cls.schema.load(job))
        return results


class ControlPlaneInventoryGenerator:
    """
    The Esxi Inventory generator class.
    """

    def __init__(self, nodes):
        self._template_ctx = nodes

    def generate(self) -> None:
        """
        Generates the Kickstart inventory file in
        :return:
        """
        template = JINJA_ENV.get_template('control_plane.yml')
        cp_template = template.render(template_ctx=self._template_ctx)

        if not os.path.exists(str(CORE_DIR / 'playbooks/inventory')):
            os.makedirs(str(CORE_DIR / 'playbooks/inventory'))

        with open(str(CORE_DIR / 'playbooks/inventory/control_plane.yml'), "w") as settings_file:
            settings_file.write(cp_template)


class NodeInventoryGenerator:
    """
    The KitInventory generator class
    """

    def __init__(self, nodes: Dict):
        self._template_ctx = nodes
        self._servers_list = get_servers_from_list(self._template_ctx["nodes"])
        self._sensors_list = get_sensors_from_list(self._template_ctx["nodes"])

    def _set_sensor_type_counts(self) -> None:
        """
        Set sensor type counts.

        :return: None
        """
        server_count, sensor_count, control_plane_count = server_and_sensor_count(
            self._template_ctx["nodes"])
        self._template_ctx["server_count"] = server_count
        self._template_ctx["sensor_count"] = sensor_count
        self._template_ctx["control_plane_count"] = control_plane_count

    def _set_reservations(self) -> None:
        sensor_index_offset = 0
        server_index_offset = 0
        for index, node in enumerate(self._template_ctx["nodes"]):
            if node["node_type"] == NODE_TYPES.sensor.value:
                node["reservations"] = self._sensor_res.get_node_reservations(
                    index - sensor_index_offset)
                server_index_offset += 1
            elif node["node_type"] == NODE_TYPES.server.value or node["node_type"] == NODE_TYPES.service_node.value:
                node["reservations"] = self._server_res.get_node_reservations(
                    index - server_index_offset)
                sensor_index_offset += 1

    def _set_defaults(self) -> None:
        """
        Sets the defaults for fields that need to be set before template rendering.

        :return:
        """
        self._set_sensor_type_counts()

        if "remove_node" not in self._template_ctx:
            self._template_ctx["remove_node"] = ''

    def generate(self) -> None:
        """
        Generates the Kickstart inventory file in
        :return:
        """
        self._set_defaults()

        template = JINJA_ENV.get_template('nodes.yml')
        kit_template = template.render(template_ctx=self._template_ctx)
        if not os.path.exists(str(CORE_DIR / 'playbooks/inventory')):
            os.makedirs(str(CORE_DIR / 'playbooks/inventory'))

        with open(str(CORE_DIR / 'playbooks/inventory/nodes.yml'), "w") as kit_file:
            kit_file.write(kit_template)


class MIPNodesInventoryGenerator:
    def __init__(self, mips: Dict):
        self._template_ctx = mips

    def _map_mip_model(self) -> None:
        for node in self._template_ctx["mips"]:
            if node["pxe_type"] == "SCSI/SATA/USB":
                node["model"] = "SCSI/SATA/USB"
                node["pxe_type"] = "UEFI"

            elif node["pxe_type"] == "NVMe":
                node["model"] = "NVMe"
                node["pxe_type"] = "UEFI"

    def generate(self) -> None:
        self._map_mip_model()
        template = JINJA_ENV.get_template('mip_nodes.yml')
        mip_nodes_template = template.render(template_ctx=self._template_ctx)

        if not os.path.exists(str(MIP_DIR / 'inventory')):
            os.makedirs(str(MIP_DIR / 'inventory'))

        with open(str(MIP_DIR / 'inventory/mip_nodes.yml'), "w") as mip_nodes_file:
            mip_nodes_file.write(mip_nodes_template)
