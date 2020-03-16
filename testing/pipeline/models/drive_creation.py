from argparse import Namespace
from models import Model


class DriveCreationSettings(Model):
    def __init__(self):
        self.multi_boot_img_path="/mnt/drive_creation/MULTIBOOT_20200110.IMG"
        self.external_drive="/dev/sdb"
        self.mount_point="/mnt/Data"
        self.rsync_source="/mnt/drive_creation/v3.3/CPT/Data/"

        #These are the credentials of the box that will have a portal USB hard drive plugged into it.
        self.username = ""
        self.password = ""
        self.ipaddress = ""

    def from_namespace(self, namespace: Namespace):
        super().from_namespace(namespace)
        self.password = self.b64decode_string(namespace.password)
