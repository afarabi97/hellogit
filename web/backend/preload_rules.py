import os
import subprocess
from pathlib import Path

import requests
import urllib3

urllib3.disable_warnings()

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))

ruleset = {
    "appType": "Suricata",
    "clearance": "Unclassified",
    "name": "Emerging Threats",
    "sensors": [],
    "isEnabled": True,
}

scriptset = {
    "appType": "Zeek Scripts",
    "clearance": "Unclassified",
    "name": "Zeek Sample Scripts",
    "sensors": [],
    "state": "Created",
    "isEnabled": False,
}


class PreloadRuleSets:
    def __init__(self):
        self.headers = None
        self.rulesets = None

    def create_ruleset(self, ruleset: dict):
        resp = requests.post(
            "https://localhost/api/policy/ruleset",
            headers=self.headers,
            json=ruleset,
            verify=False,
        )
        if resp.status_code == 200:
            return
        else:
            print("Unable to create emerging threat ruleset.")
            exit(1)

    def upload(self, pathlist, ruleset_id):
        for path in pathlist:
            files = {"upload_file": open(path, "rb")}
            data = {"ruleSetForm": '{"_id": "' + ruleset_id + '"}'}
            resp = requests.post(
                "https://localhost/api/policy/rule/upload",
                data=data,
                files=files,
                headers=self.headers,
                verify=False,
            )
            if resp.status_code == 200:
                print("Completed processing of " + str(path))
            else:
                print("Error unable to upload rule.")
                exit(1)

    def upload_rules(self):
        ruleset_id = None
        for ruleset in self.rulesets:
            if ruleset["name"] == "Emerging Threats":
                ruleset_id = ruleset["_id"]
            if ruleset["name"] == "Zeek Sample Scripts":
                zeek_ruleset_id = ruleset["_id"]
        pathlist = Path(SCRIPT_DIR + "/rules/rules").glob("**/*.rules")
        zeek_pathlist = Path(
            SCRIPT_DIR + "/rules/zeek_samples").glob("**/*.zeek")
        self.upload(pathlist, ruleset_id)
        self.upload(zeek_pathlist, zeek_ruleset_id)
        return

    def generate_api_key(self):
        api_gen_cmd = '/opt/tfplenum/.venv/bin/python3 /opt/sso-idp/gen_api_token.py --roles "operator" --exp 0.1'
        proc = subprocess.Popen(
            api_gen_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT
        )
        stdout, _ = proc.communicate()
        self.headers = {
            "Authorization": "Bearer {}".format(stdout.decode("utf-8").strip())
        }
        return

    def get_rulesets(self):
        resp = requests.get(
            "https://localhost/api/policy/ruleset", headers=self.headers, verify=False
        )
        if resp.status_code == 200:
            self.rulesets = resp.json()
            return
        else:
            print("Error unable to get rulesets.")
            exit(1)

    def delete_rulesets(self):
        self.get_rulesets()
        for ruleset in self.rulesets:
            if (
                ruleset["name"] == "Emerging Threats"
                or ruleset["name"] == "Zeek Sample Scripts"
            ):
                uri = "https://localhost/api/policy/ruleset/{}".format(
                    ruleset["_id"])
                resp = requests.delete(uri, headers=self.headers, verify=False)
                if resp.status_code == 200:
                    print("Ruleset {} deleted.".format(ruleset["name"]))
                else:
                    print("Error unable to delete {}.".format(ruleset["name"]))
                    exit(1)
        return


def main():
    preload = PreloadRuleSets()
    preload.generate_api_key()
    preload.get_rulesets()
    preload.delete_rulesets()
    preload.create_ruleset(ruleset)
    preload.create_ruleset(scriptset)
    preload.get_rulesets()
    preload.upload_rules()


if __name__ == "__main__":
    main()
