from argparse import Namespace
from models import Model


class DriveCreationHashSettings(Model):
    def __init__(self):
        self.rsync_source="/mnt/drive_creation/v3.4/CPT/Data/"

    def is_CPT(self) -> bool:
        return "CPT" in self.rsync_source


class DriveCreationSettings(DriveCreationHashSettings):
    def __init__(self):
        super().__init__()
        self.drive_creation_version="3.4"
        self.drive_creation_path="/mnt/drive_creation/{}".format(self.drive_creation_version)
        self.multiboot_path="{}/{}/CPT_MULTIBOOT/".format(self.drive_creation_path, self.drive_creation_version)
        self.external_drive="/dev/sdb"
        self.mount_point="/mnt/Data"

        #These are the credentials of the box that will have a portal USB hard drive plugged into it.
        self.username = ""
        self.password = ""
        self.ipaddress = ""

    def from_namespace(self, namespace: Namespace):
        super().from_namespace(namespace)
        self.password = self.b64decode_string(namespace.password)