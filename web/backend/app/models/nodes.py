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
from app.models.settings.kit_settings import GeneralSettingsForm
from app.utils.collections import Collections, get_collection, mongo_jobs
from app.utils.constants import (CORE_DIR, DEPLOYMENT_TYPES, JOB_CREATE,
                                 JOB_DEPLOY, JOB_PROVISION, JOB_REMOVE,
                                 MAC_BASE, MIP_DIR, NODE_TYPES,
                                 TEMPLATE_DIR)
from app.utils.namespaces import KIT_SETUP_NS
from flask_restx import fields
from jinja2 import Environment, FileSystemLoader, select_autoescape
from marshmallow import Schema, ValidationError
from marshmallow import fields as marsh_fields
from marshmallow import post_load, validate, validates
from pymongo import ReturnDocument
from pyrsistent import s
from randmac import RandMac

JINJA_ENV = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(['html', 'xml'])
)

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
                              "Special characters are not allowed with the exception of dashes (IE -).".format(fqdn_length))


def _generate_minio_inventory():
    ctx = {"nodes": []}
    minio_node = Node.load_minio_from_db()  # type: List[Node]
    if minio_node:
        ctx = {"nodes": [minio_node.to_dict()]}

    generic_template_generator = GenericInventoryGenerator(ctx)
    generic_template_generator.generate("minio.yml")


def _generate_inventory():
    _generate_nodes_inventory()
    _generate_cp_inventory()
    _generate_mip_nodes_inventory()
    _generate_minio_inventory()


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
    generic_template_generator = GenericInventoryGenerator({"nodes": nodes_list})
    generic_template_generator.generate('control_plane.yml')


def _generate_mip_nodes_inventory():
    mips_list = []
    mips = Node.load_mips_from_db()
    for mip_var in mips:
        mips_list.append(mip_var.to_dict())
    mip_kickstart_generator = MIPNodesInventoryGenerator({"mips": mips_list})
    mip_kickstart_generator.generate()


class Command(Model):
    def __init__(self, command: str, cwd_dir: str, job_name: str, job_id: str):
        self.command = command
        self.cwd_dir = cwd_dir
        self.job_name = job_name
        self.job_id = job_id


class NodeSchema(Schema):
    _id = marsh_fields.Str()
    hostname = marsh_fields.Str(required=True)
    ip_address = marsh_fields.IPv4(required=True)
    mac_address = marsh_fields.Str(required=False, allow_none=True)
    raid0_override = marsh_fields.Bool(required=False, allow_none=True)
    node_type = marsh_fields.Str(required=False, validate=validate.OneOf(
        ["Server", "Sensor", "Undefined", "Control-Plane", "MinIO", "MIP", "Service"]))
    error = marsh_fields.Str()
    deviceFacts = marsh_fields.Dict()
    deployment_type = marsh_fields.String(required=False, allow_none=True)
    vpn_status = marsh_fields.Bool(required=False, allow_none=True)
    virtual_cpu = marsh_fields.Integer(required=False, allow_none=True)
    virtual_mem = marsh_fields.Integer(required=False, allow_none=True)
    virtual_os = marsh_fields.Integer(required=False, allow_none=True)
    virtual_data = marsh_fields.Integer(required=False, allow_none=True)

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

    @validates("mac_address")
    def validate_mac_address(self, value: str):
        if value:
            validate_mac_address_fn(value)

    @validates("hostname")
    def validate_hostname(self, value: str):
        validate_hostname_fn(value)


class Node(Model):
    schema = NodeSchema()
    DTO = KIT_SETUP_NS.model('Node', {
        "hostname": fields.String(required=True, example="server1", description="The hostname of the node."),
        "ip_address": fields.String(required=True, example="10.40.12.146", description="The static IP Address of the node."),
        "mac_address": fields.String(required=True, example="00:0a:29:6e:7f:ff", description="The MAC Address of the node's management interface."),
        "raid0_override": fields.Boolean(required=True, default=False, description="When set to true the Data drive / parition is forced to be in RAID 0."),
        "node_type": fields.String(example="Server", description="During Kit configuration this gets set to either Server or Sensor"),
        "deviceFacts": fields.Nested(DeviceFacts.DTO, default={}),
        "deployment_type": fields.String(example="Baremetal or Virtual"),
        "vpn_status": fields.Boolean(required=True, default=False, description="When the Node is connected or disconnected from vpn"),

        "virtual_cpu": fields.Integer(description="The number of virtual CPU cores."),
        "virtual_mem": fields.Integer(description="The amount of system ram in GB."),
        "virtual_os": fields.Integer(description="The size of the OS drive in GB."),
        "virtual_data": fields.Integer(description="The size of the data drive in GB.")
    })

    def __init__(self,
                 hostname: str = None,
                 ip_address: str = None,
                 mac_address: str = None,
                 raid0_override: bool = None,
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
        self.hostname = self._set_hostname(hostname)
        self.ip_address = ip_address
        self.mac_address = self._set_mac_address(mac_address, node_type)
        self.raid0_override = raid0_override
        # Kit specific fields add later on
        self.node_type = node_type
        self.deviceFacts = deviceFacts
        self.deployment_type = deployment_type
        self.vpn_status = vpn_status

        self.virtual_cpu = virtual_cpu
        self.virtual_mem = virtual_mem
        self.virtual_os = virtual_os
        self.virtual_data = virtual_data

    def _set_hostname(self, hostname: str) -> str:
        settings = GeneralSettingsForm.load_from_db()
        return f"{hostname}.{settings.domain}" if not hostname.endswith(
            settings.domain) else hostname

    def _set_mac_address(self, mac_address, node_type: str) -> str:
        return str(RandMac(MAC_BASE, True)).strip(
            "'") if not mac_address and node_type == NODE_TYPES.mip.value else mac_address

    def update_kit_specific_fields(self, payload: Dict):
        self.node_type = payload["node_type"]
        self.deviceFacts = payload["deviceFacts"]
        _generate_inventory()

    def create(self):
        # Create initial node
        doc = get_collection(Collections.NODES).find_one_and_replace({"_id": self._id}, self.schema.dump(
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
            installjob = NodeJob(node_id=node._id, job_id=None, description="Installing RHEL8", name=JOB_PROVISION, pending=True,
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

        get_collection(Collections.NODES).find_one_and_replace(
            {"_id": self._id}, self.schema.dump(self), upsert=True)
        _generate_inventory()

    def find_one_and_update(self) -> Model:
        node = get_collection(Collections.NODES).find_one_and_update({"hostname": self.hostname},
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
        get_collection(Collections.NODES).drop()
        _generate_inventory()

    def delete(self) -> None:
        mongo_jobs().delete_many({"node_id": self._id})
        get_collection(Collections.NODES).delete_one({"_id": self._id})
        _generate_inventory()

    @classmethod
    def load_from_db(cls, node_ids: List[str]) -> List['Node']:
        ret_val = []
        for node in get_collection(Collections.NODES).find({"_id": {"$in": node_ids}}):
            ret_val.append(cls.schema.load(node))

        return ret_val

    @classmethod
    def load_from_db_using_hostname(cls, hostname: str) -> 'Node':
        node = get_collection(Collections.NODES).find_one({"hostname": hostname})
        if node:
            return cls.schema.load(node)
        return {}

    @classmethod
    def load_from_db_using_hostname_with_jobs(cls, hostname: str) -> dict:
        node = get_collection(Collections.NODES).find_one({"hostname": hostname})
        if node:
            job_list = []
            for job in mongo_jobs().find({"node_id": node["_id"]}):
                job_list.append(job)
            node["jobs"] = job_list
            return node
        return {}

    @classmethod
    def load_control_plane_from_db(cls) -> List['Node']:
        ret_val = []
        query = {"node_type": "Control-Plane"}
        for node in get_collection(Collections.NODES).find(query):
            ret_val.append(cls.schema.load(node))
        return ret_val

    @classmethod
    def load_mips_from_db(cls) -> List[Model]:
        ret_val = []
        query = {"node_type": "MIP"}
        for node in get_collection(Collections.NODES).find(query):
            ret_val.append(cls.schema.load(node))
        return ret_val

    @classmethod
    def load_deployable_mips_from_db(cls) -> List['Node']:
        ret_val = []
        query = {"node_type": "MIP"}
        for node in get_collection(Collections.NODES).find(query):
            ret_val.append(cls.schema.load(node))
        for node in ret_val:
            job = NodeJob.load_job_by_node(node, JOB_DEPLOY)
            if (job.pending or job.error):
                ret_val.remove(node)
        return ret_val

    @classmethod
    def load_minio_from_db(cls) -> 'Node':
        query = {"node_type": NODE_TYPES.minio.value}
        node = get_collection(Collections.NODES).find_one(query)
        if node:
            return cls.schema.load(node)
        return None

    @classmethod
    def _load_node_types_from_db(cls, node_types: List[str]) -> List['Node']:
        ret_val = []
        query = {"node_type": {"$in": node_types}}
        for node in get_collection(Collections.NODES).find(query):
            ret_val.append(cls.schema.load(node))
        return ret_val

    @classmethod
    def load_all_servers_sensors_from_db(cls) -> List['Node']:
        node_types = [NODE_TYPES.server.value, NODE_TYPES.sensor.value, NODE_TYPES.service_node.value]
        return cls._load_node_types_from_db(node_types)

    @classmethod
    def load_all_servers_from_db(cls) -> List['Node']:
        node_types = [NODE_TYPES.server.value]
        return cls._load_node_types_from_db(node_types)

    @classmethod
    def load_all_sensors_from_db(cls) -> List['Node']:
        node_types = [NODE_TYPES.sensor.value]
        return cls._load_node_types_from_db(node_types)

    @classmethod
    def load_dip_nodes_from_db(cls) -> List['Node']:
        node_types = [NODE_TYPES.server.value, NODE_TYPES.sensor.value,
                      NODE_TYPES.service_node.value, NODE_TYPES.control_plane.value]
        return cls._load_node_types_from_db(node_types)

    @classmethod
    def load_stateful_dip_nodes_from_db(cls) -> List['Node']:
        node_types = [NODE_TYPES.server.value, NODE_TYPES.sensor.value,
                      NODE_TYPES.service_node.value, NODE_TYPES.control_plane.value,
                      NODE_TYPES.minio.value]
        return cls._load_node_types_from_db(node_types)

    @classmethod
    def load_all_from_db(cls) -> List['Node']:
        ret_val = []
        for node in get_collection(Collections.NODES).find({}):
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

    @classmethod
    def load_from_request(cls, payload: Dict) -> 'Node':
        new_node = cls.schema.load(payload)
        return new_node

    def post_validation(self):
        """
        These are other validation performed that cannot be done through marshmallow.
        """
        exc = PostValidationError()
        servers = self.load_all_servers_from_db()

        if self.node_type == NODE_TYPES.server.value and self.deployment_type == "Virtual":
            for server in servers:
                if server.deployment_type == "Virtual":
                    if server.virtual_cpu != self.virtual_cpu:
                        exc.append_error("cpu", "CPU Cores must match {} resources.  Set CPU Core to {}\n".format(
                            server.hostname, server.virtual_cpu))

                    if server.virtual_mem != self.virtual_mem:
                        exc.append_error("memory", "Memory must match {} resources.  Set Memory to {}\n".format(
                            server.hostname, server.virtual_mem))

        if self.node_type == NODE_TYPES.minio.value:
            if self.load_minio_from_db():
                exc.append_error("minio", "MinIO has already been added. Only one is allowed.")

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
        node = get_collection(Collections.NODES).find(query)  # type: Node
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


class GenericInventoryGenerator:
    """
    The Esxi Inventory generator class.
    """

    def __init__(self, nodes):
        self._template_ctx = nodes

    def generate(self, template_file_name: str) -> None:
        """
        Generates the Kickstart inventory file in
        :return:
        """
        template = JINJA_ENV.get_template(template_file_name)
        generic_template = template.render(template_ctx=self._template_ctx)

        if not os.path.exists(str(CORE_DIR / 'playbooks/inventory')):
            os.makedirs(str(CORE_DIR / 'playbooks/inventory'))

        with open(str(CORE_DIR / f'playbooks/inventory/{template_file_name}'), "w") as settings_file:
            settings_file.write(generic_template)


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

    def generate(self) -> None:
        template = JINJA_ENV.get_template('mip_nodes.yml')
        mip_nodes_template = template.render(template_ctx=self._template_ctx)

        if not os.path.exists(str(MIP_DIR / 'inventory')):
            os.makedirs(str(MIP_DIR / 'inventory'))

        with open(str(MIP_DIR / 'inventory/mip_nodes.yml'), "w") as mip_nodes_file:
            mip_nodes_file.write(mip_nodes_template)
