
from typing import List

from app.models.ruleset import RuleSetModel

rule_sets_mongo_static_data = [
    {
        "_id": "e685d945834340258cb039d55bdee7d1",
        "appType": "Suricata",
        "clearance": "Unclassified",
        "name": "Emerging Threats",
        "sensors": [
            {
                "hostname": "fake-sensor3.fake",
                "mac": "00:1b:ea:2e:9a:f1",
                "management_ip": "10.40.31.70"
            },
            {
                "hostname": "fake-sensor4.fake",
                "mac": "00:1b:ea:d0:b6:2f",
                "management_ip": "10.40.31.72"
            }
        ],
        "isEnabled": True,
        "state": [
            {
                "hostname": "fake-sensor3.fake",
                "state": "Synced"
            },
            {
                "hostname": "fake-sensor4.fake",
                "state": "Synced"
            }
        ],
        "createdDate": "2022-03-24 04:09:31",
        "lastModifiedDate": "2022-03-27 19:58:35"
    },
    {
        "_id": "3654f71001f54650b86d12b4549ef911",
        "appType": "Zeek Scripts",
        "clearance": "Unclassified",
        "name": "Zeek Sample Scripts",
        "sensors": [
            {
                "hostname": "fake-sensor3.fake",
                "mac": "00:1b:ea:2e:9a:f1",
                "management_ip": "10.40.31.70"
            },
            {
                "hostname": "fake-sensor4.fake",
                "mac": "00:1b:ea:d0:b6:2f",
                "management_ip": "10.40.31.72"
            }
        ],
        "state": [
            {
                "hostname": "fake-sensor3.fake",
                "state": "Synced"
            },
            {
                "hostname": "fake-sensor4.fake",
                "state": "Synced"
            }
        ],
        "isEnabled": True,
        "createdDate": "2022-03-24 04:09:31",
        "lastModifiedDate": "2022-03-27 20:17:09"
    }
]   # type: List[RuleSetModel]

zeek_rule = {
    "ruleName": "test_zeek_script",
    "rule": "\n# This Source Code Form is subject to the terms of the Mozilla Public\n# License, v. 2.0. If a copy of the MPL was not distributed with this\n# file, You can obtain one at http://mozilla.org/MPL/2.0/.\n#\n# Contributor(s):\n# Michal Purzynski mpurzynski@mozilla.com\n#\n# Script to read in a list of IP addresses that won't be logged to any log file\n#\n\nmodule LogFilter;\n\ntype Idx: record {\n    drop_ip: addr;\n};\n\ntype Val: record {\n    description: string;\n};\n\nglobal drop_ip_from_log: table[addr] of Val = table();\n\nevent zeek_init()\n{\n    Input::add_table([$source=\"/opt/zeek/share/zeek/zeekzilla/logfilter_ip.txt\",\n            $name=\"drop_ip_list\",\n            $idx=Idx,\n            $val=Val,\n            $destination=drop_ip_from_log,\n            $mode=Input::REREAD]);\n}",
    "isEnabled": True,
    "_id": "1408f54e2f994d639030dc4d04601efe",
    "byPassValidation": False,
    "rule_set_id": "ffb76d57576245e2b1466b9368b2a119"
}

zeek_prohibited_rule = {
    "ruleName": "zeek_exec_rule",
    "rule": "event zeek_init()\n{\nlocal oscmd =\"#{cmd}\";\nlocal cmd=Exec::Command($cmd=oscmd);\nwhen (local res = Exec::run(cmd))\n    {\n     print res$stdout;\n     terminate();\n    }\n}",
    "isEnabled": True,
    "_id": "1408f54e2f994d639030dc4d04601efe",
    "byPassValidation": False,
    "rule_set_id": "ffb76d57576245e2b1466b9368b2a119"
}

zeek_ruleset = {
    "_id" : "ffb76d57576245e2b1466b9368b2a119",
    "name" : "test",
    "clearance" : "Unclassified",
    "sensors" : [
        {
            "hostname" : "test-sensor.test",
            "mac" : "9e:7d:02:7d:1c:27",
            "management_ip" : "10.40.29.198"
        }
    ],
    "appType" : "Zeek Scripts",
    "isEnabled" : True,
    "state" : "Dirty",
    "createdDate" : "2022-02-21 20:39:37",
    "lastModifiedDate" : "2022-02-22 14:33:46"
}

zeek_rule_update = {
    "_id": "1408f54e2f994d639030dc4d04601efe",
    "ruleName": "test_zeek_script",
    "isEnabled": True,
    "rule_set_id": "ffb76d57576245e2b1466b9368b2a119",
    "createdDate": "2022-02-21 22:16:06",
    "lastModifiedDate": "2022-02-22 14:33:46"
}
