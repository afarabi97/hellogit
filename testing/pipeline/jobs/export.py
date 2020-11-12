import logging
import os
import tempfile
import subprocess
import shlex
import shutil
import sys

from fabric import Connection
from invoke.exceptions import UnexpectedExit
from util.ansible_util import execute_playbook, take_snapshot
from util.connection_mngs import FabricConnectionWrapper
from util.hash_util import hash_file
from models import Model
from models.export import ExportSettings, ExportLocSettings
from models.ctrl_setup import ControllerSetupSettings
from models.common import BasicNodeCreds, NodeSettings, VCenterSettings
from pathlib import Path
from typing import Tuple, Union
from io import StringIO
from util.ansible_util import (power_on_vms, revert_to_baseline_and_power_on_vms,
                               power_off_vms, power_off_vms_gracefully)
from util.docs_exporter import MyConfluenceExporter
from util.ssh import test_nodes_up_and_alive
from models.gip_settings import GIPServiceSettings
from models.rhel_repo_vm import RHELRepoSettings


PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"
CTRL_EXPORT_PREP = PIPELINE_DIR + "playbooks/ctrl_export_prep.yml"
TESTING_DIR = PIPELINE_DIR + "/../"


def create_export_path(export_loc: ExportLocSettings) -> Tuple[Path]:
    staging_export_path = Path(export_loc.staging_export_path + '/')
    staging_export_path.mkdir(parents=True, exist_ok=True)

    cpt_export_path = Path(export_loc.cpt_export_path + '/')
    cpt_export_path.mkdir(parents=True, exist_ok=True)

    mdt_export_path = None
    if export_loc.publish_to_mdt:
        mdt_export_path = Path(export_loc.mdt_export_path + '/')
        mdt_export_path.mkdir(parents=True, exist_ok=True)

    return cpt_export_path, mdt_export_path, staging_export_path


def clear_based_on_pattern(some_path: Union[str, Path], pattern: str):
    if isinstance(some_path, str):
        some_path = Path(some_path)

    if not some_path.exists():
        raise ValueError("{} does not exist.".format(str(some_path)))

    if not some_path.is_dir():
        raise ValueError("{} is not a directory.".format(str(some_path)))

    for file_to_delete in some_path.glob(pattern):
        logging.debug("Deleting {}".format(str(file_to_delete)))
        file_to_delete.unlink()


def prepare_for_export(username: str,
                       password: str,
                       ctrl_ip: str,
                       is_controller: bool=True,
                       ctrl_type: str="dip"):
    with FabricConnectionWrapper(username, password, ctrl_ip) as remote_shell:
        remote_shell.put(PIPELINE_DIR + "scripts/reset_system.sh", "/tmp/reset_system.sh")
        remote_shell.sudo('chmod 755 /tmp/reset_system.sh')
        if is_controller:
            remote_shell.sudo('/tmp/reset_system.sh --reset-controller --iface=ens192 --hostname={}'.format(ctrl_type + "-controller.lan"))
        else:
            remote_shell.sudo('/tmp/reset_system.sh --reset-node --iface=ens192')


def get_commit_hash(username: str,
                    password: str,
                    ctrl_ip: str):
    short_hash = ""
    with FabricConnectionWrapper(username, password, ctrl_ip) as remote_shell:
        long_hash=remote_shell.run("cd /opt/tfplenum; git log | head -n 1 | awk '{print $2}'", hide=True).stdout.strip()
        short_hash=remote_shell.run(f"cd /opt/tfplenum; git rev-parse --short {long_hash}").stdout.strip()
    return str(short_hash)


def export(vcenter_settings: VCenterSettings,
           export_loc: ExportLocSettings,
           vm_release_name: str,
           export_prefix: str):
    """
    Runs the ovftool command that is used to export our controller to an OVA file.

    EX: ovftool --diskMode=thin \
                --noSSLVerify \
                --maxVirtualHardwareVersion=14 \
                vi://david.navarro%40sil.local@172.16.20.106/SIL_Datacenter/vm/Navarro/dnavtest2-controller.lan \
                ~/Desktop/controller.ova
    :param destination: The destination to output too.

    :return:
    """
    cpt_export_path, mdt_export_path, staging_export_path = create_export_path(export_loc)
    export_name = vm_release_name + ".ova"
    staging_destination_path = "{}/{}".format(str(staging_export_path), export_name)

    dest = Path(staging_destination_path)
    if dest.exists() and dest.is_file():
        dest.unlink()

    username = vcenter_settings.username.replace("@", "%40")
    cmd = ("ovftool --noSSLVerify --maxVirtualHardwareVersion=14 --diskMode=thin vi://{username}:'{password}'@{vsphere_ip}"
            "/DEV_Datacenter/vm/{folder}/{vm_name} \"{destination}\""
            .format(username=username,
                    password=vcenter_settings.password,
                    vsphere_ip=vcenter_settings.ipaddress,
                    folder='Releases',
                    vm_name=vm_release_name,
                    destination=str(dest))
            )
    logging.info("Exporting OVA file to %s. This can take a few hours before it completes." % staging_destination_path)
    proc = subprocess.Popen(shlex.split(cmd), shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    sout, serr = proc.communicate()
    logging.info(sout)
    os.chmod(str(dest), 0o644)
    if serr:
        logging.error(serr)

    clear_based_on_pattern(str(cpt_export_path), export_prefix + "*")
    cpt_destination_path = "{}/{}".format(str(cpt_export_path), export_name)
    shutil.move(staging_destination_path, cpt_destination_path)

    if export_loc.publish_to_mdt:
        clear_based_on_pattern(str(mdt_export_path), export_prefix + "*")
        mdt_destination_path = "{}/{}".format(str(mdt_export_path), export_name)
        shutil.copy2(cpt_destination_path, mdt_destination_path)

class MinIOExport:
    def __init__(self, node: NodeSettings, vcenter: VCenterSettings, export_loc: ExportLocSettings):
        self._node = node
        self._vcenter = vcenter
        self._export_loc = export_loc

    def _vsphere_locator_uri_parts(self):
        return {
            'hostname': self._vcenter.ipaddress,
            'username': self._vcenter.username.replace("@", "%40"),
            'password': self._vcenter.password,
            'datacenter': self._vcenter.datacenter,
            'folder': self._node.folder,
            'vmname': self._node.hostname
        }

    def export(self):
        power_on_vms(self._vcenter, self._node)
        test_nodes_up_and_alive(self._node, 10)
        prepare_for_export(self._node.username,
                           self._node.password,
                           self._node.ipaddress,
                           False)
        power_off_vms_gracefully(self._vcenter, self._node)
        payload = {
            "python_executable": sys.executable,
            "vcenter": self._vcenter,
            "node": self._node
        }
        export_prefix = "minio"
        export_name = self._export_loc.render_export_name(export_prefix)
        release_vm_name = export_name[0:len(export_name)-4]
        payload["release_template_name"] = release_vm_name
        execute_playbook([CTRL_EXPORT_PREP], payload)
        export(self._vcenter,
               self._export_loc,
               release_vm_name,
               export_prefix)


class ControllerExport:

    def __init__(self, ctrl_settings: Model, export_loc: ExportLocSettings):
        self.ctrl_settings = ctrl_settings
        self.vcenter_settings = ctrl_settings.vcenter
        self.export_loc = export_loc

    def _run_reclaim_disk_space(self, remote_shell: Connection):
        stat_vfs = os.statvfs("/")
        reserve_space = 500000000 / stat_vfs.f_bavail  #equates to 500 MB in bytes
        num_blocks_to_zero_out = stat_vfs.f_bavail - int(reserve_space)
        cmd = ("dd if=/dev/zero of=/tmp/zerofillfile bs={block_size} count={num_blocks}; "
               "sync;sleep 1;rm -f /tmp/zerofillfile;sync"
               .format(block_size=stat_vfs.f_bsize,
                       num_blocks=num_blocks_to_zero_out))

        ret_val = remote_shell.sudo(cmd, warn=True)
        if ret_val.return_code != 0:
            logging.warn("{} returned with {}.".format(cmd, ret_val.return_code))

        remote_shell.sudo('vmware-toolbox-cmd disk shrinkonly', warn=True)

    def export_controller(self, system_name: str):
        logging.info("Exporting the controller to OVA.")
        valid_system_names = ["DIP", "MIP", "GIP"]
        if system_name not in valid_system_names:
            raise ValueError("Invalid system name {}.  It must be {}".format(system_name, str(valid_system_names)))

        revert_to_baseline_and_power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)
        commit_hash = get_commit_hash(self.ctrl_settings.node.username,
                                      self.ctrl_settings.node.password,
                                      self.ctrl_settings.node.ipaddress)
        prepare_for_export(self.ctrl_settings.node.username,
                           self.ctrl_settings.node.password,
                           self.ctrl_settings.node.ipaddress,
                           ctrl_type=system_name.lower())

        payload = self.ctrl_settings.to_dict()
        export_prefix = "{}_Controller".format(system_name)
        export_name = self.export_loc.render_export_name(export_prefix, commit_hash)
        release_vm_name = export_name[0:len(export_name)-4]
        payload["release_template_name"] = release_vm_name
        execute_playbook([CTRL_EXPORT_PREP], payload)
        export(self.vcenter_settings,
               self.export_loc,
               release_vm_name,
               export_prefix)


class GIPServiceExport(ControllerExport):
    def __init__(self, gip_service_settings: GIPServiceSettings, export_loc: ExportLocSettings):
        controller_settings = ControllerSetupSettings()
        controller_settings.node = gip_service_settings.node
        controller_settings.vcenter = gip_service_settings.vcenter

        super().__init__(controller_settings, export_loc)

    def export_gip_service_vm(self):
        logging.info("Exporting the service vm to OVA.")
        power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)
        prepare_for_export(self.ctrl_settings.node.username,
                           self.ctrl_settings.node.password,
                           self.ctrl_settings.node.ipaddress,
                           False)

        payload = self.ctrl_settings.to_dict()
        export_prefix = "GIP_Services"
        export_name = self.export_loc.render_export_name(export_prefix)
        release_vm_name = export_name[0:len(export_name)-4]
        payload["release_template_name"] = release_vm_name
        execute_playbook([CTRL_EXPORT_PREP], payload)
        export(self.vcenter_settings,
               self.export_loc,
               release_vm_name,
               export_prefix)


class ReposyncServerExport(ControllerExport):
    def __init__(self, repo_settings: RHELRepoSettings, export_loc: ExportLocSettings):
        super().__init__(repo_settings, export_loc)

    def export_reposync_server(self):
        logging.info("Exporting the Reposync server VM to OVA.")
        revert_to_baseline_and_power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)
        prepare_for_export(self.ctrl_settings.node.username,
                           self.ctrl_settings.node.password,
                           self.ctrl_settings.node.ipaddress,
                           False)

        payload = self.ctrl_settings.to_dict()
        export_prefix = "Reposync_Server"
        export_name = self.export_loc.render_export_name(export_prefix)
        release_vm_name = export_name[0:len(export_name)-4]
        payload["release_template_name"] = release_vm_name
        execute_playbook([PIPELINE_DIR + "playbooks/ctrl_export_prep.yml"], payload)
        export(self.vcenter_settings,
               self.export_loc,
               release_vm_name,
               export_prefix)


class ConfluenceExport:

    def __init__(self, export_settings: ExportSettings):
        self.html_export_settings = export_settings.html_export
        self.pdf_export_settings = export_settings.pdf_export

    def export_html_docs(self):
        cpt_export_path, mdt_export_path, staging_export_path = create_export_path(self.html_export_settings.export_loc)
        confluence = MyConfluenceExporter(url=self.html_export_settings.confluence.url,
                                          username=self.html_export_settings.confluence.username,
                                          password=self.html_export_settings.confluence.password)
        stage_html_docs_path = confluence.export_page_w_children(str(staging_export_path),
                                                                 self.html_export_settings.export_loc.export_version,
                                                                 "HTML",
                                                                 self.html_export_settings.page_title)
        pos = stage_html_docs_path.rfind("/") + 1
        file_name = stage_html_docs_path[pos:]

        cpt_html_docs_path = "{}/{}".format(str(cpt_export_path), file_name)
        clear_based_on_pattern(str(cpt_export_path), "*.zip")
        shutil.move(stage_html_docs_path, cpt_html_docs_path)

        if self.html_export_settings.export_loc.publish_to_mdt:
            mdt_html_docs_path = "{}/{}".format(str(mdt_export_path), file_name)
            clear_based_on_pattern(str(mdt_export_path), "*.zip")
            shutil.copy2(cpt_html_docs_path, mdt_html_docs_path)

    def export_pdf_docs(self):
        cpt_export_path, mdt_export_path, staging_export_path = create_export_path(self.pdf_export_settings.export_loc)
        confluence = MyConfluenceExporter(url=self.pdf_export_settings.confluence.url,
                                          username=self.pdf_export_settings.confluence.username,
                                          password=self.pdf_export_settings.confluence.password)
        clear_based_on_pattern(str(cpt_export_path), "*.pdf")
        if self.pdf_export_settings.export_loc.publish_to_mdt:
            clear_based_on_pattern(str(mdt_export_path), "*.pdf")

        for page_title in self.pdf_export_settings.page_titles_ary:
            stage_pdf_path = confluence.export_single_page_pdf(str(staging_export_path),
                                                               self.pdf_export_settings.export_loc.export_version,
                                                               page_title)
            pos = stage_pdf_path.rfind("/") + 1
            file_name = stage_pdf_path[pos:]
            cpt_pdf_path = "{}/{}".format(str(cpt_export_path), file_name)
            shutil.move(stage_pdf_path, cpt_pdf_path)

            if self.pdf_export_settings.export_loc.publish_to_mdt:
                mdt_pdf_path = "{}/{}".format(str(mdt_export_path), file_name)
                shutil.copy2(cpt_pdf_path, mdt_pdf_path)

    def _push_file_and_unzip(self,
                             file_to_push: str,
                             ctrl_settings: ControllerSetupSettings):
        with FabricConnectionWrapper(ctrl_settings.node.username,
                                     ctrl_settings.node.password,
                                     ctrl_settings.node.ipaddress) as remote_shell:
            export_loc = '/var/www/html'
            remote_shell.put(file_to_push, export_loc + '/thisiscvah.zip')
            with remote_shell.cd(export_loc):
                remote_shell.run('rm -rf THISISCVAH/')
                remote_shell.run('unzip thisiscvah.zip -d THISISCVAH/')
                remote_shell.run('ls THISISCVAH/')

    def add_docs_to_controller(self, ctrl_settings: ControllerSetupSettings):
        power_on_vms(ctrl_settings.vcenter, ctrl_settings.node)
        file_to_push = "{}/DIP_{}_HTML_Manual.zip".format(self.html_export_settings.export_loc.cpt_export_path,
                                                          self.html_export_settings.export_loc.export_version)
        if Path(file_to_push).exists():
            self._push_file_and_unzip(file_to_push, ctrl_settings)
        else:
            page_title = self.html_export_settings.page_title
            confluence = MyConfluenceExporter(url=self.html_export_settings.confluence.url,
                                              username=self.html_export_settings.confluence.username,
                                              password=self.html_export_settings.confluence.password)
            with tempfile.TemporaryDirectory() as export_path:
                file_to_push = confluence.export_page_w_children(export_path, self.html_export_settings.export_loc.export_version, "HTML", page_title)
                self._push_file_and_unzip(file_to_push, ctrl_settings)
        take_snapshot(ctrl_settings.vcenter, ctrl_settings.node, 'baseline_with_docs')

    def set_perms_restricted_on_page(self):
        page_title = self.html_export_settings.page_title
        confluence = MyConfluenceExporter(url=self.html_export_settings.confluence.url,
                                          username=self.html_export_settings.confluence.username,
                                          password=self.html_export_settings.confluence.password)
        confluence.set_permissions(page_title)

    def set_perms_unrestricted_on_page(self):
        page_title = self.html_export_settings.page_title
        confluence = MyConfluenceExporter(url=self.html_export_settings.confluence.url,
                                          username=self.html_export_settings.confluence.username,
                                          password=self.html_export_settings.confluence.password)
        confluence.set_permissions(page_title, is_restricted=False)
