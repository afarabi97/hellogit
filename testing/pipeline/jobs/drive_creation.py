import sys
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

    def _burn_image_to_disk(self, shell: Connection):
        print("Making sure external drive is not mounted before proceeding...")
        shell.sudo("umount {}1".format(self._drive_settings.external_drive), warn=True)
        shell.sudo("umount {}2".format(self._drive_settings.external_drive), warn=True)
        sleep(3)
        print("Creating the MULTIBOOT partition to drive.  This may take a while...")
        Multiboot_Image = Multiboot_Create(Argument_Path          = self._drive_settings.multiboot_path,
                                           Argument_File_Location = self._drive_settings.drive_creation_path,
                                           Argument_Drive_Device  = self._drive_settings.external_drive)

        print("Burning the MULTIBOOT partition to drive.  This may take a while...")
        self._execute(shell, "dd bs=262144 if={} of={}".format(Multiboot_Image, self._drive_settings.external_drive))
        self._execute(shell, "mkdir --parent {}Multi_Partition".format(self._drive_settings.multiboot_path))
        sleep(10)
        self._execute(shell, "mount {}1 {}Multi_Partition".format(self._drive_settings.external_drive,
                                                           self._drive_settings.multiboot_path))

        self._execute(shell, "rsync --times --recursive {} {}Multi_Partition/".format(self._drive_settings.multiboot_path,
                                                                               self._drive_settings.multiboot_path))
        self._execute(shell, "umount {}1".format(self._drive_settings.external_drive))
        self._execute(shell, "rm --force --recursive {}Multi_Partition".format(self._drive_settings.multiboot_path))
        print("Finished burning the MULTIBOOT partition to drive.")
        sleep(10)

    def _create_data_partition(self, shell: Connection):
        print("Creating Data partition...")
        self._execute(shell, "mkfs -t xfs -f -L Data {}2".format(self._drive_settings.external_drive))
        sleep(5)

    def _rysnc_data_files(self, shell: Connection):
        print("Copying files to Data partition...")
        self._execute(shell, "mount {}2 {}".format(self._drive_settings.external_drive, self._drive_settings.mount_point))
        sleep(3)
        self._execute(shell, "rsync -azhSW --numeric-ids --info=progress2 {} {}".format(self._drive_settings.rsync_source,
                                                                                        self._drive_settings.mount_point))
        self._execute(shell, "umount {}2".format(self._drive_settings.external_drive))

    def execute(self):
        with FabricConnectionWrapper(self._drive_settings.username,
                                     self._drive_settings.password,
                                     self._drive_settings.ipaddress) as shell:
            self._burn_image_to_disk(shell)
            self._create_data_partition(shell)
            self._rysnc_data_files(shell)


class DriveHashCreationJob:
    def __init__(self, drive_hash_settings: DriveCreationHashSettings):
        self._drive_hash_settings = drive_hash_settings

    def execute(self):
        create_hashes(self._drive_hash_settings.rsync_source)

    def _run_verification_script(self):
        proc = subprocess.Popen("./validate_drive.sh", shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        stdout, stderr = proc.communicate()
        if proc.returncode != 0:
            raise Exception("HASH check failed with stdout {} and stderr {}".format(stdout, stderr))

    def _create_verification_script(self):
        md5_hash = md5_sum("drive_md5_hashes.txt")
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

        with open("validate_drive.sh", 'w') as script:
            script.write(validation_script)

        os.chmod("validate_drive.sh", 0o755 )

    def _create_text_description_file(self):
        readme_txt = ("See CVAH 3.4/Documentation/ folder for additional details on how to setup or operate "
                      "the Deployable Interceptor Platform (DIP) or the Mobile Interceptor Platform (MIP).")

        if self._drive_hash_settings.is_CPT():
            with open("CPT_Drive_Readme.txt", 'w') as script:
                script.write(readme_txt)
        else:
            with open("MDT_Drive_Readme.txt", 'w') as script:
                script.write(readme_txt)


    def create_verification_script_and_validate(self):
        directory_to_walk = self._drive_hash_settings.rsync_source
        if not directory_to_walk.endswith("/"):
            directory_to_walk = directory_to_walk + "/"

        cur_cwd = os.getcwd()
        try:
            cwd = Path(directory_to_walk)
            if not cwd.exists() or not cwd.is_dir():
                raise NotADirectoryError("{} is not a directory or does not exist".format(directory_to_walk))

            os.chdir(directory_to_walk)
            self._create_text_description_file()
            self._create_verification_script()
            self._run_verification_script()
        finally:
            os.chdir(cur_cwd)
