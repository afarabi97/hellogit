from models.internal_vdd import InternalVDDSettings
from util.internal_vdd_util import InternalVDDUtil

class InternalVDDJob:
    def __init__(self, internal_vdd_settings: InternalVDDSettings):
        self.target_version = internal_vdd_settings.target_version
        self.confluence_username = internal_vdd_settings.confluence_username
        self.confluence_password = internal_vdd_settings.confluence_password

    def _execute(self):
        InternalVDDUtil(
            target_version=self.target_version,
            confluence_username=self.confluence_username,
            confluence_password=self.confluence_password).save_vdd()

    def pull_internal_vdd(self):
        self._execute()
