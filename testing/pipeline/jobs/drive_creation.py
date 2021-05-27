import os
import subprocess

from fabric import Connection
from util.hash_util import create_hashes, md5_sum
from models.drive_creation import DriveCreationSettings, DriveCreationHashSettings
from pathlib import Path
from time import sleep
from util.connection_mngs import FabricConnectionWrapper
from jobs.create_multiboot import Multiboot_Create
from util.network import retry


class DriveCreationJob:
    def __init__(self, drive_settings: DriveCreationSettings):
        self._drive_settings = drive_settings

    @retry()
    def _execute(self, shell: Connection, command: str):
        print(command)
        shell.sudo(command)

    def _unmount(self, shell: Connection):
        print("Making sure external drive is not mounted before proceeding...")
        shell.sudo("umount {}[1234]".format(self._drive_settings.external_drive), warn=True)
        shell.sudo("umount {}".format(self._drive_settings.external_drive), warn=True)

    def _burn_image_to_disk(self, shell: Connection):
        sleep(3)
        print("Creating the MULTIBOOT partition to drive.  This may take a while...")
        Multiboot_Image = Multiboot_Create(Argument_Path          = self._drive_settings.multiboot_path,
                                           Argument_File_Location = self._drive_settings.drive_creation_path,
                                           Argument_Drive_Device  = self._drive_settings.external_drive,
                                           Argument_Version =       self._drive_settings.drive_creation_version
                                           )

        print("Burning the MULTIBOOT partition to drive.  This may take a while...")
        self._execute(shell,
                      "dd bs=262144 if={} of={}".
                          format(Multiboot_Image,
                                 self._drive_settings.external_drive))
        self._execute(shell,
                      "mkdir --parent {}Multi_Partition".
                          format(self._drive_settings.multiboot_path))
        sleep(10)
        self._execute(shell,
                      "mount {}1 {}Multi_Partition".
                          format(self._drive_settings.external_drive,
                                 self._drive_settings.multiboot_path))

        self._execute(shell,
                      "rsync --times --recursive {} {}Multi_Partition/".
                          format(self._drive_settings.multiboot_path,
                                 self._drive_settings.multiboot_path))
        self._execute(shell,
                      "umount {}1".
                          format(self._drive_settings.external_drive))
        self._execute(shell,
                      "rm --force --recursive {}Multi_Partition".
                          format(self._drive_settings.multiboot_path))
        print("Finished burning the MULTIBOOT partition to drive.")
        sleep(10)

    def _create_data_partition(self, shell: Connection, has_multi_boot: bool):
        print("Creating Data partition...")
        if has_multi_boot:
            cmd = "mkfs -t xfs -f -L Data {}2".format(self._drive_settings.external_drive)
        else:
            cmd = "mkfs -t xfs -f -L Data {}".format(self._drive_settings.external_drive)

        self._execute(shell, cmd)
        sleep(5)

    def _rsync_data_files(self, shell: Connection, has_multi_boot: bool):
        print("Copying files to Data partition...")
        if has_multi_boot:
            cmd = "mount {}2 {}".format(self._drive_settings.external_drive, self._drive_settings.mount_point)
        else:
            cmd = "mount {} {}".format(self._drive_settings.external_drive, self._drive_settings.mount_point)

        self._execute(shell, cmd)
        sleep(3)
        self._execute(shell,
                      "rsync -azhSW --numeric-ids --info=progress2 {} {}".
                          format(self._drive_settings.rsync_source,
                                 self._drive_settings.mount_point))
        if has_multi_boot:
            cmd = "umount {}2".format(self._drive_settings.external_drive)
        else:
            cmd = "umount {}".format(self._drive_settings.external_drive)

    def execute(self):
        with FabricConnectionWrapper(self._drive_settings.username,
                                     self._drive_settings.password,
                                     self._drive_settings.ipaddress) as shell:
            self._unmount(shell)
            has_multi_boot = self._drive_settings.burn_multiboot == "yes"
            if has_multi_boot:
                self._burn_image_to_disk(shell)
            self._create_data_partition(shell, has_multi_boot)
            self._rsync_data_files(shell, has_multi_boot)


class DriveHashCreationJob:
    def __init__(self, drive_hash_settings: DriveCreationHashSettings):
        self._drive_hash_settings = drive_hash_settings

    def _run_command(self, cmd: str, error_message: str="stdout {} stderr {}", is_shell: bool=True):
        proc = subprocess.Popen(cmd,
                                shell=is_shell,
                                stdout=subprocess.PIPE,
                                stderr=subprocess.STDOUT)
        stdout, stderr = proc.communicate()
        if proc.returncode != 0:
            raise Exception(error_message.format(stdout, stderr))

    def _create_text_description_file(self):
        path = self._drive_hash_settings.rsync_source + "/"
        readme_txt = ("Please see CVAH 3.6/Documentation/ folder for additional details on how to setup or operate "
                      "the Deployable Interceptor Platform (DIP) or the Mobile Interceptor Platform (MIP).")

        if self._drive_hash_settings.is_GIP():
            readme_txt_gip = ("Please see CVAH 3.6/Documentation/ folder for additional details on how to setup or operate "
                              "the Garrison Interceptor Platform (GIP)")
            with open(path + "GIP_Drive_Readme.txt", 'w') as script:
                script.write(readme_txt_gip)
        elif self._drive_hash_settings.is_CPT():
            with open(path + "CPT_Drive_Readme.txt", 'w') as script:
                script.write(readme_txt)
        else:
            with open(path + "MDT_Drive_Readme.txt", 'w') as script:
                script.write(readme_txt)

    def execute(self):
        self._create_text_description_file()
        create_hashes(self._drive_hash_settings.rsync_source)
        self._create_verification_script()

    def run_verification_script(self):
        print("Performing validation of drive.")
        with FabricConnectionWrapper(self._drive_hash_settings.username,
                                     self._drive_hash_settings.password,
                                     self._drive_hash_settings.ipaddress) as shell:
            shell.run(self._drive_hash_settings.rsync_source + "/validate_drive.sh")

    def _create_verification_script(self):
        path = self._drive_hash_settings.rsync_source + "/"
        md5_hash = md5_sum(path + "drive_md5_hashes.txt")
        validation_script = '''
#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
pushd $SCRIPT_DIR 1>/dev/null 2>&1

MD5_SUM_CHECK=$(md5sum drive_md5_hashes.txt 2>/dev/null | cut -d" " -f1)
STATUS=0

if [[ "''' + md5_hash + '''" != "${MD5_SUM_CHECK}" ]] ; then
    echo "drive_md5_hashes.txt is invalid actual_hash: ${MD5_SUM_CHECK} expected_hash: ''' + md5_hash + '''."
    STATUS=1
else
    MD5_SUM_CHECK=$(md5sum --check --quiet drive_md5_hashes.txt 2>&1)
    if [[ "${MD5_SUM_CHECK}" != "" ]] ; then
        echo "Checksums for drive failed."
        echo "Failed Files are:"
        echo "${MD5_SUM_CHECK}"
        STATUS=2
    else
        echo "Checksums are good"
    fi
fi

popd 1>/dev/null 2>&1

exit $STATUS
        '''

        with open(path + "validate_drive.sh", 'w') as script:
            script.write(validation_script)

        os.chmod(path + "validate_drive.sh", 0o755 )
