from argparse import Namespace
from models import Model
from util.connection_mngs import FabricConnectionWrapper


class DriveCreationHashSettings(Model):
    def __init__(self):
        self.drive_type="CPT"
        self.drive_creation_version="3.7"

        #These are the credentials of the box that will have a portal USB hard drive plugged into it.
        self.username = ""
        self.password = ""
        self.ipaddress = ""

    def is_CPT(self) -> bool:
        return "CPT" == self.drive_type

    def is_GIP(self) -> bool:
        return "GIP" == self.drive_type

    def from_namespace(self, namespace: Namespace):
        super().from_namespace(namespace)
        self.password = self.b64decode_string(namespace.password)


class DriveCreationSettings(DriveCreationHashSettings):
    def __init__(self):
        super().__init__()
        self.external_drive="/dev/sdb"
        self.burn_multiboot = "yes"

    def _check_external_drive(self):
        """
        Make sure that the root drive
        """
        with FabricConnectionWrapper(self.username, self.password, self.ipaddress) as shell:
            result = shell.sudo('cat /proc/mounts | grep "/dev/sd.* / ext4"', shell=True)
            root_drive = result.stdout[0:len("/dev/sda")]
            print(root_drive)
            if root_drive in self.external_drive or root_drive == self.external_drive:
                raise Exception("External drive cannot be set to the OS root drive! This would wipe out the OS on the drive creation server. \
                                 Change the MASTER_DRIVE_CREATION_EXTERNAL_CPT_DRIVE or MASTER_DRIVE_CREATION_EXTERNAL_MDT_DRIVE or \
                                 MASTER_DRIVE_CREATION_EXTERNAL_GIP_DRIVE variable to something that is not {}".format(self.external_drive))

    def from_namespace(self, namespace: Namespace):
        super().from_namespace(namespace)
        self._check_external_drive()
