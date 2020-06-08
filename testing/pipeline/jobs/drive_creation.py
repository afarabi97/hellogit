import os
import subprocess

from fabric import Connection
from util.hash_util import create_hashes, md5_sum
from models.drive_creation import DriveCreationSettings, DriveCreationHashSettings
from pathlib import Path
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
pushd $SCRIPT_DIR > /dev/null

MD5_SUM_CHECK=$(md5sum drive_md5_hashes.txt 2>/dev/null | cut -d" " -f1)
STATUS=0

if [[ "''' + md5_hash + '''" != "${MD5_SUM_CHECK}" ]] ; then
    echo "drive_md5_hashes.txt is invalid actual_hash: ${MD5_SUM_CHECK} expected_hash: ''' + md5_hash + '''."
    STATUS=1
else
    while read line; do
        expected_hash=$(echo "$line" | awk '{print $1}')
        rel_path=$(echo "$line" | awk '{print $2}')
        actual_hash=$(md5sum $rel_path | awk '{print $1}')

        if [[ "${expected_hash}" != "${actual_hash}" ]] ; then
            echo "${rel_path} is invalid actual_hash: ${actual_hash} expected_hash: ${expected_hash}."
            STATUS=2
        fi
done < drive_md5_hashes.txt
fi

popd > /dev/null

exit $STATUS
        '''

        with open("validate_drive.sh", 'w') as script:
            script.write(validation_script)

        os.chmod("validate_drive.sh", 0o755 )


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
            self._create_verification_script()
            self._run_verification_script()
        finally:
            os.chdir(cur_cwd)
