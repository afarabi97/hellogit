import threading
import os
import re
import subprocess
import traceback

from fabric import Connection
from fabric.runners import Result
from util.hash_util import create_hashes, md5_sum
from models.drive_creation import DriveCreationSettingsv2
from pathlib import Path
from time import sleep
from util.connection_mngs import FabricConnectionWrapper
from paramiko.ssh_exception import SSHException
from typing import List

from uuid import uuid4

ROOT_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../../../"
PIPELINE_DIR = ROOT_DIR + "/testing/pipeline/"
TEMPLATES_DIR = PIPELINE_DIR + "/templates"


def remote_sudo_cmd(shell: Connection, command: str, warn=False, hide=False):
    print(command)
    return shell.sudo(command, warn=warn, hide=hide)


def get_plugged_in_drives(shell: Connection) -> List[str]:
    """Gets plugged in devices from a Ubuntu OS

    Args:
        shell (Connection): Fabric connection to the remote device.

    Returns:
        List[str]: ['/dev/sda','/dev/sdb'...]
    """
    ret_val = remote_sudo_cmd(shell, "ls /dev/sd*", hide=True) # type: Result
    all_devices = ret_val.stdout.split("\n")
    filtered_devices = []
    for device in all_devices:
        if len(device) > 0 and not re.search(r'\d+$', device):
            filtered_devices.append(device)
    return filtered_devices


class DriveSuperThread(threading.Thread):
    valid_drive_types = ["CPT", "MDT", "GIP"]

    def __init__(self, index: int,
                       drive_path: str,
                       create_drive_type: str):
        threading.Thread.__init__(self)
        if create_drive_type not in self.valid_drive_types:
            raise ValueError(f"Drive type {create_drive_type} is invalid it must be {str(self.valid_drive_types)}")

        self.thread_id = index
        self.shell = None
        self.drive_path = drive_path
        self.create_drive_type = create_drive_type
        self._return_value = 0

    def print_std_message(self, msg: str):
        print(f"Thread ID: {self.thread_id} Drive Path: {self.drive_path} Drive Type: {self.create_drive_type} \
                Message: {msg}")

    def remote_sudo_cmd(self, command: str, warn=False, hide=False, shell=False):
        try:
            self.print_std_message(command)
            return self.shell.sudo(command, warn=warn, hide=hide)
        except SSHException as e:
            print(str(e))
            fabric = FabricConnectionWrapper(self.drive_settings.username,
                                             self.drive_settings.password,
                                             self.drive_settings.ipaddress)
            self.shell = fabric.connection
            self.print_std_message(command)
            return self.shell.sudo(command, warn=warn, hide=hide)

    def remote_run_cmd(self, command: str, warn=False, hide=False):
        try:
            self.print_std_message(command)
            return self.shell.run(command, warn=warn, hide=hide)
        except SSHException as e:
            print(str(e))
            fabric = FabricConnectionWrapper(self.drive_settings.username,
                                             self.drive_settings.password,
                                             self.drive_settings.ipaddress)
            self.shell = fabric.connection
            self.print_std_message(command)
            return self.shell.run(command, warn=warn, hide=hide)


class DriveCreationThread(DriveSuperThread):

    def __init__(self, index: int,
                       drive_settings: DriveCreationSettingsv2,
                       drive_path: str,
                       create_drive_type: str):
        DriveSuperThread.__init__(self, index, drive_path, create_drive_type)
        self.drive_settings = drive_settings

        self.multiboot_img = "MULTIBOOT.img"
        self.multiboot_img_staging = f"/mnt/drive_creation/staging/v{self.drive_settings.drive_creation_version}/MULTIBOOT/{self.multiboot_img}"

        self.drive_creation_path = f"/mnt/drive_creation/staging/v{self.drive_settings.drive_creation_version}"
        if self.drive_settings.is_GIP_Only():
            self.drive_creation_path = f"/mnt/drive_creation/staging_gip/v{self.drive_settings.drive_creation_version}"

        self.multiboot_path = f"{self.drive_creation_path}/MULTIBOOT"
        self.multi1_path = f"/mnt/{self.thread_id}/MULTI1"
        self.multi2_path = f"/mnt/{self.thread_id}/MULTI2"
        self.ntfs_data_path = f"/mnt/{self.thread_id}/FAT32data"
        self.xfs_data_path = f"/mnt/{self.thread_id}/Data"

        self.rsync_source=f"{self.drive_creation_path}/{self.create_drive_type}/Data/*"
        self.ROOT_DIR=f"{self.drive_creation_path}/{self.create_drive_type}/Data/CVAH\ {self.drive_settings.drive_creation_version}/Software/Physical_Stack_Build/"

    def _check_external_drive(self):
        """
        Make sure that the root drive
        """
        result = self.remote_sudo_cmd("grep ' / ' /proc/mounts", shell=True)
        root_drive = result.stdout[0:len(self.drive_path)]
        if root_drive in self.drive_path or root_drive == self.drive_path:
            raise Exception(f"External {self.drive_path} cannot be set to the OS root drive! This would wipe out the OS on the drive creation server.")

    def _create_mount_dirs(self):
        for directory in [self.multi1_path, self.multi2_path, self.ntfs_data_path, self.xfs_data_path]:
            self.remote_sudo_cmd(f"mkdir -p {directory}")

    def _unmount(self):
        self.print_std_message("Making sure external drive is not mounted before proceeding...")
        self.remote_sudo_cmd(f"umount {self.drive_path} {self.drive_path}[123456]", warn=True)

    def _burn_image_to_disk(self):
        self.print_std_message("Burning the MULTIBOOT partition. This may take a while...")
        try:
            self.remote_sudo_cmd(f"dd bs=65536 if={self.multiboot_img_staging} of={self.drive_path} status=none")
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)
        try:
            self.remote_sudo_cmd("sync")
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)
        self.print_std_message("Finished burning the MULTIBOOT partition to drive.")

    def _fix_partition_five_and_six(self):
        """
        Deletes partion 5 and 6 because they are jacked and recreates them
        with appropriate partition IDs.
        """
        try:
            cmd=f"parted {self.drive_path} mkpart logical ntfs 32.2GB 400.2GB"
            self.remote_sudo_cmd(cmd)
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)
            self.remote_sudo_cmd(cmd)
        try:
            cmd=f"parted {self.drive_path} mkpart logical xfs 400.2GB 2000GB"
            self.remote_sudo_cmd(cmd)
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)
        sleep(5)
        try:
            self.remote_sudo_cmd(f"partprobe {self.drive_path}")
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)
        sleep(10)

    def _create_ntfs_data_partition(self):
        cmd = f"mkfs.ntfs {self.drive_path}5 -f -L NTFSDATA"
        try:
            self.remote_sudo_cmd(cmd)
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)
        sleep(5)

    def _create_xfs_data_partition(self):
        self.print_std_message("Creating Data partition...")
        drive=self.drive_path
        if self.drive_settings.is_burn_multiboot():
            drive = f"{self.drive_path}6"
        cmd = f"mkfs.xfs -f {drive} -L Data"

        try:
            self.remote_sudo_cmd(cmd)
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)
        try:
            self.remote_sudo_cmd("sync")
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)
        sleep(5)

    def _mount(self):
        if self.drive_settings.is_burn_multiboot():
            try:
                self.remote_sudo_cmd(f"mount {self.drive_path}1 {self.multi1_path}")
                self.remote_sudo_cmd(f"mount {self.drive_path}2 {self.multi2_path}")
                self.remote_sudo_cmd(f"mount {self.drive_path}5 {self.ntfs_data_path}")
                self.remote_sudo_cmd(f"mount {self.drive_path}6 {self.xfs_data_path}")
            except Exception as e:
                traceback.print_exc()
                self._return_value = 1
                exit(self._return_value)
        else:
            try:
                self.remote_sudo_cmd(f"mount {self.drive_path} {self.xfs_data_path}")
            except Exception as e:
                traceback.print_exc()
                self._return_value = 1
                exit(self._return_value)
        sleep(3)

    def _remove_txt_files(self, folder: str):
        for path in Path(folder).glob("*.txt"):
            path.unlink()

    def _sudo_copy_to_drive_creation(self,
                                     source_path: str,
                                     dest_path: str):
        cmd = f"cp {source_path} {dest_path}"
        try:
            self.remote_sudo_cmd(cmd)
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)

    def _sudo_copy_from_buffer_to_drive_creation(self,
                                                 source_buffer: str,
                                                 dest_path: str):
        file_path = f"/mnt/drive_creation/{str(uuid4())}"
        Output = open(file_path, 'w')
        Output.write(source_buffer)
        Output.close()
        self._sudo_copy_to_drive_creation(file_path, dest_path)
        try:
            self.remote_sudo_cmd("rm -fr {}".format(file_path))
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)

    def _create_menus(self) -> List[str]:
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
            menu_entries.append('make_entry {} {}\n'.format(name_without_ext, letter))
            menu_entries.append("# End {} menu entry\n".format(name_without_ext))

            dest_path = self.multi1_path + "/_ISO/MAINMENU/{}".format(name_without_ext + ".txt")
            self._sudo_copy_from_buffer_to_drive_creation("title ^Alt+{letter} {title} [Alt+{letter}]".format(title=name_without_ext, letter=letter.upper()), dest_path)
        return menu_entries

    def _create_startup_menu(self, menu_entries: List[str]):
        startup_menu_template = "startup_menu.txt"
        startup_menu_template_path = TEMPLATES_DIR + "/" + startup_menu_template

        with open(startup_menu_template_path, "r") as f:
            contents = f.readlines()
        f.close();

        pos = 0
        for index, line in enumerate(contents):
            if "# FIRST MENU ENTRY HERE" in line:
                pos = index + 1
                break

        contents = contents[0: pos] + menu_entries + contents[pos:]
        contents = "".join(contents)

        dest_path = "{}/boot/grubfm/{}".format(self.multi2_path, startup_menu_template)
        self._sudo_copy_from_buffer_to_drive_creation(contents, dest_path)

    def _copy_multiboot_files(self):
        #Copy ISOs and their associated txt files.
        cmd=f"rsync -tr --stats {self.multiboot_path}/isos/*.iso {self.multi1_path}/_ISO/MAINMENU/"
        try:
            self.remote_sudo_cmd(cmd)
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)

        #Copy EXEs
        exes_files = self.multiboot_path + "/exes/*[Ee][Xx][Ee]"
        try:
            self.remote_sudo_cmd(f"cp -v {exes_files} {self.multi2_path}")
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)

        #Copy kickstart file to root of all Fat32 partitions.
        try:
            self._sudo_copy_to_drive_creation(self.ROOT_DIR + "/infrastructure/ESXi/ks.cfg",
                                              self.multi2_path + "/ks.cfg")
            self.remote_sudo_cmd("sync")
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)

    def _rsync_data_files(self):
        self.print_std_message("Copying files to Data partition...")
        try:
            self.remote_sudo_cmd(f"rsync -ah --numeric-ids --stats {self.rsync_source} {self.xfs_data_path}")
            self.remote_sudo_cmd("sync")
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)

    def run(self):
        fabric = FabricConnectionWrapper(self.drive_settings.username,
                                         self.drive_settings.password,
                                         self.drive_settings.ipaddress)
        try:
            self.shell = fabric.connection
            self._check_external_drive()
            self._unmount()
            self._create_mount_dirs()
            if self.drive_settings.is_burn_multiboot():
                self._burn_image_to_disk()
                self._fix_partition_five_and_six()
                self._create_ntfs_data_partition()
                self._create_xfs_data_partition()
                self._mount()

                menu_entries = self._create_menus()
                self._create_startup_menu(menu_entries)
                self._copy_multiboot_files()
            else:
                self._create_xfs_data_partition()
                self._mount()

            self._rsync_data_files()
            self._unmount()
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)
        finally:
            if self.shell:
                self.shell.close()


class DriveCreationJobv2:

    def __init__(self, drive_settings: DriveCreationSettingsv2):
        self.drive_settings = drive_settings

    def _execute_threads(self, devices: List[str]):
        threads = []
        for index, device in enumerate(devices):
            if self.drive_settings.is_mixed():
                is_even = index % 2 == 0
                if is_even:
                    threads.append(DriveCreationThread(index, self.drive_settings, device, "CPT"))
                else:
                    threads.append(DriveCreationThread(index, self.drive_settings, device, "MDT"))
            else:
                threads.append(DriveCreationThread(index, self.drive_settings, device, self.drive_settings.create_drive_type))

        for thread in threads:
            thread.start()

        for thread in threads: # type: DriveSuperThread
            thread.join()

    def execute(self):
        with FabricConnectionWrapper(self.drive_settings.username,
                                     self.drive_settings.password,
                                     self.drive_settings.ipaddress) as shell:
            devices = get_plugged_in_drives(shell)
        self._execute_threads(devices)


class DriveHashVerificationThread(DriveSuperThread):

    def __init__(self, index: int,
                       drive_path: str,
                       create_drive_type: str,
                       drive_settings: DriveCreationSettingsv2):
        DriveSuperThread.__init__(self, index, drive_path, create_drive_type)
        self.xfs_data_path = f"/mnt/{self.thread_id}/Data"
        self.drive_settings = drive_settings

    def run(self):
        fabric = FabricConnectionWrapper(self.drive_settings.username,
                                         self.drive_settings.password,
                                         self.drive_settings.ipaddress)
        try:
            self.shell = fabric.connection
            if self.drive_settings.is_burn_multiboot():
                self.remote_sudo_cmd(f"mount {self.drive_path}6 {self.xfs_data_path}")
            else:
                self.remote_sudo_cmd(f"mount {self.drive_path} {self.xfs_data_path}")

            self.remote_run_cmd(self.xfs_data_path + "/validate_drive.sh")

            if self.drive_settings.is_burn_multiboot():
                self.remote_sudo_cmd(f"umount {self.drive_path}6")
            else:
                self.remote_sudo_cmd(f"umount {self.drive_path}")
        except Exception as e:
            traceback.print_exc()
            self._return_value = 1
            exit(self._return_value)
        finally:
            if self.shell:
                self.shell.close()


class DriveHashCreationJob:
    def __init__(self, drive_settings: DriveCreationSettingsv2):
        self.drive_settings = drive_settings
        self.drive_creation_path = f"/mnt/drive_creation/staging/v{self.drive_settings.drive_creation_version}"
        if self.drive_settings.is_GIP_Only():
            self.drive_creation_path = f"/mnt/drive_creation/staging_gip/v{self.drive_settings.drive_creation_version}"

        self.rsync_source = f"{self.drive_creation_path}/{self.drive_settings.create_drive_type}/Data"

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
        readme_txt = ("Please see CVAH {}/Documentation/ folder for "
                      "additional details on how to setup or operate "
                      "the Deployable Interceptor Platform (DIP) "
                      "or the Mobile Interceptor Platform (MIP).".format(self.drive_settings.drive_creation_version))

        if self.drive_settings.is_GIP_Only():
            readme_txt_gip = ("Please see CVAH {}/Documentation/ folder for "
                              "additional details on how to setup or operate "
                              "the Garrison Interceptor Platform (GIP)".format(self.drive_settings.drive_creation_version))
            with open(path + "GIP_Drive_Readme.txt", 'w') as script:
                script.write(readme_txt_gip)
        elif self.drive_settings.is_CPT_Only():
            with open(path + "CPT_Drive_Readme.txt", 'w') as script:
                script.write(readme_txt)
        else:
            with open(path + "MDT_Drive_Readme.txt", 'w') as script:
                script.write(readme_txt)

    def execute(self):
        print(f"Creating hashfiles for {self.drive_settings.create_drive_type} drive")
        self._create_text_description_file()
        create_hashes(self.rsync_source)
        self._create_verification_script()

    def _execute_threads(self, devices: List[str]):
        threads = []
        for index, device in enumerate(devices):
            if self.drive_settings.is_mixed():
                is_even = index % 2 == 0
                if is_even:
                    threads.append(DriveHashVerificationThread(index, device, "CPT", self.drive_settings))
                else:
                    threads.append(DriveHashVerificationThread(index, device, "MDT", self.drive_settings))
            else:
                threads.append(DriveHashVerificationThread(index, device, self.drive_settings.create_drive_type, self.drive_settings))

        for thread in threads:
            thread.start()

        for thread in threads:
            ret_val = thread.join()
            if ret_val != 0:
                exit(ret_val)

    def run_verification_script(self):
        print("Performing validation of drives.")
        with FabricConnectionWrapper(self.drive_settings.username,
                                     self.drive_settings.password,
                                     self.drive_settings.ipaddress) as shell:
            devices = get_plugged_in_drives(shell)
        self._execute_threads(devices)

    def _create_verification_script(self):
        path = self.rsync_source + "/"
        md5_hash = md5_sum(path + "drive_md5_hashes.txt")
        validation_script = '''
#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
pushd $SCRIPT_DIR 1>/dev/null 2>&1

MD5_SUM_CHECK="$(md5sum drive_md5_hashes.txt 2>/dev/null | cut -d' ' -f1)"
STATUS=0

if [ "''' + md5_hash + '''" != "${MD5_SUM_CHECK}" ] ; then
    echo "drive_md5_hashes.txt is invalid actual_hash: ${MD5_SUM_CHECK} expected_hash: ''' + md5_hash + '''."
    STATUS=1
else
    MD5_SUM_CHECK=$(md5sum --check --quiet drive_md5_hashes.txt 2>&1)
    if [ "${MD5_SUM_CHECK}" != "" ] ; then
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
