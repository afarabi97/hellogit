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

KIT_ID = "kit_form"
PORTAL_ID = 'portal_links'
KICKSTART_ID = "kickstart_form"
DATE_FORMAT_STR = '%Y-%m-%d %H:%M:%S'

RULESET_STATES = ("Created", "Dirty", "Synced", "Error")
RULE_TYPES = ("Suricata", "Bro")
PCAP_UPLOAD_DIR = "/var/www/html/pcaps"
AGENT_UPLOAD_DIR = "/var/www/html/agents"
SURICATA_CONTAINER_VERSION = "4.1.4"
BRO_CONTAINER_VERSION = "2.6.2"

# The path inside of the docker container
BRO_RULE_DIR = "/usr/local/bro-2.6.2/share/bro/site"

NODE_TYPES = ["Server", "Sensor"]
class TARGET_STATES(Enum):
    uninstalled = "Uninstalled"
    installed = "Installed"
    error = "Error"
