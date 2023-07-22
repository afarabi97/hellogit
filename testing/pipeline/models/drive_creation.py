from argparse import Namespace
from models import Model


class DriveCreationSettingsv2(Model):
    def __init__(self):
        self.create_drive_type = "Mixed"
        self.drive_creation_version = ""
        #These are the credentials of the box that will have a portal USB hard drive plugged into it.
        self.username = ""
        self.password = ""
        self.ipaddress = ""
        self.burn_multiboot = "yes"
        #self.external_drive = ""
        self.drive_creation_path = ""
        self.staging_export_path = ""
        self.luks_password = ""

    def is_mixed(self) -> bool:
        return "Mixed".lower() == self.create_drive_type.lower()

    def is_GIP_Only(self) -> bool:
        return "GIP" == self.create_drive_type

    def is_MDT_Only(self) -> bool:
        return "MDT" == self.create_drive_type

    def is_CPT_Only(self) -> bool:
        return "CPT" == self.create_drive_type

    def is_burn_multiboot(self) -> bool:
        return "yes" == self.burn_multiboot

    def from_namespace(self, namespace: Namespace):
        super().from_namespace(namespace)
        self.password = self.b64decode_string(namespace.password)
