import os
import subprocess

from fabric import Connection
from util.hash_util import create_hashes, md5_sum
from models.drive_creation import DriveCreationSettings, DriveCreationHashSettings #, PrepVMSettings
from pathlib import Path
from time import sleep
from util.connection_mngs import FabricConnectionWrapper
from util.network import retry
from util.general import run_command
from typing import List, Union

from io import StringIO
from uuid import uuid4

ROOT_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../../../"
PIPELINE_DIR = ROOT_DIR + "/testing/pipeline/"
TEMPLATES_DIR = PIPELINE_DIR + "/templates"

class DriveCreationJob:
    def __init__(self, drive_settings: DriveCreationSettings):
        self._drive_settings = drive_settings

        if self._drive_settings.is_GIP():
            self.drive_creation_path = "/mnt/drive_creation/staging_gip/v{}".format(self._drive_settings.drive_creation_version)
        else:
            self.drive_creation_path = "/mnt/drive_creation/staging/v{}".format(self._drive_settings.drive_creation_version)

        self.multiboot_path = "{}/MULTIBOOT".format(self.drive_creation_path)
        self.multiboot_img = "MULTIBOOT.img"
        self.multiboot_img_staging = "/mnt/drive_creation/staging/v{}/MULTIBOOT/{}".format(self._drive_settings.drive_creation_version, self.multiboot_img)
        self.multiboot_img_path = "/home/drive_creator"
        self.multi1_path = "/mnt/{}/MULTI1".format(self._drive_settings.drive_type)
        self.multi2_path = "/mnt/{}/MULTI2".format(self._drive_settings.drive_type)
        self.fat32_data_path = "/mnt/{}/FAT32data".format(self._drive_settings.drive_type)
        self.xfs_data_path = "/mnt/{}/Data".format(self._drive_settings.drive_type)
        self.has_multi_boot = self._drive_settings.burn_multiboot == "yes"

        #EX: /mnt/drive_creation/v3.x/CPT/Data/
        self.rsync_source="{}/{}/Data/*".format(self.drive_creation_path, self._drive_settings.drive_type)

    def _remote_sudo_cmd(self, shell: Connection, command: str, warn=False):
        print(command)
        shell.sudo(command, warn=warn)

    def _wipe_data_partition(self, shell: Connection):
        print("Wiping Data data partition...")

        if self.has_multi_boot:
            data_partition = self._drive_settings.external_drive + "6"
        else:
            data_partition = self._drive_settings.external_drive

        self._remote_sudo_cmd(shell, "mount {} /mnt/{}/Data".format(data_partition, self._drive_settings.drive_type), warn=True)
        self._remote_sudo_cmd(shell, "rm -rf  /mnt/{}/Data/*".format(self._drive_settings.drive_type), warn=True)
        self._remote_sudo_cmd(shell, "umount {}".format(data_partition), warn=True)

    def _unmount(self, shell: Connection):
        print("Making sure external drive is not mounted before proceeding...")
        self._remote_sudo_cmd(shell, "umount {}[123456]".format(self._drive_settings.external_drive), warn=True)
        self._remote_sudo_cmd(shell, "umount {}".format(self._drive_settings.external_drive), warn=True)

    def _mount(self, shell: Connection):
        if self.has_multi_boot:
            self._remote_sudo_cmd(shell, "mount {}1 {}".format(self._drive_settings.external_drive, self.multi1_path))
            self._remote_sudo_cmd(shell, "mount {}2 {}".format(self._drive_settings.external_drive, self.multi2_path))
            self._remote_sudo_cmd(shell, "mount {}5 {}".format(self._drive_settings.external_drive, self.fat32_data_path))
            self._remote_sudo_cmd(shell, "mount {}6 {}".format(self._drive_settings.external_drive, self.xfs_data_path))
        else:
            self._remote_sudo_cmd(shell, "mount {} /mnt/{}/Data".format(self._drive_settings.external_drive, self._drive_settings.drive_type))
        sleep(3)

    def _burn_image_to_disk(self, shell: Connection):
        print("Moving MULTIBOOT img from staging folder")
        img_path = os.path.join(self.multiboot_img_path, self.multiboot_img)
        if os.path.isfile(img_path):
            self._remote_sudo_cmd(shell, "rm {}".format(img_path))

        self._remote_sudo_cmd(shell, "cp -v {} {}".format(self.multiboot_img_staging, self.multiboot_img_path))
        print("Burning the MULTIBOOT partition to drive.  This may take a while...")
        self._remote_sudo_cmd(shell, "dd if=/dev/zero of={} bs=500M count=100 status=progress".
                              format(self._drive_settings.external_drive))
        self._remote_sudo_cmd(shell, "sync")
        self._remote_sudo_cmd(shell,
                              "dd bs=262144 if={} of={} status=progress".
                              format(img_path,
                                     self._drive_settings.external_drive))
        self._remote_sudo_cmd(shell, "sync")
        print("Finished burning the MULTIBOOT partition to drive.")

    def _sudo_copy_to_drive_creation(self,
                                     shell: Connection,
                                     source_path: Union[str, StringIO],
                                     dest_path: str):
        file_path = "/home/drive_creator/{}".format(str(uuid4()))
        shell.put(source_path, file_path)
        cmd = "mv {} {}".format(file_path, dest_path)
        self._remote_sudo_cmd(shell, cmd)

    def _copy_multiboot_files(self, shell: Connection):
        #Copy ISOs and their associated txt files.
        isos_files = self.multiboot_path + "/isos/*"
        self._remote_sudo_cmd(shell, "cp -v {} {}/_ISO/MAINMENU/".format(isos_files, self.multi1_path))

        #Copy EXEs
        exes_files = self.multiboot_path + "/exes/*"
        self._remote_sudo_cmd(shell, "cp -v {} {}".format(exes_files, self.multi2_path))

        #Copy kickstart file to root of all Fat32 partitions.
        self._sudo_copy_to_drive_creation(shell,
                                          ROOT_DIR + "/infrastructure/ESXi/ks.cfg",
                                          self.multi2_path + "/ks.cfg")

    @retry()
    def _fix_partition_five_and_six(self, shell: Connection):
        """
        Deletes partion 5 and 6 because they are jacked and recreates them
        with appropriate partition IDs.
        """
        cmd = (
            "fdisk {} <<EOF\n"
            "d\n"      # Delete
            "6\n"      # Partition 6
            "d\n"      # Delete
            "5\n"      # Partition 5
            "n\n\n"    # Create Logical partition 5 accept default for start of block
            "+300G\n"  # Set end block 300G
            "n\n\n\n"  # Create Logical partition 6 accept all defaults for start and end
            "t\n"      # Change partition type
            "5\n"      # Partition 5
            "7\n"      # Change to NTFS
            "t\n"      # Change partition type
            "6\n"      # Partition 6
            "83\n"     # Change to Linux
            "p\n"      # Print parition table
            "w\n"      # Write to disk
            "EOF"
        ).format(self._drive_settings.external_drive)

        print("Sleeping 10 seconds")
        sleep(10)
        self._remote_sudo_cmd(shell, cmd)

    def _create_ntfs_data_partition(self, shell: Connection):
        cmd = "mkfs.ntfs -f {}5 -L NTFSData".format(self._drive_settings.external_drive)
        self._remote_sudo_cmd(shell, cmd)
        sleep(5)

    def _create_xfs_data_partition(self, shell: Connection):
        print("Creating Data partition...")
        if self.has_multi_boot:
            cmd = "mkfs.xfs -f {}6 -L Data".format(self._drive_settings.external_drive)
        else:
            cmd = "mkfs.xfs -f {} -L Data".format(self._drive_settings.external_drive)

        self._remote_sudo_cmd(shell, cmd)
        self._remote_sudo_cmd(shell, "sync")
        sleep(5)

    def _rsync_data_files(self, shell: Connection):
        print("Copying files to Data partition...")
        self._remote_sudo_cmd(shell,
                              "rsync -azhSW --numeric-ids --info=progress2 {} {}".
                              format(self.rsync_source, self.xfs_data_path))
        self._remote_sudo_cmd(shell, "sync")

    def _remove_txt_files(self, folder: str):
        for path in Path(folder).glob("*.txt"):
            path.unlink()

    @retry()
    def _create_menus(self, shell: Connection) -> List[str]:
        """
        Loops over all the iso files in /mnt/drive_creation/v<CVAH VERSION>/MULTIBOOT/isos.
        Creates txt files needed for MULTIBoot creation before they get copied onto the drive.
        """
        menu_entries = []
        isos_folder = self.multiboot_path + "/isos"
        self._remove_txt_files(isos_folder)

        for index, path in enumerate(Path(isos_folder).glob("*.iso")):
            pos = path.name.rfind(".")
            name_without_ext = path.name[0: pos]
            letter = chr(ord('a') + index)

            menu_entries.append('\n# Start {} menu entry\n'.format(name_without_ext))
            menu_entries.append('set gmenu="(${bootdev},1)/_ISO/MAINMENU/' + path.name + '"\n')
            menu_entries.append('set gmenu_title="[{}] {}"\n'.format(letter, name_without_ext))
            menu_entries.append('set gmenu_type="e2biso"\n')
            menu_entries.append('make_entry vmware {}\n'.format(letter))
            menu_entries.append("# End {} menu entry\n".format(name_without_ext))

            inmemory_file = StringIO()
            inmemory_file.write("title ^Alt+{letter} {title} [Alt+{letter}]".format(title=name_without_ext, letter=letter.upper()))
            dest_path = self.multi1_path + "/_ISO/MAINMENU/{}".format(name_without_ext + ".txt")
            self._sudo_copy_to_drive_creation(shell, inmemory_file, dest_path)

        return menu_entries

    def _create_startup_menu(self, shell: Connection, menu_entries: List[str]):
        startup_menu_template = "startup_menu.txt"
        startup_menu_template_path = TEMPLATES_DIR + "/" + startup_menu_template

        # The actual resultant menu path.  This is the actual file that gets copied
        # into the multiboot partition2 in boot/grubfm/startup_menu.txt
        # /mnt/drive_creation/v3.x/MULTIBOOT
        startup_menu_path = self.multiboot_path + "/" + startup_menu_template

        with open(startup_menu_template_path, "r") as f:
            contents = f.readlines()

        pos = 0
        for index, line in enumerate(contents):
            if "# FIRST MENU ENTRY HERE" in line:
                pos = index + 1
                break

        contents = contents[0: pos] + menu_entries + contents[pos:]
        contents = "".join(contents)

        inmemory_file = StringIO()
        inmemory_file.write(contents)
        dest_path = self.multi2_path + "/boot/grubfm/startup_menu.txt"
        self._sudo_copy_to_drive_creation(shell, inmemory_file, dest_path)

    def execute(self):
        with FabricConnectionWrapper(self._drive_settings.username,
                                     self._drive_settings.password,
                                     self._drive_settings.ipaddress) as shell:
            self._unmount(shell)
            self._wipe_data_partition(shell)
            if self.has_multi_boot:
                self._burn_image_to_disk(shell)
                self._fix_partition_five_and_six(shell)
                self._create_ntfs_data_partition(shell)
                self._create_xfs_data_partition(shell)
                self._mount(shell)

                menu_entries = self._create_menus(shell)
                self._create_startup_menu(shell, menu_entries)
                self._copy_multiboot_files(shell)
            else:
                self._create_xfs_data_partition(shell)
                self._mount(shell)

            self._rsync_data_files(shell)
            self._unmount(shell)


class DriveHashCreationJob:
    def __init__(self, drive_hash_settings: DriveCreationHashSettings):
        self._drive_hash_settings = drive_hash_settings

        if self._drive_hash_settings.is_GIP():
            self.drive_creation_path = "/mnt/drive_creation/staging_gip/v{}".format(self._drive_hash_settings.drive_creation_version)
        else:
            self.drive_creation_path = "/mnt/drive_creation/staging/v{}".format(self._drive_hash_settings.drive_creation_version)

        #EX: /mnt/drive_creation/v3.x/CPT/Data/
        self.xfs_data_path = "/mnt/{}/Data".format(self._drive_hash_settings.drive_type)
        self.rsync_source="{}/{}/Data".format(self.drive_creation_path, self._drive_hash_settings.drive_type)

    def _run_command(self, cmd: str, error_message: str="stdout {} stderr {}", is_shell: bool=True):
        proc = subprocess.Popen(cmd,
                                shell=is_shell,
                                stdout=subprocess.PIPE,
                                stderr=subprocess.STDOUT)
        stdout, stderr = proc.communicate()
        if proc.returncode != 0:
            raise Exception(error_message.format(stdout, stderr))

    def _create_text_description_file(self):
        path = self.rsync_source + "/"
        readme_txt = ("Please see CVAH {}/Documentation/ folder for additional details on how to setup or operate "
                      "the Deployable Interceptor Platform (DIP) or the Mobile Interceptor Platform (MIP).".format(self._drive_hash_settings.drive_creation_version))

        if self._drive_hash_settings.is_GIP():
            readme_txt_gip = ("Please see CVAH {}/Documentation/ folder for additional details on how to setup or operate "
                              "the Garrison Interceptor Platform (GIP)".format(self._drive_hash_settings.drive_creation_version))
            with open(path + "GIP_Drive_Readme.txt", 'w') as script:
                script.write(readme_txt_gip)
        elif self._drive_hash_settings.is_CPT():
            with open(path + "CPT_Drive_Readme.txt", 'w') as script:
                script.write(readme_txt)
        else:
            with open(path + "MDT_Drive_Readme.txt", 'w') as script:
                script.write(readme_txt)

    def execute(self):
        print("Creating hashfiles for {} drive".format(self._drive_hash_settings.drive_type))
        self._create_text_description_file()
        create_hashes(self.rsync_source)
        self._create_verification_script()

    def run_verification_script(self):
        print("Performing validation of drive.")
        with FabricConnectionWrapper(self._drive_hash_settings.username,
                                     self._drive_hash_settings.password,
                                     self._drive_hash_settings.ipaddress) as shell:
            shell.run("sudo mount {}6 {}".format(self._drive_hash_settings.external_drive, self.xfs_data_path))
            shell.run(self.xfs_data_path + "/validate_drive.sh")
            shell.run("sudo umount {}6".format(self._drive_hash_settings.external_drive))

    def _create_verification_script(self):
        path = self.rsync_source + "/"
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
