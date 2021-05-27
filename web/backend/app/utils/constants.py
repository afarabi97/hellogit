"""
Module hold constants that can be used for controllers or fabric files.
"""
from pathlib import Path
from enum import Enum, auto

SHARED_DIR = Path(__file__).parent  # type: Path
CORE_DIR = SHARED_DIR / '../../../../core'
STIGS_DIR = SHARED_DIR / '../../../../rhel8-stigs'
PLAYBOOK_DIR = CORE_DIR / 'playbooks'
WEB_DIR = SHARED_DIR / '../../../'
TESTING_DIR = SHARED_DIR / '../../../../testing'
UPGRADES_DIR = SHARED_DIR / '../../../../upgrades'
AGENT_PKGS_DIR = SHARED_DIR / '../../../../agent_pkgs'
MIP_DIR = SHARED_DIR / '../../../../mip'

KIT_ID = "kit_form"
MIP_CONFIG_ID = "mip_config"
PORTAL_ID = 'portal_links'
HIVE_ID = "HIVE_SETTINGS"
GENERAL_SETTINGS_ID = "general_settings_form"
ESXI_SETTINGS_ID = "esxi_settings_form"
KIT_SETTINGS_ID = "kit_settings_form"
MIP_SETTINGS_ID = "mip_settings_form"
WINDOWS_COLD_LOG_CONFIG_ID = "windows_cold_log_config"
ELK_SNAPSHOT_STATE = "elk_snapshot"
DATE_FORMAT_STR = '%Y-%m-%d %H:%M:%S'

RULESET_STATES = ("Created", "Dirty", "Synced", "Error")
RULE_TYPES = ("Suricata", "Zeek Scripts", "Zeek Intel", "Zeek Signatures")
PCAP_UPLOAD_DIR = "/var/www/html/pcaps"
AGENT_UPLOAD_DIR = "/var/www/html/agents"
SURICATA_IMAGE_VERSION = "6.0.0"
ZEEK_IMAGE_VERSION = "3.2.2"
ARKIME_IMAGE_VERSION = "2.7.1"
BEATS_IMAGE_VERSIONS = "7.11.1"
LOG_PATH = "/var/log/tfplenum"
TFPLENUM_CONFIGS_PATH = "/etc/tfplenum"

# The path inside of the docker container
ZEEK_SCRIPT_DIR = "/opt/zeek/share/zeek/site/custom"
ZEEK_INTEL_PATH = "/opt/tfplenum/zeek"
ZEEK_SIG_PATH = "/opt/tfplenum/zeek/custom.sig"

SURICATA_RULESET_LOC = "/opt/tfplenum/suricata/rules/suricata.rules"
BRO_CUSTOM_DIR = "/opt/tfplenum/zeek/scripts/"

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
