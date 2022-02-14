from typing import Dict, List

import requests
from app.models.alerts import HiveSettingsModel
from app.utils.logging import logger
from app.utils.utils import get_domain
from thehive4py.api import TheHiveApi
from thehive4py.auth import BearerAuth
from thehive4py.exceptions import CaseException, CustomFieldException
from thehive4py.models import Case, CustomField, Version


class HiveFailureError(Exception):

    def __init__(self, results: Dict):
        if "message" in results:
            super(HiveFailureError, self).__init__(results["message"])
        else:
            super(HiveFailureError, self).__init__("")
        self.payload = results


def configure_webhook(api_key: str):
    auth = BearerAuth(api_key)
    url = "https://hive.{}/api/config/organisation/notification".format(
        get_domain())
    data = {
        "value": [
            {
                "delegate": False,
                "trigger": {"name": "AnyEvent"},
                "notifier": {"name": "webhook", "endpoint": "tfplenum"}
            }
        ]
    }
    ret_val = requests.put(url=url, json=data, auth=auth)
    if ret_val.status_code != 200:
        raise HiveFailureError(ret_val.json())


class MyTheHiveApi(TheHiveApi):
    """
    Had to override some crappy API code that did not work so I created a custom class.
    """

    def __init__(self, url: str, principal: str,
                 password=None, proxies={}, cert=True,
                 organisation=None, version=Version.THEHIVE_3.value):
        super().__init__(url, principal, password, proxies, cert, organisation, version)

    def _check_if_custom_field_exists(self, custom_field):
        data = {
            'key': 'reference',
            'value': custom_field.reference
        }
        req = self.url + "/api/list/custom_fields/_exists"
        response = requests.post(
            req, json=data, proxies=self.proxies, auth=self.auth, verify=self.cert)
        if response.status_code == 200:
            return False
        return True

    def create_custom_field(self, custom_field):
        if self._check_if_custom_field_exists(custom_field):
            raise CustomFieldException(
                'Field with reference "{}" already exists'.format(custom_field.reference))

        data = {
            "name": custom_field.name,
            "reference": custom_field.reference,
            "description": custom_field.description,
            "type": custom_field.type,
            "options": custom_field.options,
            "mandatory": custom_field.mandatory
        }
        req = self.url + "/api/customField"
        try:
            return requests.post(req, json=data, proxies=self.proxies, auth=self.auth, verify=self.cert)
        except requests.exceptions.RequestException as e:
            raise CustomFieldException(
                "Custom field create error: {}".format(e))


class HiveService:

    def __init__(self):
        self._settings = HiveSettingsModel.load_from_db()
        self._domain = get_domain()
        self._hive_url = 'https://hive.' + self._domain
        self._hive_api = MyTheHiveApi(
            self._hive_url, self._settings.org_admin_api_key, cert=False)
        self._hive_api_admin = MyTheHiveApi(
            self._hive_url, self._settings.admin_api_key, cert=False)

    def delete_hive_case(self, hive_case_id):
        logger.debug(f"deleting_hive_case: {hive_case_id}")
        try:
            ret_val = self._hive_api.delete_case("~" + str(hive_case_id))
            logger.debug(ret_val.status_code)
            logger.debug(ret_val.content)
        except CaseException as e:
            logger.exception(e)

    def create_custom_fields(self, fields_to_create: List[Dict] = None):
        for field in fields_to_create:
            custom_field = CustomField(
                name=field["name"], reference=field["name"], description="Do not modify", options=[], type=field["type"])
            try:
                ret_val = self._hive_api_admin.create_custom_field(
                    custom_field)
                if ret_val.status_code != 201:
                    raise HiveFailureError(
                        {"message": "Failed to create custom field {}".format(field["name"])})
            except CustomFieldException as e:
                # We ignore fields that have already been created
                logger.debug(str(e))

    def create_hive_case(self, hive_form: Dict, fields_to_create: List[Dict] = None):
        tags = [] if not hive_form.get(
            "event_tags") else hive_form.get("event_tags").split(',')
        custom_fields = {}
        for field in fields_to_create:
            custom_fields[field["name"]] = field["value"]

        decscription = hive_form.get('event_description').replace(
            '\n\n', '$FIXIT').replace('\n', '').replace('$FIXIT', '\n\n')
        case = Case(title=hive_form.get('event_title'),
                    description=decscription,
                    severity=int(hive_form.get('event_severity')),
                    owner=hive_form.get('event_owner'),
                    tags=tags,
                    customFields=custom_fields)

        response = self._hive_api.create_case(case)
        if response.status_code != 201:
            raise HiveFailureError(response.json())

        return response.json()
