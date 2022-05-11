import os
import requests
import sys
from requests import Session

ELASTIC_PASSWORD = os.getenv('ELASTIC_PASSWORD', default = '')
ARKIME_ES_PASSWORD = os.getenv('ARKIME_ES_PASSWORD', default ='')
ELASTICSEARCH_FQDN = os.getenv('ELASTICSEARCH_FQDN', default = '')
ELASTICSEARCH_PORT = os.getenv('ELASTICSEARCH_PORT', default = '')
ELASTIC_URL = f"https://{ELASTICSEARCH_FQDN}:{ELASTICSEARCH_PORT}"
VERIFY = "/etc/ssl/certs/container/ca.crt"


def arg_message():
    print("Requires either './arkime_init.py setup_user' or './arkime_init.py update_templates' argument.")


def create_arkime_user(session: Session):
    user_payload = {
        "username": "arkime",
        "roles": [
            "arkime_writer"
        ],
        "full_name": "arkime user",
        "email": None,
        "metadata": {},
        "enabled": True,
        "password": ARKIME_ES_PASSWORD
    }

    url = f"{ELASTIC_URL}/_security/user/arkime"
    r = session.post(url, json=user_payload)
    if r.status_code == 200:
        print("Successfully updated the Arkime user!")
        print(r.text)
    else:
        raise Exception(f"Failed to update Arkime user role "
                        f"for URL: {url} JSON_BODY: {user_payload} STATUS_CODE:{r.status_code}")

    role_payload = {
        "cluster": [
            "monitor",
            "manage_index_templates",
            "transport_client",
            "manage"
        ],
        "indices": [
            {
                "names": [
                    "arkime_*"
                ],
                "privileges": [
                    "all"
                ]
            }
        ]
    }

    url = f"{ELASTIC_URL}/_security/role/arkime_writer"
    r = session.post(url, json=role_payload)
    if r.status_code == 200:
        print("Successfully updated the Arkime security role!")
        print(r.text)
    else:
        raise Exception(f"Failed to update Arkime security role "
                        f"for URL: {url} JSON_BODY: {role_payload} STATUS_CODE:{r.status_code}")


def update_arkime_template_settings(session: Session):
    url = f"{ELASTIC_URL}/_template/arkime_*"

    r = session.get(url)
    if r.status_code == 200:
        print("Successfully pulled current templates!")
    else:
        raise Exception("Failed to pull current Arkime template settings.")

    templates = r.json()
    for template_name in templates:
        template_body = templates[template_name]
        template_body["settings"]["index"]["auto_expand_replicas"] = False
        template_body["settings"]["index"]["number_of_replicas"] = 1

        url = f"{ELASTIC_URL}/_template/{template_name}"
        r = session.put(url, json=template_body)
        if r.status_code == 200 and r.json()['acknowledged']:
            print(f"Successfully updated Arkime template {template_name}!")
        else:
            print(template_body)
            raise Exception(f"Failed to update Arkime template settings "
                            f"for URL: {url} STATUS_CODE:{r.status_code}")


def update_arkime_index_settings(session: Session):
    payload = {
        "index": {"auto_expand_replicas": False, "number_of_replicas": 1}
    }
    url = f"{ELASTIC_URL}/arkime_*/_settings"
    r = session.put(url, json=payload)
    if r.status_code == 200 and r.json()['acknowledged']:
        print("Successfully updated Arkime index settings!")
    else:
        raise Exception(f"Failed to update Arkime index settings "
                        f"for URL: {url} JSON_BODY: {payload} STATUS_CODE:{r.status_code}")


def main():
    session = requests.session()
    session.verify = VERIFY
    session.auth = ("elastic", ELASTIC_PASSWORD)

    if len(sys.argv) < 2 or len(sys.argv) > 2:
        arg_message()
    elif sys.argv[1] == 'setup_user':
        create_arkime_user(session)
    elif sys.argv[1] == 'update_templates':
        print("update_templates")
        update_arkime_template_settings(session)
        update_arkime_index_settings(session)
    else:
        arg_message()

if __name__ == '__main__':
    main()
