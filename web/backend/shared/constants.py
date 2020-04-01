"""
Module hold constants that can be used for controllers or fabric files.
"""
from pathlib import Path
from enum import Enum

SHARED_DIR = Path(__file__).parent  # type: Path
CORE_DIR = SHARED_DIR / '../../../core'
PLAYBOOK_DIR = CORE_DIR / 'playbooks'
DEPLOYER_DIR = SHARED_DIR / '../../../deployer'
WEB_DIR = SHARED_DIR / '../../'
TESTING_DIR = SHARED_DIR / '../../../testing'
UPGRADES_DIR = SHARED_DIR / '../../../upgrades'
AGENT_PKGS_DIR = SHARED_DIR / '../../../agent_pkgs'
MIP_KICK_DIR = SHARED_DIR / '../../../mip/mip-deployer'
MIP_CONFIG_DIR = SHARED_DIR / '../../../mip/mip-core'

KIT_ID = "kit_form"
MIP_CONFIG_ID = "mip_config"
PORTAL_ID = 'portal_links'
KICKSTART_ID = "kickstart_form"
ADDNODE_ID = "add_node_wizard"
ELK_SNAPSHOT_STATE = "elk_snapshot"
DATE_FORMAT_STR = '%Y-%m-%d %H:%M:%S'

RULESET_STATES = ("Created", "Dirty", "Synced", "Error")
RULE_TYPES = ("Suricata", "Zeek")
PCAP_UPLOAD_DIR = "/var/www/html/pcaps"
AGENT_UPLOAD_DIR = "/var/www/html/agents"
SURICATA_IMAGE_VERSION = "5.0.0"
ZEEK_IMAGE_VERSION = "3.0.0"

# The path inside of the docker container
BRO_RULE_DIR = "/zeek/share/bro/site"

NODE_TYPES = ["Server", "Sensor"]
class TargetStates(Enum):
    uninstalled = "Uninstalled"
    installed = "Installed"
    error = "Error"
