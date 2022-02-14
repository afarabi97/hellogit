"""
Module hold constants that can be used for controllers or fabric files.
"""
from enum import Enum, auto
from pathlib import Path
from typing import Dict

SHARED_DIR = Path(__file__).parent  # type: Path
CORE_DIR = SHARED_DIR / "../../../../core"
STIGS_DIR = SHARED_DIR / "../../../../rhel8-stigs"
PLAYBOOK_DIR = CORE_DIR / "playbooks"
WEB_DIR = SHARED_DIR / "../../../"
TESTING_DIR = SHARED_DIR / "../../../../testing"
UPGRADES_DIR = SHARED_DIR / "../../../../upgrades"
AGENT_PKGS_DIR = SHARED_DIR / "../../../../agent_pkgs"
MIP_DIR = SHARED_DIR / "../../../../mip"
TEMPLATE_DIR = SHARED_DIR / "../templates"  # type: Path
SCRIPTS_DIR = SHARED_DIR / "../../../../scripts"
PROJECT_ROOT_DIR = SHARED_DIR / "../../../.."

TFPLENUM_LOG_FILENAME = "/var/log/tfplenum/tfplenum.log"
REDIS_QUEUE_LOG_FILENAME = "/var/log/tfplenum/rq.log"

KIT_ID = "kit_form"
MIP_CONFIG_ID = "mip_config"
PORTAL_ID = "portal_links"
HIVE_ID = "HIVE_SETTINGS"
GENERAL_SETTINGS_ID = "general_settings_form"
ESXI_SETTINGS_ID = "esxi_settings_form"
KIT_SETTINGS_ID = "kit_settings_form"
MIP_SETTINGS_ID = "mip_settings_form"
SNMP_SETTINGS_ID = "snmp_settings_form"
WINDOWS_COLD_LOG_CONFIG_ID = "windows_cold_log_config"
ELK_SNAPSHOT_STATE = "elk_snapshot"
DATE_FORMAT_STR = "%Y-%m-%d %H:%M:%S"

RULESET_STATES = ("Created", "Dirty", "Synced", "Error")
RULE_TYPES = ("Suricata", "Zeek Scripts", "Zeek Intel", "Zeek Signatures")
PCAP_UPLOAD_DIR = "/var/www/html/pcaps"
AGENT_UPLOAD_DIR = "/var/www/html/agents"
SURICATA_IMAGE_VERSION = "6.0.0"
ZEEK_IMAGE_VERSION = "4.0.3"
ARKIME_IMAGE_VERSION = "3.1.0"
BEATS_IMAGE_VERSIONS = "7.16.2"
LOG_PATH = "/var/log/tfplenum"
TFPLENUM_CONFIGS_PATH = "/etc/tfplenum"

# The path inside of the docker container
ZEEK_SCRIPT_DIR = "/opt/zeek/share/zeek/site/custom"
ZEEK_INTEL_PATH = "/opt/tfplenum/zeek"
ZEEK_SIG_PATH = "/opt/tfplenum/zeek/custom.sig"

SURICATA_RULESET_LOC = "/opt/tfplenum/suricata/rules/suricata.rules"
BRO_CUSTOM_DIR = "/opt/tfplenum/zeek/scripts/"
CA_BUNDLE = "/etc/pki/tls/certs/ca-bundle.crt"

REDIS = "redis://"


class NODE_TYPES(Enum):
    server = "Server"
    sensor = "Sensor"
    control_plane = "Control-Plane"
    service_node = "Service"
    mip = "MIP"


class DEPLOYMENT_TYPES(Enum):
    baremetal = "Baremetal"
    virtual = "Virtual"
    iso = "Iso"


class DEPLOYMENT_JOBS(Enum):
    base_kit = "Base kit"
    add_node = "Add Node"
    remove_node = "Remove Node"
    setup_control_plane = "Setup Control Plane"
    kickstart_profiles = "Kickstart Profiles"
    setup_minio = "Setup Minio"
    setup_controller = "Setup Controller"
    setup_controller_kit_settings = "Setup Controller Kit Settings"
    mip_deploy = "Deploy MIP"
    create_virtual = "Create Virtual Machine"
    provision_virtual = "Provision Virtual Machine"
    gather_device_facts = "Gather Device Facts"


class TARGET_STATES(Enum):
    uninstalled = "Uninstalled"
    installed = "Installed"
    error = "Error"


# Roles
OPERATOR_ROLE = "operator"
CONTROLLER_ADMIN_ROLE = "controller-admin"
CONTROLLER_MAINTAINER_ROLE = "controller-maintainer"
REALM_ADMIN_ROLE = "realm-admin"
NODE_STATE_ADMIN = "node-state-admin"

# Job Stages
JOB_CREATE = "create"
JOB_PROVISION = "provision"
JOB_DEPLOY = "deploy"
JOB_REMOVE = "remove"

MAC_BASE = "00:1b:ea:00:00:00"
CONTROLLER_INTERFACE_NAME = "br0"


class PXE_TYPES(Enum):
    uefi = "UEFI"
    bios = "BIOS"
    scsi_sata_usb = "SCSI/SATA/USB"
    nvme = "NVMe"


class FileSet:
    def __init__(self, value: str, name: str, tooltip: str = ""):
        self.value = value
        self.name = name  # The display name on the UI
        self.tooltip = tooltip

    def to_dict(self):
        return {"value": self.value, "name": self.name, "tooltip": self.tooltip}


class FilebeatModule:
    def __init__(self, value: str, name: str):
        self.value = value
        self.name = name  # The display name on the UI
        self.filesets = []  # type: FileSet

    def appendFileset(self, value: str, name: str, tooltip: str = ""):
        self.filesets.append(FileSet(value, name, tooltip))

    def to_dict(self):
        fileset_l = [i.to_dict() for i in self.filesets]
        return {"value": self.value, "name": self.name, "filesets": fileset_l}


class ColdLogModules:
    APACHE = FilebeatModule("apache", "Apache")
    AUDITD = FilebeatModule("auditd", "Auditd")
    AWS = FilebeatModule("aws", "AWS")
    AZURE = FilebeatModule("azure", "Azure")
    BLUECOAT = FilebeatModule("bluecoat", "Blue Coat")
    CISCO = FilebeatModule("cisco", "Cisco")
    JUNIPER = FilebeatModule("juniper", "Juniper")
    OFFICE365 = FilebeatModule("o365", "Office 365")
    PALOALTO = FilebeatModule("panw", "Palo Alto")
    SNORT = FilebeatModule("snort", "Snort")
    SURICATA = FilebeatModule("suricata", "Suricata")
    SYSTEM = FilebeatModule("system", "System")
    WINDOWS = FilebeatModule("windows", "Windows event logs")

    @classmethod
    def _initalize(cls):
        cls.APACHE.appendFileset(
            "error", "Error logs", "Normally found in /var/log/httpd folder."
        )
        cls.APACHE.appendFileset(
            "access", "Access logs", "Normally found in /var/log/httpd folder."
        )

        cls.AWS.appendFileset("ec2", "EC2 logs")
        cls.AWS.appendFileset("elb", "ELB logs")
        cls.AWS.appendFileset("s3access", "S3 Access logs")
        cls.AWS.appendFileset("vpcflow", "VPC Flow logs")
        cls.AWS.appendFileset("cloudtrail", "Cloud Trail logs")
        cls.AWS.appendFileset("cloudwatch", "Cloud Watch logs")
        cls.AZURE.appendFileset("activitylogs", "Activity logs")
        cls.AZURE.appendFileset("auditlogs", "Audit logs")
        cls.AZURE.appendFileset("platformlogs", "Platform logs")
        cls.AZURE.appendFileset("signinlogs", "Sign in logs")
        cls.CISCO.appendFileset("amp", "AMP Logs")
        cls.CISCO.appendFileset("asa", "ASA logs")
        cls.CISCO.appendFileset("ftd", "FTD logs")
        cls.CISCO.appendFileset("ios", "IOS logs")
        cls.CISCO.appendFileset("meraki", "Meraki logs")
        cls.CISCO.appendFileset("nexus", "Nexus logs")
        cls.CISCO.appendFileset("umbrella", "Umbella logs")

        cls.JUNIPER.appendFileset("srx", "SRX logs")
        cls.JUNIPER.appendFileset("junos", "Junos logs")
        cls.JUNIPER.appendFileset("netscreen", "Netscreen logs")

        cls.AUDITD.appendFileset("log", "Auditd logs")
        cls.BLUECOAT.appendFileset("director", "Director logs")
        cls.OFFICE365.appendFileset("audit", "Audit logs")
        cls.PALOALTO.appendFileset("panos", "Panos logs")
        cls.SNORT.appendFileset("log", "Snort logs")
        cls.SURICATA.appendFileset("eve", "Event logs")
        cls.SYSTEM.appendFileset("syslog", "System logs")
        cls.SYSTEM.appendFileset("auth", "Authorization logs")

    @classmethod
    def to_list(cls):
        ret_val = []
        for key in cls.__dict__:
            if key.isupper():
                ret_val.append(cls.__dict__[key].to_dict())

        return ret_val


ColdLogModules._initalize()
