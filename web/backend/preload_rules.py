import os
from pathlib import Path

from app.controller.ruleset_controller import (create_rule_from_file,
                                               create_ruleset_service)
from app.utils.db_mngs import conn_mng

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))

def preload_suricata():
    pathlist = Path(SCRIPT_DIR + '/rules/rules').glob('**/*.rules')
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
        create_rule_from_file(path, rule_set, ignore_errors=True)
        print("Completed processing of " + str(path))

def preload_zeek():
    pathlist = Path(SCRIPT_DIR + '/scripts').glob('**/*.zeek')
    scriptset = {
        "appType": "Zeek Scripts",
        "clearance": "Unclassified",
        "name": "Zeek Sample Scripts",
        "sensors": [],
        "state": "Created",
        "isEnabled": False
    }
    ret_val = create_ruleset_service(scriptset)
    script_set = conn_mng.mongo_ruleset.find_one({"_id": ret_val.inserted_id})
    for path in pathlist:
        create_rule_from_file(path, script_set, ignore_errors=True)
        print("Completed processing of " + str(path))

def main():
    conn_mng.mongo_ruleset.drop()
    conn_mng.mongo_rule.drop()
    preload_suricata()
    preload_zeek()

if __name__ == '__main__':
    main()
