import os
import re
import subprocess
import traceback
import yaml
from threading import Thread

from fabric import Connection
from fabric.runners import Result
from util.hash_util import create_hashes, md5_sum
from models.drive_creation import DriveCreationSettingsv2
from pathlib import Path
from time import sleep
from util.connection_mngs import FabricConnectionWrapper
from paramiko.ssh_exception import SSHException
from typing import List
from models.constants import SubCmd
from jinja2 import Environment, Template, select_autoescape
from jinja2.loaders import FileSystemLoader

from uuid import uuid4
from models.constants import SubCmd

ROOT_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../../../"
PIPELINE_DIR = ROOT_DIR + "/testing/pipeline/"
TEMPLATES_DIR = PIPELINE_DIR + "/templates"
THREAD_STATUS = [0] * 32
VALID_DRIVE_TYPES = ["CPT", "MDT", "GIP"]
ERROR_MESSAGE = [
        "ERROR 00: No Errors on the drives",                                                          #  0
        "ERROR 01: Could not BURN the MULTIBOOT image to {} ({})",                                    #  1
        "ERROR 02: Could not SYNC the drive {} after burning the MULTIBOOT image ({})",               #  2
        "ERROR 03: Could not create partition 5, NTFS, on {} ({})",                                   #  3
        "ERROR 04: Could not create partition 5, XFS, on {} ({})",                                    #  4
        "ERROR 05: Could not perform a PARTPROBE on {} ({})",                                         #  5
        "ERROR 06: Could not make the NTFS partition (5) on {} ({})",                                 #  6
        "ERROR 07: Could not make the XFS partition (6) on {} ({})",                                  #  7
        "ERROR 08: Could not SYNC the drive {} after creating the XFS partition (6) ({})",            #  8
        "ERROR 09: Could not mount the 4 partitions of drive {} ({})",                                #  9
        "ERROR 10: Coult not mount the GIP Data Partition on {} ({})",                                # 10
        "ERROR 11: Could not copy a file to disk {} ({})",                                            # 11
        "ERROR 12: Could not SYNC the Data partition {} after the rsync ({})",                        # 12
        "ERROR 13: Could not copy the necessary ISO files to disk {} ({})",                           # 13
        "ERROR 14: Could not copy the necessary EXE/exe files to disk {} ({})",                       # 14
        "ERROR 15: Could not SYNC the drive {} after file 'ks.cfg' copied to disk. ({})",             # 15
        "ERROR 16: Could not copy the release files to the disk {} ({})",                             # 16
        "ERROR 17: An EXCEPTION error occurred for the disk {} ({}) during creation",                 # 17
        "ERROR 18: AN EXCEPTION error occurred for the disk {} ({}) during verification",             # 18
        "ERROR 19: Invalid drive creation type selected, {} for {}",                                  # 19
        "ERROR 20: Could not SYNC the drive {} after creating the XFS/NTFS partitions (5 & 6) ({})",  # 20
        "ERROR 21: Could not create the directories needed to mount {} as needed. ({})",              # 21
        "ERROR 22: Could not clear the disk {} ({})",                                                 # 22
        "ERROR 23: Could not delete the mount directories used for {} as needed. ({})",               # 23
        "ERROR 24: Could not mount disk {} for verificarion. ({})",                                   # 24
        "ERROR 25: Drive verificatio for disk {} had errors. ({})",                                   # 25
        "ERROR 26: Cound not un-mount disk {} after verification. ({})" ]                             # 26

def load_manifest(file: str, type: str, ver: str) -> dict:
        yaml_dict = {}
        with open (file, 'r') as file:
            template = Template(file.read())
            rendered_template = template.render(yaml_dict, VERSION=ver)
            data = yaml.safe_load(rendered_template)
        return data[type]

def remote_sudo_cmd(shell: Connection, command: str, warn=False, hide=False):
    print(command)
    return shell.sudo(command, warn=warn, hide=hide)

class HardDriveInfo:
    name = ""
    size = 0
    def __init__(self, name: str, size: int):
        self.name = name
        self.size = size

def get_plugged_in_drives(shell: Connection) -> List[HardDriveInfo]:
    # Gets plugged in devices from a Ubuntu OS
    # Args:
    #    shell (Connection): Fabric connection to the remote device.
    # Returns:
    #    List[HardDriveInfo]: [{'/dev/sda',100},{'/dev/sdb',2000}...]

    ret_val = remote_sudo_cmd(shell, "ls -1 /dev/sd[a-z]", hide=True)
    all_devices = ret_val.stdout.split("\n")
    filtered_devices = []
    device_sizes: List[HardDriveInfo] = []
    for device in all_devices:
        if len(device) > 0 and not re.search(r'\d+$', device):
            filtered_devices.append(device)
            size = remote_sudo_cmd(shell, f"lsblk -b -n -d -o SIZE {device}", hide=True)
            str_size=size.stdout.split("\n")[0]
            if(len(str_size)):
                sz=int(str_size)
                sz=round(sz/(1024*1024*1024))
                info = HardDriveInfo(device,sz)
                device_sizes.append(info)
    return device_sizes

class DriveSuperThread(Thread):
    def __init__(self,
                 index: int,
                 drive_path: HardDriveInfo,
                 create_drive_type: str):
        Thread.__init__(self)
        if create_drive_type not in VALID_DRIVE_TYPES:
            THREAD_STATUS[index] = 19
            raise ValueError(f"Drive type {create_drive_type} is invalid it must be {str(VALID_DRIVE_TYPES)}")

        self.thread_id = index
        self.shell = None
        self.drive_path = drive_path.name
        self.drive_size = drive_path.size
        self.create_drive_type = create_drive_type
        self._return_value = 0

    def _exit(self):
        THREAD_STATUS[self.thread_id] = self._return_value
        exit(self._return_value)

    def print_std_message(self, msg: str):
        print(f"Thread ID: {self.thread_id} Drive Path: {self.drive_path} Drive Size: {self.drive_size}GiB Drive Type: {self.create_drive_type} Message: {msg}")

    def remote_sudo_cmd(self, command: str, warn=False, hide=False, shell=False):
        try:
            self.print_std_message(command)
            return self.shell.sudo(command, warn=warn, hide=hide)
        except SSHException as e:
            self.print_std_message(str(e))
            self.print_std_message(f"SSH Exception : {self.thread_id} : {command}")
            fabric = FabricConnectionWrapper(self.drive_settings.username,
                                             self.drive_settings.password,
                                             self.drive_settings.ipaddress)
            self.shell = fabric.connection
            return self.shell.sudo(command, warn=warn, hide=hide)

    def Error_Check(self, status, Thread_Status: int):
        if status.return_code != 0:
            self._return_value = Thread_Status
            self._exit

class DriveCreationThread(DriveSuperThread):
    def __init__(self,
                 index: int,
                 drive_settings: DriveCreationSettingsv2,
                 drive_path: HardDriveInfo,
                 create_drive_type: str):
        DriveSuperThread.__init__(self, index, drive_path, create_drive_type)
        self.drive_settings = drive_settings

        self.drive_creation_path = f"{self.drive_settings.drive_creation_path}/{self.drive_settings.staging_export_path}/v{self.drive_settings.drive_creation_version}"
        self.multiboot_path = f"{self.drive_creation_path}/MULTIBOOT"
        self.multiboot_img = "MULTIBOOT.img"
        self.multiboot_img_staging = f"{self.multiboot_path}/{self.multiboot_img}"
        self.mount_path = f"/mnt/{self.thread_id}"
        self.multi1_path = f"{self.mount_path}/MULTI1"
        self.multi2_path = f"{self.mount_path}/MULTI2"
        self.ntfs_data_path = f"{self.mount_path}/FAT32data"
        self.xfs_data_path = f"{self.mount_path}/Data"

        self.rsync_source=f"{self.drive_creation_path}/{self.create_drive_type}/Data/"
        self.ROOT_DIR=f"{self.rsync_source}CVAH\ {self.drive_settings.drive_creation_version}/Software/Physical_Stack_Build/"

    def _create_mount_dirs(self):
        self.Error_Check( self.remote_sudo_cmd(f"rm -fr {self.mount_path}"), 23)
        self.Error_Check( self.remote_sudo_cmd(f"mkdir -p {self.multi1_path} {self.multi2_path} {self.ntfs_data_path} {self.xfs_data_path}"), 21)

    def _clear_the_disk(self):
        self.Error_Check( self.remote_sudo_cmd(f"dd if=/dev/zero of={self.drive_path} bs=65536 count=100 status=none", warn=True), 22)

    def _unmount(self):
        self.remote_sudo_cmd(f"umount {self.drive_path}*", warn=True)
        self.remote_sudo_cmd(f"umount /dev/mapper/luksData{self.thread_id}", warn=True)
        self.remote_sudo_cmd(f"cryptsetup -v luksClose /dev/mapper/luksData{self.thread_id}", warn=True)

    def _burn_image_to_disk(self):
        self.Error_Check( self.remote_sudo_cmd(f"dd bs=65536 if={self.multiboot_img_staging} of={self.drive_path} status=none"), 1)
        self.Error_Check( self.remote_sudo_cmd(f"sync {self.drive_path}"), 2)
        self.Error_Check( self.remote_sudo_cmd(f"partprobe {self.drive_path}"), 5)

    def _fix_partition_five_and_six(self):
        # Deletes partion 5 and 6 because they are jacked and recreates them
        # with appropriate partition IDs.

        if(self.drive_size > 1500):
            self.Error_Check( self.remote_sudo_cmd(f"parted {self.drive_path} mkpart logical ntfs 32.2GB 400.2GB"), 3)
            self.Error_Check( self.remote_sudo_cmd(f"parted {self.drive_path} mkpart logical 400.2GB 2000GB"), 4)
            #self.Error_Check( self.remote_sudo_cmd(f"mkfs.xfs /dev/mapper/luksData{self.thread_id}"), 4)
        else:
            self.Error_Check( self.remote_sudo_cmd(f"sfdisk {self.drive_path} --delete 3"), 3)
            self.Error_Check( self.remote_sudo_cmd(f"parted {self.drive_path} mkpart extended 32.2GB 1000GB"), 3)
            self.Error_Check( self.remote_sudo_cmd(f"parted {self.drive_path} mkpart logical ntfs 32.2GB 200.2GB"), 3)
            self.Error_Check( self.remote_sudo_cmd(f"parted {self.drive_path} mkpart logical 200.2GB 1000GB"), 4)
            #self.Error_Check( self.remote_sudo_cmd(f"mkfs.xfs /dev/mapper/luksData{self.thread_id}"), 4)

        self.Error_Check( self.remote_sudo_cmd(f"sync {self.drive_path}"), 20)
        self.Error_Check( self.remote_sudo_cmd(f"partprobe {self.drive_path}"), 5)
        sleep(10)
        self._create_luks_partitions()
        # self.Error_Check( self.remote_sudo_cmd(f"bash -c 'echo -n {self.drive_settings.luks_password} | base64 -d | cryptsetup -y -v luksFormat {self.drive_path}6 -d -'"), 4)
        # sleep(10)
        # self.Error_Check( self.remote_sudo_cmd(f"bash -c 'echo -n {self.drive_settings.luks_password} | base64 -d | cryptsetup -v luksOpen {self.drive_path}6 luksData{self.thread_id} -d -'"), 4)
        # sleep(10)

    def _create_ntfs_data_partition(self):
        self.Error_Check( self.remote_sudo_cmd(f"mkfs.ntfs {self.drive_path}5 -f -L NTFSDATA"), 6)
        sleep(5)

    def _create_xfs_data_partition(self):
        drive=f"{self.drive_path}1"
        if self.drive_settings.is_burn_multiboot():
            drive = f"{self.drive_path}6"
        self.Error_Check( self.remote_sudo_cmd(f"mkfs.xfs -f /dev/mapper/luksData{self.thread_id} -L Data"), 7)
        self.Error_Check( self.remote_sudo_cmd(f"sync {drive}"), 8)
        sleep(5)

    def _mount(self):
        if(self.drive_settings.is_burn_multiboot()):
            self.Error_Check( self.remote_sudo_cmd(f"mount {self.drive_path}1 {self.multi1_path}"), 9)
            self.Error_Check( self.remote_sudo_cmd(f"mount {self.drive_path}2 {self.multi2_path}"), 9)
            self.Error_Check( self.remote_sudo_cmd(f"mount {self.drive_path}5 {self.ntfs_data_path}"), 9)
        self.Error_Check( self.remote_sudo_cmd(f"mount /dev/mapper/luksData{self.thread_id} {self.xfs_data_path}"), 9)
        sleep(3)

    def _remove_txt_files(self, folder: str):
        for path in Path(folder).glob("*.txt"):
            path.unlink()

    def _sudo_copy_to_drive_creation(self,
                                     source_path: str,
                                     dest_path: str):
        self.Error_Check( self.remote_sudo_cmd(f"cp {source_path} {dest_path}"), 11)

    def _sudo_copy_from_buffer_to_drive_creation(self,
                                                 source_buffer: str,
                                                 dest_path: str):
        file_path = f"/mnt/drive_creation/{str(uuid4())}"
        Output = open(file_path, 'w')
        Output.write(source_buffer)
        Output.close()
        self._sudo_copy_to_drive_creation(file_path, dest_path)
        self.remote_sudo_cmd(f"rm -fr {file_path}")

    def _create_menus(self) -> List[str]:
        # Loops over all the iso files in /mnt/drive_creation/v<CVAH VERSION>/MULTIBOOT/isos.
        # Creates txt files needed for MULTIBoot creation before they get copied onto the drive.

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
            self._sudo_copy_from_buffer_to_drive_creation("title ^Alt+{letter} {title} [Alt+{letter}]".
                                                          format(title=name_without_ext,
                                                                 letter=letter.upper()),
                                                          dest_path)
        return menu_entries

    def _create_startup_menu(self, menu_entries: List[str]):
        startup_menu_template = "startup_menu.txt"
        startup_menu_template_path = TEMPLATES_DIR + "/" + startup_menu_template

        with open(startup_menu_template_path, "r") as f:
            contents = f.readlines()
        f.close()

        pos = 0
        for index, line in enumerate(contents):
            if "# FIRST MENU ENTRY HERE" in line:
                pos = index + 1
                break

        contents = contents[0: pos] + menu_entries + contents[pos:]
        contents = "".join(contents)

        dest_path = f"{self.multi2_path}/boot/grubfm/{startup_menu_template}"
        self._sudo_copy_from_buffer_to_drive_creation(contents, dest_path)

    def _copy_multiboot_files(self):
        # Copy ISOs and their associated txt files.
        self.Error_Check( self.remote_sudo_cmd(f"rsync -tr --stats {self.multiboot_path}/isos/*.iso {self.multi1_path}/_ISO/MAINMENU/"), 13)

        # Copy EXEs
        exes_files = self.multiboot_path + "/exes/*.[Ee][Xx][Ee]"
        self.Error_Check( self.remote_sudo_cmd(f"cp {exes_files} {self.multi2_path}"), 14)

        # Copy kickstart file to root of all Fat32 partitions.
        self._sudo_copy_to_drive_creation(self.ROOT_DIR + "infrastructure/ESXi/ks.cfg",
                                          self.multi2_path + "/ks.cfg")
        self.Error_Check( self.remote_sudo_cmd(f"sync {self.multi2_path}"), 15)

    def _rsync_data_files(self):
        self.Error_Check( self.remote_sudo_cmd(f"rsync -ah --numeric-ids --sparse --stats {self.rsync_source}* {self.xfs_data_path}"), 16)
        self.Error_Check( self.remote_sudo_cmd(f"sync {self.xfs_data_path}"), 12)

    def create_link(self, vm_dir: str, dest_dir: str):
        orgin_vm_path = vm_dir.split("/")[-2:-1]
        orgin_vm_path = "/".join(orgin_vm_path)
        orgin_type_path = dest_dir.split("/")[-3:]
        orgin_type_path = "/".join(orgin_type_path)
        link_src = self.xfs_data_path + "/" + orgin_type_path + "/" + orgin_vm_path
        link_vm_path = vm_dir.split("/")[-3:-1]
        link_vm_path = "/".join(link_vm_path)
        link_type_path = dest_dir.split("/")[-3:-1]
        link_type_path = "/".join(link_type_path)
        link_dest = self.xfs_data_path + "/" + link_type_path + "/" + link_vm_path
        self.remote_sudo_cmd(f"ln -s -r '{link_src}' '{link_dest}'")

    def create_vm_symlinks(self):
        if (self.create_drive_type == 'CPT') or (self.create_drive_type == 'MDT'):
            manifest = load_manifest(SubCmd.manifest_file, self.create_drive_type, self.drive_settings.drive_creation_version)
            for path in manifest:
                for src in path['src']:
                    if path['app'] == 'VMs':
                        self.create_link(src, path['dest'])

    def _create_luks_partitions(self):
        drive_path=f"{self.drive_path}1"
        if self.drive_settings.is_burn_multiboot():
            drive_path = f"{self.drive_path}6"
        else:
            self.Error_Check( self.remote_sudo_cmd(f"parted -s {self.drive_path} mklabel msdos"), 4)
            self.Error_Check( self.remote_sudo_cmd(f"parted -s {self.drive_path} mkpart primary 0% 100%"), 4)
        self.Error_Check( self.remote_sudo_cmd(f"bash -c 'echo -n {self.drive_settings.luks_password} | base64 -d | cryptsetup -y -v luksFormat {drive_path} -d -'"), 4)
        sleep(10)
        self.Error_Check( self.remote_sudo_cmd(f"bash -c 'echo -n {self.drive_settings.luks_password} | base64 -d | cryptsetup -v luksOpen {drive_path} luksData{self.thread_id} -d -'"), 4)
        sleep(10)

    def run(self):
        fabric = FabricConnectionWrapper(self.drive_settings.username,
                                         self.drive_settings.password,
                                         self.drive_settings.ipaddress)
        try:
            self.shell = fabric.connection
            #self._check_external_drive()
            self._unmount()
            self._create_mount_dirs()
            self._clear_the_disk()
            if self.drive_settings.is_burn_multiboot(): # DIP only
                self._burn_image_to_disk()
                self._fix_partition_five_and_six()
                self._create_ntfs_data_partition()
            else: # GIP only
                self._create_luks_partitions()

            self._create_xfs_data_partition()           # DIP & GIP
            self._mount()                               # DIP & GIP

            if self.drive_settings.is_burn_multiboot(): # DIP Only
                menu_entries = self._create_menus()
                self._create_startup_menu(menu_entries)
                self._copy_multiboot_files()

            self._rsync_data_files()
            if self.drive_settings.is_burn_multiboot(): # DIP Only
                self.create_vm_symlinks()
            self._unmount()
        except Exception as e:
            traceback.print_exc()
            self._return_value = 17
            self._exit()
        finally:
            if self.shell:
                self.shell.close()

class DriveCreationJobv2:
    def __init__(self, drive_settings: DriveCreationSettingsv2):
        self.drive_settings = drive_settings
        self.CREATE_DRIVE_TYPE = ""

    def _drive_type(self, index: int):
        self.CREATE_DRIVE_TYPE = ""
        if self.drive_settings.is_mixed():
            is_even = index % 2
            self.CREATE_DRIVE_TYPE = VALID_DRIVE_TYPES[is_even]
        else:
            self.CREATE_DRIVE_TYPE = self.drive_settings.create_drive_type

    def _execute_threads(self, devices: List[HardDriveInfo]):
        threads = []
        for index, device in enumerate(devices):
            self._drive_type(index)
            threads.append(DriveCreationThread(  index,
                                                 self.drive_settings,
                                                 device,
                                                 self.CREATE_DRIVE_TYPE))

        for thread in threads:
            thread.start()

        for thread in threads:
            thread.join()

        Status = 0
        for index, device in enumerate(devices):
            if THREAD_STATUS[index] != 0:
                self._drive_type(index)
                print(f"Device {device.name} did not get CREATED correctly")
                print(ERROR_MESSAGE[THREAD_STATUS[index]].format(device.name, self.CREATE_DRIVE_TYPE))
                Status = 3
        if Status == 0:
            print(ERROR_MESSAGE[0])

        exit(Status)

    def execute(self):
        devices = []
        with FabricConnectionWrapper(self.drive_settings.username,
                                     self.drive_settings.password,
                                     self.drive_settings.ipaddress) as shell:
            devices = get_plugged_in_drives(shell)
        self._execute_threads(devices)

class DriveHashVerificationThread(DriveSuperThread):
    def __init__(self,
                 index: int,
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
            the_drive = f"{self.drive_path}1"
            if self.drive_settings.is_burn_multiboot():
                the_drive = f"{self.drive_path}6"

            self.Error_Check( self.remote_sudo_cmd(f"bash -c 'echo -n {self.drive_settings.luks_password} | base64 -d | cryptsetup -v luksOpen {the_drive} luksData{self.thread_id} -d -'"), 28)
            sleep(10)
            self.Error_Check( self.remote_sudo_cmd(f"mount /dev/mapper/luksData{self.thread_id} {self.xfs_data_path}"), 24)
            sleep(10)
            self.Error_Check( self.remote_sudo_cmd(self.xfs_data_path + "/validate_drive.sh"), 25)
            self.Error_Check( self.remote_sudo_cmd(f"umount /dev/mapper/luksData{self.thread_id}"), 26)
            sleep(10)
            self.Error_Check( self.remote_sudo_cmd(f"cryptsetup -v luksClose /dev/mapper/luksData{self.thread_id}"), 27)

        except Exception as e:
            print("Verification RUN exception")
            traceback.print_exc()
            self._return_value = 18
            self._exit()
        finally:
            if self.shell:
                self.shell.close()

class DriveHashCreationJob:
    def __init__(self, drive_settings: DriveCreationSettingsv2):
        self.drive_settings = drive_settings
        self.drive_creation_path = f"{self.drive_settings.drive_creation_path}/{self.drive_settings.staging_export_path}/v{self.drive_settings.drive_creation_version}"
        self.rsync_source = f"{self.drive_creation_path}/{self.drive_settings.create_drive_type}/Data"
        self.CREATE_DRIVE_TYPE = ""

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
        readme = ""
        if self.drive_settings.is_GIP_Only():
            readme_txt = ("Please see CVAH {}/Documentation/ folder for "
                          "additional details on how to setup or operate "
                          "the Garrison Interceptor Platform (GIP).".format(self.drive_settings.drive_creation_version))
            readme = "GIP_Drive_Readme.txt"
        else:
            readme_txt = ("Please see CVAH {}/Documentation/ folder for "
                          "additional details on how to setup or operate "
                          "the Deployable Interceptor Platform (DIP) "
                          "or the Mobile Interceptor Platform (MIP).".format(self.drive_settings.drive_creation_version))

            if self.drive_settings.is_CPT_Only():
                readme = "CPT_Drive_Readme.txt"
            else:
                readme = "MDT_Drive_Readme.txt"
        with open(path + readme, 'w') as script:
            script.write(readme_txt)

    def _create_verification_script(self):
        path = self.rsync_source + "/"
        md5_hash = md5_sum(path + "drive_md5_hashes.txt")
        validation_script = "#!/bin/bash\n" + \
                            "\n" + \
                            'SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"\n' + \
                            "pushd $SCRIPT_DIR 1>/dev/null 2>&1\n" + \
                            "\n" + \
                            'MD5_SUM_CHECK="$(md5sum drive_md5_hashes.txt 2>/dev/null | cut -d\' \' -f1)"\n' + \
                            "STATUS=0\n" + \
                            "\n" + \
                            'if [ "' + md5_hash + '" != "${MD5_SUM_CHECK}" ] ; then\n' + \
                            '    echo "drive_md5_hashes.txt is invalid actual_hash: ${MD5_SUM_CHECK} expected_hash: ' + md5_hash + '."\n' + \
                            "    STATUS=1\n" + \
                            "else\n" + \
                            "    MD5_SUM_CHECK=$(md5sum --check --quiet drive_md5_hashes.txt 2>&1)\n" + \
                            '    if [ "${MD5_SUM_CHECK}" != "" ] ; then\n' + \
                            '        echo "Checksums for drive failed."\n' + \
                            '        echo "Failed Files are:"\n' + \
                            '        echo "${MD5_SUM_CHECK}"\n' + \
                            "        STATUS=2\n" + \
                            "    else\n" + \
                            '        echo "Checksums are good"\n' + \
                            "    fi\n" + \
                            "fi\n" + \
                            "\n" + \
                            "popd 1>/dev/null 2>&1\n" + \
                            "\n" + \
                            "exit $STATUS"

        if os.path.exists(path + "validate_drive.sh"):
            os.remove(path + "validate_drive.sh")
        with open(path + "validate_drive.sh", 'w') as script:
            script.write(validation_script)

        os.chmod(path + "validate_drive.sh", 0o755 )

    def execute(self):
        print(f"Creating hashfiles for {self.drive_settings.create_drive_type} drive")
        self._create_text_description_file()
        create_hashes(self.rsync_source)
        self._create_verification_script()

    def _drive_type(self, index: int):
        self.CREATE_DRIVE_TYPE = ""
        if self.drive_settings.is_mixed():
            is_even = index % 2
            self.CREATE_DRIVE_TYPE = VALID_DRIVE_TYPES[is_even]
        else:
            self.CREATE_DRIVE_TYPE = self.drive_settings.create_drive_type

    def _execute_threads(self, devices: List[str]):
        threads = []
        for index, device in enumerate(devices):
            self._drive_type(index)
            threads.append(DriveHashVerificationThread(index,
                                                       device,
                                                       self.CREATE_DRIVE_TYPE,
                                                       self.drive_settings))

        for thread in threads:
            thread.start()

        for thread in threads:
            thread.join()

        Status = 0
        for index, device in enumerate(devices):
            if THREAD_STATUS[index] != 0:
                self._drive_type(index)
                print(f"Device {device} did not get CREATED correctly")
                print(ERROR_MESSAGE[THREAD_STATUS[index]].format(device, self.CREATE_DRIVE_TYPE))
                Status = 3
        if Status == 0:
            print(ERROR_MESSAGE[0])
        else :
            exit(Status)

    def run_verification_script(self):
        print("Performing validation of drives.")
        devices = []
        with FabricConnectionWrapper(self.drive_settings.username,
                                     self.drive_settings.password,
                                     self.drive_settings.ipaddress) as shell:
            devices = get_plugged_in_drives(shell)
        self._execute_threads(devices)
