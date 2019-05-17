"""
Module hold constants that can be used for controllers or fabric files.
"""
from pathlib import Path

SHARED_DIR = Path(__file__).parent  # type: Path
CORE_DIR = SHARED_DIR / '../../../core'
DEPLOYER_DIR = SHARED_DIR / '../../../deployer'
WEB_DIR = SHARED_DIR / '../../'
TESTING_DIR = SHARED_DIR / '../../../testing'

KIT_ID = "kit_form"
PORTAL_ID = 'portal_links'
KICKSTART_ID = "kickstart_form"
DATE_FORMAT_STR = '%Y-%m-%d %H:%M:%S'

RULESET_STATES = ("Created", "Dirty", "Synced", "Error")
PCAP_UPLOAD_DIR = "/var/www/html/pcaps"
SURICATA_CONTAINER_VERSION = "4.1.3"

NODE_TYPES = ["Server", "Sensor"]
