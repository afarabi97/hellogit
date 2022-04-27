import requests
from app.utils.constants import MINIO_UI_PORT
from requests.exceptions import ConnectionError

def check_minio_conn(repository_settings: dict):
    protcol = repository_settings['protocol'] + "://"
    endpoint = repository_settings['endpoint']
    access_key = repository_settings['access_key']
    secret_key = repository_settings['secret_key']
    url = "{}{}:{}/api/v1/login".format(protcol, endpoint, MINIO_UI_PORT)

    data = {
        "accessKey": access_key,
        "secretKey": secret_key
    }

    response = requests.post(url, json=data, verify=False, timeout=1)

    if response.status_code != 204:
        raise ConnectionError

