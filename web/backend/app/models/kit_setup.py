"""
https://flask-restplus.readthedocs.io/en/0.9.2/example.html

"""
import re
import uuid

from app import api, conn_mng, rq_logger
from app.models import Model, DBModelNotFound, PostValidationError
from app.models.device_facts import DeviceFacts
from ipaddress import IPv4Address
from flask_restplus import fields
from flask_restplus.fields import Nested

from marshmallow import Schema, post_load, pre_load, validate, validates, ValidationError
from marshmallow import fields as marsh_fields
from pymongo import ReturnDocument
from pymongo.results import InsertOneResult
from app.utils.constants import KICKSTART_ID, ADDNODE_ID, KIT_ID
from app.utils.utils import encode_password, decode_password
from typing import List, Dict


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


def validate_password_stigs(value: str) -> None:
    """
    Raises an exception when there are password violations
    """
    errors = []
    if len(value) < 15:
        errors.append("The password must be at least 15 characters.")

    if not re.search("[0-9]", value):
        errors.append("The password must have at least 1 digit.")

    if not re.search("[a-z]", value):
        errors.append("The password must have at least 1 lowercase letter.")

    if not re.search("[A-Z]", value):
        errors.append("The password must have at least 1 uppercase letter.")

    if not re.search("[^0-9a-zA-Z]", value):
        errors.append("The password must have at least 1 symbol.")

    if len(set(value)) < 8:
        errors.append("The password must have at least 8 unique characters.")

    if has_consecutive_chars(value):
        errors.append("The password must not have 3 consecutive characters that are the same.")

    if len(errors) > 0:
        raise ValidationError(errors)


def validate_mac_address_fn(value: str):
    pattern = '^([0-9a-fA-F]{2}[:]){5}([0-9a-fA-F]{2})$'
    if not re.match(pattern, value):
        raise ValidationError("{} is not a valid MAC address it must be in xx:xx:xx:xx:xx:xx format. "
                                "Also, MAC addresses can only contain upper and lower case letters A "
                                "through F and numbers.".format(value))


def validate_hostname_fn(value: str):
    pattern = "^[a-z]([a-z0-9-.]){4,51}$"
    if not re.match(pattern, value):
        raise ValidationError("Hostname must be alphanumeric, less than 51 characters. "
                                " Special characters are not allowed with the exception of dashes (IE -).")


class NodeBaseModel(Model):

    @classmethod
    def load_from_db(cls, node_ids: List[str]) -> List[Model]:
        ret_val = []
        for node in conn_mng.mongo_node.find({"_id": { "$in": node_ids} }):
            ret_val.append(cls.schema.load(node))

        return ret_val

    @classmethod
    def load_from_request(cls, payload: Dict) -> Model:
        new_node = cls.schema.load(payload) # type: DIPKickstartForm
        return new_node


class NodeSchema(Schema):
    _id = marsh_fields.Str()
    # TODO we need more validation here
    hostname = marsh_fields.Str(required=True)
    ip_address = marsh_fields.IPv4(required=True)
    mac_address = marsh_fields.Str(required=True)
    data_drives = marsh_fields.List(marsh_fields.Str(required=True), required=False)
    boot_drives = marsh_fields.List(marsh_fields.Str(required=True), required=False)
    raid_drives = marsh_fields.List(marsh_fields.Str(required=False), required=False)
    pxe_type = marsh_fields.Str(required=True, validate=validate.OneOf(["BIOS", "UEFI"]))
    os_raid = marsh_fields.Bool(required=True)
    os_raid_root_size = marsh_fields.Integer(required=False)
    node_type = marsh_fields.Str(required=False, validate=validate.OneOf(["Server", "Sensor", "Undefined"]))
    error = marsh_fields.Str()
    is_master_server = marsh_fields.Bool()
    deviceFacts = marsh_fields.Dict()

    @post_load
    def create_Node(self, data: Dict, many: bool, partial: bool):
        return Node(**data)

    @classmethod
    def validate_drive(cls, drives: List[str], label: str):
        pattern = "^([a-z]{2,3}[0-9]{0,3})(,[a-z]{2,3}[0-9]{0,3})*$"
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
        validate_mac_address_fn(value)

    @validates("hostname")
    def validate_hostname(self, value: str):
        validate_hostname_fn(value)


class Node(NodeBaseModel):
    schema = NodeSchema()
    DTO = api.model('Node', {
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
        "error": fields.String(),
        "deviceFacts": fields.Nested(DeviceFacts.DTO, default={}),
        "is_master_server": fields.Boolean(description="When node type is set to Server this is a required field.  At least one server but be the designated master.")
    })

    def __init__(self,
                 hostname: str,
                 ip_address: str,
                 mac_address: str,
                 pxe_type: str, os_raid: bool,
                 data_drives: List[str]=[],
                 boot_drives: List[str]=[],
                 raid_drives: List[str]=[],
                 os_raid_root_size: int=0,
                 node_type: str="Undefined",
                 error: str="",
                 is_master_server: bool=False,
                 deviceFacts: Dict={},
                 _id: str=None):
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
        self.error = error
        self.is_master_server = is_master_server
        self.deviceFacts = deviceFacts

    def update_kit_specific_fields(self, payload: Dict):
        self.node_type = payload["node_type"]
        try:
            self.is_master_server = payload["is_master_server"]
        except KeyError:
            pass
        self.deviceFacts = payload["deviceFacts"]

    def save_to_db(self, domain: str=None):
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

        conn_mng.mongo_node.find_one_and_replace({"_id": self._id}, self.schema.dump(self), upsert=True)

    def find_one_and_update(self) -> Model:
        node = conn_mng.mongo_node.find_one_and_update({"hostname": self.hostname},
                                                       {"$set": {
                                                           "node_type": self.node_type,
                                                           "error": self.error,
                                                           "is_master_server": self.is_master_server,
                                                           "deviceFacts": self.deviceFacts
                                                       }},
                                                       return_document=ReturnDocument.AFTER)
        return self.schema.load(node)

    @classmethod
    def delete_all_from_db(cls):
        conn_mng.mongo_node.drop()

    @classmethod
    def load_from_db(cls, node_ids: List[str]) -> List[Model]:
        ret_val = []
        for node in conn_mng.mongo_node.find({"_id": { "$in": node_ids} }):
            ret_val.append(cls.schema.load(node))

        return ret_val

    @classmethod
    def load_from_db_using_hostname(cls, hostname: str) -> List[Model]:
        node = conn_mng.mongo_node.find_one({"hostname": hostname })
        return cls.schema.load(node)

    @classmethod
    def load_from_request(cls, payload: Dict) -> Model:
        new_node = cls.schema.load(payload) # type: DIPKickstartForm
        return new_node


class MIPSchema(Schema):
    _id = marsh_fields.Str()
    # TODO we need more validation here
    hostname = marsh_fields.Str(required=True)
    ip_address = marsh_fields.IPv4(required=True)
    mac_address = marsh_fields.Str(required=True)
    pxe_type = marsh_fields.Str(required=True, validate=validate.OneOf(["SCSI/SATA/USB", "NVMe"]))

    @post_load
    def create_MIP(self, data: Dict, many: bool, partial: bool):
        return MIP(**data)

    @validates("mac_address")
    def validate_mac_address(self, value: str):
        validate_mac_address_fn(value)

    @validates("hostname")
    def validate_hostname(self, value: str):
        validate_hostname_fn(value)


class MIP(NodeBaseModel):
    schema = MIPSchema()
    DTO = api.model('MIP', {
        "hostname": fields.String(required=True, example="server1", description="The hostname of the node."),
        "ip_address": fields.String(required=True, example="10.40.12.146", description="The static IP Address of the MIP."),
        "mac_address": fields.String(required=True, example="00:0a:29:6e:7f:ff", description="The MAC Address of the MIP's management interface."),
        "pxe_type": fields.String(required=True, example="SCSI/SATA/USB or NVMe", description="Can be either NVMe or SCSI/SATA/USB depending on the MIPs model number."),
    })

    def __init__(self, hostname: str, ip_address: str,
                 mac_address: str,
                 pxe_type: str, _id: str=None):
        self._id = _id or uuid.uuid4().hex
        self.hostname = hostname
        self.ip_address = ip_address
        self.mac_address = mac_address
        self.pxe_type = pxe_type

    def save_to_db(self):
        conn_mng.mongo_node.find_one_and_replace({"_id": self._id}, self.schema.dump(self), upsert=True)


class AddNodeWizardSchema(Schema):
    _id = marsh_fields.Str()
    kickstart_node = marsh_fields.Nested(NodeSchema)
    step = marsh_fields.Integer()

    @post_load
    def create_wizard(self, data: Dict, many: bool, partial: bool):
        return AddNodeWizard(**data)


class AddNodeWizard(Model):
    schema = AddNodeWizardSchema()
    DTO = api.model('AddNodeWizard', {
        'step': fields.Integer(required=False, example=3),
        'kickstart_node': fields.Nested(Node.DTO, required=False)
    })

    def __init__(self,
                 step: int,
                 kickstart_node: Node=None,
                 _id: str=None):
        self._id = _id or ADDNODE_ID
        self.kickstart_node = kickstart_node
        self.step = step

    @classmethod
    def load_from_db(cls, query: Dict={"_id": ADDNODE_ID}) -> Model:
        mongo_document = conn_mng.mongo_add_node_wizard.find_one(query)
        if mongo_document:
            node_id = mongo_document.pop("kickstart_node") # str
            wizard = cls.schema.load(mongo_document, partial=("kickstart_node",))
            nodes = Node.load_from_db([node_id])
            wizard.kickstart_node = nodes[0]
            return wizard

        raise DBModelNotFound("AddNodeWizard has not been saved yet.")

    def save_to_db(self):
        wizard = self.schema.dump(self)
        wizard["kickstart_node"] = self.kickstart_node._id
        conn_mng.mongo_add_node_wizard.find_one_and_replace({"_id": ADDNODE_ID},
                                                             wizard,
                                                             upsert=True)  # type: InsertOneResult

    @staticmethod
    def delete_from_db():
        conn_mng.mongo_add_node_wizard.delete_one({"_id": ADDNODE_ID})


class DIPKitSchema(Schema):
    _id = marsh_fields.Str()
    kubernetes_services_cidr = marsh_fields.IPv4(required=True)
    nodes = marsh_fields.List(marsh_fields.Nested(NodeSchema))
    complete = marsh_fields.Bool()

    @post_load
    def create_kit(self, data: Dict, many: bool, partial: bool):
        return DIPKitForm(**data)


class DIPKitForm(Model):
    schema = DIPKitSchema()
    DTO = api.model('DIPKitForm', {
        'kubernetes_services_cidr': fields.String(example="10.40.12.64", required=True,
                                                  description="The /27 IP Address block that will be used. EX: 10.40.12.64 - 95"),
        'complete': fields.Boolean(default=False, description="When the kit has completed this will be set to True.  Should be set to False initally"),
        'nodes': fields.List(fields.Nested(Node.DTO, required=False), required=False)
    })

    def __init__(self,
                 kubernetes_services_cidr: IPv4Address,
                 nodes: List[Node]=[],
                 complete: bool=False,
                 _id: str=None):
        """
        remove_node: ""
        """
        self._id = _id or KIT_ID
        self.kubernetes_services_cidr = kubernetes_services_cidr
        self.complete = complete
        self.nodes = nodes

    @classmethod
    def load_from_request(cls, payload: Dict) -> Model:
        new_kit = cls.schema.load(payload) # type: DIPKitForm
        return new_kit

    @classmethod
    def load_from_db(cls, query: Dict={"_id": KIT_ID}) -> Model:
        mongo_document = conn_mng.mongo_kit.find_one(query)
        if mongo_document:
            node_ids = mongo_document.pop("nodes") # List[str]
            kit = cls.schema.load(mongo_document, partial=("nodes",))
            nodes = Node.load_from_db(node_ids)
            kit.nodes = nodes
            return kit

        raise DBModelNotFound("DIPKitForm has not been saved yet.")

    @classmethod
    def mark_complete_and_save(cls, query: Dict={"_id": KIT_ID}):
        kit = cls.load_from_db(query)
        kit.complete = True
        kit.save_to_db()

    def save_to_db(self):
        """
        Saves Kit to mongo database.

        :param kickstart_form: Dictionary for the Kickstart form
        """
        new_nodes = []
        for node in self.nodes:
            new_nodes.append(node.find_one_and_update())

        kit = self.schema.dump(self)
        kit["nodes"] = [node._id for node in new_nodes]
        conn_mng.mongo_kit.find_one_and_replace({"_id": KIT_ID},
                                                 kit,
                                                 upsert=True)  # type: InsertOneResult

    @staticmethod
    def delete_from_db():
        conn_mng.mongo_kit.delete_one({"_id": KIT_ID})

    def post_validation(self):
        exc = PostValidationError()
        for node in self.nodes:
            if not node.deviceFacts or len(node.deviceFacts) == 0:
                exc.append_error("{} does not have deviceFacts.".format(node.hostname))

        if exc.has_errors():
            raise exc


class KickstartBase(Model):

    @classmethod
    def load_from_request(cls, payload: Dict) -> Model:
        new_kickstart = cls.schema.load(payload) # type: DIPKickstartForm
        return new_kickstart

    def _compare_hostnames(self, node: Node, cmp_node: Node, exc: PostValidationError):
        if node.hostname == cmp_node.hostname:
            exc.append_error("Two or more of your nodes have the same hostname.")

    def _compare_ips(self, node: Node, cmp_node: Node, exc: PostValidationError):
        if node.ip_address == cmp_node.ip_address:
            exc.append_error("{} and {} have the same IP Address.".format(node.hostname, cmp_node.hostname))

    def _compare_macs(self, node: Node, cmp_node: Node, exc: PostValidationError):
        if node.mac_address == cmp_node.mac_address:
            exc.append_error("{} and {} have the same MAC Address.".format(node.hostname, cmp_node.hostname))

    def _common_compares(self) -> PostValidationError:
        exc = PostValidationError()
        if len(self.nodes) > 1:
            for i in range(len(self.nodes)):
                for j in range(i + 1, len(self.nodes)):
                    self._compare_hostnames(self.nodes[i], self.nodes[j], exc)
                    self._compare_ips(self.nodes[i], self.nodes[j], exc)
                    self._compare_macs(self.nodes[i], self.nodes[j], exc)
        return exc

class DIPKickstartSchema(Schema):
    _id = marsh_fields.Str()
    controller_interface = marsh_fields.IPv4(required=True)
    root_password = marsh_fields.Str(required=True)
    netmask = marsh_fields.IPv4(required=True)
    gateway = marsh_fields.IPv4(required=True)
    domain = marsh_fields.Str(required=True)
    upstream_dns = marsh_fields.IPv4(required=False)
    upstream_ntp = marsh_fields.IPv4(required=False)
    dhcp_range = marsh_fields.IPv4(required=True)
    nodes = marsh_fields.List(marsh_fields.Nested(NodeSchema))

    @pre_load
    def remove_optional_ip_addresses(self, data, **kwargs):
        for key in ['upstream_dns', 'upstream_ntp']:
            if key in data and (data[key] == None or data[key] == ''):
                del data[key]
        return data

    @post_load
    def create_kickstart(self, data: Dict, many: bool, partial: bool):
        return DIPKickstartForm(**data)

    @validates("domain")
    def validate_domain(self, value: str):
        pattern = "^[a-z]([a-z0-9-]){2,51}$"
        if not re.match(pattern, value):
            raise ValidationError("Domain must be alphanumeric, less than 51 characters. "
                                  "Special characters are not allowed with the exception of dashes (IE -).")

    @validates("root_password")
    def validate_password(self, value: str):
        validate_password_stigs(value)


class DIPKickstartForm(KickstartBase):
    schema = DIPKickstartSchema()
    DTO = api.model('DIPKickstartForm', {
        'controller_interface': fields.String(example="10.40.12.145", required=True, description="The IP Address of the controller's management interface."),
        'root_password': fields.String(required=True, example="mypassword1!Afoobar", description="The root and ssh password for all the nodes in the kit."),
        'netmask': fields.String(required=True, example="255.255.255.0", description="The netmask of the Kit's network.", default="255.255.255.0"),
        'gateway': fields.String(required=True, example="10.40.12.1", description="The internal gateway IP Address for Kickstart."),
        'domain': fields.String(required=True, example="lan", description="The domain of the kit."),
        'upstream_dns': fields.String(required=False, example="10.10.101.11",
                                        description="This is the upstream DNS server that the controller uses for additional DNS lookups that are not on Kit."),
        'upstream_ntp': fields.String(required=False, example="10.10.101.11",
                                        description="This is the upstream NTP server where the controller will get its time from."),
        'dhcp_range': fields.String(required=True, example="10.40.12.153", description="The dhcp_range that is used for the kickstart process."),
        'nodes': fields.List(fields.Nested(Node.DTO, required=False), required=False)
    })

    def __init__(self, controller_interface: IPv4Address,
                 root_password: str, dhcp_range: IPv4Address,
                 netmask: IPv4Address, gateway: IPv4Address,
                 domain: str, nodes: List[Node]=[], _id: str=None,
                 upstream_dns: IPv4Address=IPv4Address("0.0.0.0"),
                 upstream_ntp: IPv4Address=IPv4Address("0.0.0.0")):
        self._id = _id or KICKSTART_ID
        self.controller_interface = controller_interface
        self.root_password = root_password
        self.netmask = netmask
        self.gateway = gateway
        self.domain = domain
        self.upstream_dns = upstream_dns
        self.upstream_ntp = upstream_ntp
        self.dhcp_range = dhcp_range
        self.nodes = nodes

    @classmethod
    def load_from_db(cls, query: Dict={"_id": KICKSTART_ID}) -> Model:
        mongo_document = conn_mng.mongo_kickstart.find_one(query)
        if mongo_document:
            node_ids = mongo_document.pop("nodes") # List[str]
            kickstart = cls.schema.load(mongo_document, partial=("nodes",))
            nodes = Node.load_from_db(node_ids)
            kickstart.nodes = nodes
            kickstart.root_password = decode_password(kickstart.root_password)
            return kickstart

        raise DBModelNotFound("Kickstart has not been saved yet.")

    def _do_optional_node_validations(self, exc: PostValidationError):
        for node in self.nodes:
            if node.os_raid:
                if len(node.raid_drives) == 0:
                    exc.append_error("When os_raid is set to true at least one raid_drives is required for {}.".format(node.hostname))
                if node.os_raid_root_size == 0:
                    exc.append_error("When os_raid is set to true, os_raid_root_size but be 1 or greater for {}.".format(node.hostname))
            else:
                if len(node.data_drives) == 0:
                    exc.append_error("When os_raid is set to false at least one data_drive is required for {}.".format(node.hostname))
                if len(node.boot_drives) == 0:
                    exc.append_error("When os_raid is set to false at least one boot_drive is required for {}.".format(node.hostname))

    def post_validation(self):
        """
        These are other validation performed that cannot be done through marshmallow.
        """
        exc = self._common_compares()

        if len(self.nodes) < 2:
            exc.append_error("Kickstart form submission require at least 2 nodes to be defined before submission.")

        self._do_optional_node_validations(exc)

        if exc.has_errors():
            raise exc

    def save_to_db(self, delete_kit: bool=False, delete_add_node_wizard: bool=False):
        """
        Saves Kickstart to mongo database.

        :param kickstart_form: Dictionary for the Kickstart form
        """
        self.root_password = encode_password(self.root_password)
        Node.delete_all_from_db()
        for node in self.nodes:
            node.save_to_db(self.domain)

        kickstart = self.schema.dump(self)
        kickstart["nodes"] = [node._id for node in self.nodes]
        conn_mng.mongo_kickstart.find_one_and_replace({"_id": KICKSTART_ID},
                                                      kickstart,
                                                      upsert=True)  # type: InsertOneResult
        self.root_password = decode_password(self.root_password)
        if delete_kit:
            DIPKitForm.delete_from_db()

        if delete_add_node_wizard:
            AddNodeWizard.delete_from_db()


class MIPKickstartSchema(Schema):
    _id = marsh_fields.Str()
    controller_interface = marsh_fields.IPv4(required=True)
    root_password = marsh_fields.Str(required=True)
    luks_password = marsh_fields.Str(required=True)
    netmask = marsh_fields.IPv4(required=True)
    gateway = marsh_fields.IPv4(required=True)
    dns = marsh_fields.IPv4(required=True)
    dhcp_range = marsh_fields.IPv4(required=True)
    nodes = marsh_fields.List(marsh_fields.Nested(MIPSchema))

    @post_load
    def create_kickstart(self, data: Dict, many: bool, partial: bool):
        return MIPKickstartForm(**data)

    @validates("root_password")
    def validate_password(self, value: str):
        validate_password_stigs(value)

    # TODO does this need to be stigs compliant?
    # @validates("luks_password")
    # def validate_password(self, value: str):
    #     validate_password_stigs(value)


class MIPKickstartForm(KickstartBase):
    schema = MIPKickstartSchema()
    DTO = api.model('MIPKickstartForm', {
        'controller_interface': fields.String(example="10.40.12.145", required=True, description="The IP Address of the controller's management interface."),
        'root_password': fields.String(required=True, example="mypassword1!Afoobar", description="The root and ssh password for all the MIPs in the kit."),
        'luks_password': fields.String(required=True, example="mypassword1!Afoobar", description="The drive encryption password for all the MIPs in the kit."),
        'netmask': fields.String(required=True, example="255.255.255.0", description="The netmask of the Kit's network.", default="255.255.255.0"),
        'gateway': fields.String(required=True, example="10.40.12.1", description="The internal gateway IP Address for Kickstart."),
        'dhcp_range': fields.String(required=True, example="10.40.12.153", description="The dhcp_range that is used for the kickstart process."),
        'dns': fields.String(required=True, example="10.40.12.1", description="The inital nameserver that is set on all the MIPs."),
        'nodes': fields.List(fields.Nested(MIP.DTO, required=False), required=False)
    })

    def __init__(self, controller_interface: IPv4Address,
                 root_password: str, luks_password: str,
                 dhcp_range: IPv4Address, dns: IPv4Address,
                 netmask: IPv4Address, gateway: IPv4Address,
                 nodes: List[MIP]=[], _id: str=None):
        self._id = _id or KICKSTART_ID
        self.controller_interface = controller_interface
        self.root_password = root_password
        self.luks_password = luks_password
        self.netmask = netmask
        self.gateway = gateway
        self.dhcp_range = dhcp_range
        self.dns = dns
        self.nodes = nodes

    def post_validation(self):
        """
        These are other validation performed that cannot be done through marshmallow.
        """
        exc = self._common_compares()
        if exc.has_errors():
            raise exc

    def save_to_db(self):
        """
        Saves Kickstart to mongo database.

        :param kickstart_form: Dictionary for the Kickstart form
        """
        self.luks_password = encode_password(self.luks_password)
        self.root_password = encode_password(self.root_password)
        Node.delete_all_from_db()
        for node in self.nodes:
            node.save_to_db()

        kickstart = self.schema.dump(self)
        kickstart["nodes"] = [node._id for node in self.nodes]
        conn_mng.mongo_kickstart.find_one_and_replace({"_id": KICKSTART_ID},
                                                      kickstart,
                                                      upsert=True)  # type: InsertOneResult
        self.luks_password = decode_password(self.luks_password)
        self.root_password = decode_password(self.root_password)

    @classmethod
    def load_from_db(cls, query: Dict={"_id": KICKSTART_ID}) -> Model:
        mongo_document = conn_mng.mongo_kickstart.find_one(query)
        if mongo_document:
            node_ids = mongo_document.pop("nodes") # List[str]
            kickstart = cls.schema.load(mongo_document, partial=("nodes",))
            nodes = MIP.load_from_db(node_ids)
            kickstart.nodes = nodes
            kickstart.root_password = decode_password(kickstart.root_password)
            return kickstart

        raise DBModelNotFound("Kickstart has not been saved yet.")
