import os

from app import conn_mng
from app.ruleset_controller import create_ruleset_service, create_rule_service, create_ruleset_from_file
from pathlib import Path

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))

def main():
    pathlist = Path(SCRIPT_DIR + '/rules/rules').glob('**/*.rules')
    conn_mng.mongo_ruleset.drop()
    ruleset = {
        "appType": "Suricata",
        "clearance": "Unclassified",
        "name": "Emerging Threats",
        "sensors": [],
        "state": "Created",
        "isEnabled": True,
        "groupName": "Threat Feeds"
    }
    ret_val = create_ruleset_service(ruleset) # type: int
    for path in pathlist:
        create_ruleset_from_file(path, ret_val)
        print("Completed processing of " + str(path))

if __name__ == '__main__':
    main()