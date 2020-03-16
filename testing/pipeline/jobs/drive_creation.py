from fabric import Connection
from models.drive_creation import DriveCreationSettings
from time import sleep
from util.connection_mngs import FabricConnectionWrapper


class DriveCreationJob:
    def __init__(self, drive_settings: DriveCreationSettings):
        self._drive_settings = drive_settings

    def _burn_image_to_disk(self, shell: Connection):
        print("Making sure external drive is not mounted before proceeding...")
        shell.sudo("umount {}1".format(self._drive_settings.external_drive), warn=True)
        shell.sudo("umount {}2".format(self._drive_settings.external_drive), warn=True)
        sleep(3)
        print("Burning multiboot image to drive, this may take a while...")
        cmd = ("dd if={} of={} bs=26144 status=progress oflag=sync"
                    .format(self._drive_settings.multi_boot_img_path,
                            self._drive_settings.external_drive))
        shell.sudo(cmd)
        sleep(10)

    def _create_data_partition(self, shell: Connection):
        print("Creating Data partition...")
        shell.sudo("mkfs -t xfs -f -L Data {}2".format(self._drive_settings.external_drive))
        sleep(5)

    def _rysnc_data_files(self, shell: Connection):
        print("Copying files to Data partition...")
        shell.sudo("mount {}2 {}".format(self._drive_settings.external_drive, self._drive_settings.mount_point))
        sleep(3)
        shell.sudo("rsync -azhSW --numeric-ids --info=progress2 {} {}".format(self._drive_settings.rsync_source, self._drive_settings.mount_point))
        shell.sudo("umount {}2".format(self._drive_settings.external_drive))

    def execute(self):
        with FabricConnectionWrapper(self._drive_settings.username,
                                     self._drive_settings.password,
                                     self._drive_settings.ipaddress) as shell:
            self._burn_image_to_disk(shell)
            self._create_data_partition(shell)
            self._rysnc_data_files(shell)
