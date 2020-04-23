import os

from app import conn_mng
from app.ruleset_controller import create_ruleset_service, create_rule_from_file
from pathlib import Path

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))

def main():
    pathlist = Path(SCRIPT_DIR + '/rules/rules').glob('**/*.rules')
    conn_mng.mongo_ruleset.drop()
    conn_mng.mongo_rule.drop()
    ruleset = {
        "appType": "Suricata",
        "clearance": "Unclassified",
        "name": "Emerging Threats",
        "sensors": [],
        "state": "Created",
        "isEnabled": True
    }
    ret_val = create_ruleset_service(ruleset)
    rule_set = conn_mng.mongo_ruleset.find_one({"_id": ret_val.inserted_id})
    for path in pathlist:
        create_rule_from_file(path, rule_set)
        print("Completed processing of " + str(path))

if __name__ == '__main__':
    main()
