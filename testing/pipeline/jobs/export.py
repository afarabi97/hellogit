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
from typing import Tuple
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
    cpt_export_path = Path(export_loc.cpt_export_path + '/')
    cpt_export_path.mkdir(parents=True, exist_ok=True)

    mdt_export_path = Path(export_loc.mdt_export_path + '/')
    mdt_export_path.mkdir(parents=True, exist_ok=True)

    return cpt_export_path, mdt_export_path


def generate_versions_file(export_loc: ExportLocSettings):
    cpt_export_path, mdt_export_path = create_export_path(export_loc)
    hashes_content = StringIO()
    proc = subprocess.Popen('git rev-parse HEAD', shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    git_commit_hash, _ = proc.communicate()

    hashes_content.write("TFPlenum Version: {}\n".format(export_loc.export_version))
    hashes_content.write("GIT Commit Hash: {}\n\n".format(git_commit_hash.decode('utf-8')))
    for path in cpt_export_path.glob("**/*"):
        # Increased chunk size to 30MB so this wont take an ICE age to hash.
        hashes = hash_file(path, chunk_size=30000000)
        hashes_content.write("{}\t\tmd5: {}\n\t\t\tsha1: {}\n\t\t\tsha256: {}\n\n"
            .format(str(path.name), hashes["md5"], hashes["sha1"], hashes["sha256"]))

    cpt_file_path = str(cpt_export_path) + '/versions.txt'
    mdt_file_path = str(mdt_export_path) + '/versions.txt'
    with open(cpt_file_path, 'w') as fa:
        fa.write(hashes_content.getvalue())

    shutil.copy2(cpt_file_path, mdt_file_path)


def prepare_for_export(username: str,
                       password: str,
                       ctrl_ip: str,
                       is_controller: bool=True):
    with FabricConnectionWrapper(username, password, ctrl_ip) as remote_shell:
        remote_shell.put(PIPELINE_DIR + "scripts/reset_system.sh", "/tmp/reset_system.sh")
        remote_shell.sudo('chmod 755 /tmp/reset_system.sh')
        if is_controller:
            remote_shell.sudo('/tmp/reset_system.sh --reset-controller --iface=ens192')
        else:
            remote_shell.sudo('/tmp/reset_system.sh --reset-node --iface=ens192')


class ExportOVF:
    def __init__(self, source_locator, target_locator):
        self.source_locator = source_locator
        self.target_locator = target_locator

    def export(self):
        if (Path(self.target_locator).parent.exists() == False) or (Path(self.target_locator).parent.is_dir() == False):
            raise ValueError("The target_locator is invalid.")

        if Path(self.target_locator).exists() and Path(self.target_locator).is_file():
            Path(self.target_locator).unlink()

        command = ['ovftool', '--noSSLVerify', '--diskMode=thin', self.source_locator, self.target_locator]
        logging.info("Exporting OVA file to {target_locator}. This can take a few hours before it completes.".format(target_locator=self.target_locator))
        process = subprocess.Popen(command, shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        sout, serr = process.communicate()
        logging.info(sout)
        os.chmod(self.target_locator, 0o644)
        if serr:
            logging.error(serr)


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

    @property
    def cpt_export_path(self):
        return "{export_path}/{export_name}".format(export_path=create_export_path(self._export_loc)[0], export_name=self._export_loc.render_export_name("MinIO"))

    @property
    def mdt_export_path(self):
        return "{export_path}/{export_name}".format(export_path=create_export_path(self._export_loc)[1], export_name=self._export_loc.render_export_name("MinIO"))

    @property
    def source_locator(self):
        return "vi://{username}:{password}@{hostname}/{datacenter}/vm/{folder}/{vmname}".format(**self._vsphere_locator_uri_parts())

    @property
    def target_locator(self):
        return self.cpt_export_path

    def export(self):
        power_on_vms(self._vcenter, self._node)
        test_nodes_up_and_alive(self._node, 10)
        prepare_for_export(self._node.username,
                           self._node.password,
                           self._node.ipaddress,
                           False)
        power_off_vms_gracefully(self._vcenter, self._node)
        ExportOVF(self.source_locator, self.target_locator).export()
        logging.info(f"Copying MinIO OVA from {self.cpt_export_path} to {self.mdt_export_path}.")
        shutil.copy2(self.cpt_export_path, self.mdt_export_path)

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

    def _export(self, destination: str, vm_release_name: str):
        """
        Runs the ovftool command that is used to export our controller to an OVA file.

        EX: ovftool --noSSLVerify vi://david.navarro%40sil.local@172.16.20.106/SIL_Datacenter/vm/Navarro/dnavtest2-controller.lan ~/Desktop/controller.ova
        :param destination: The destination to output too.

        :return:
        """
        dest = Path(destination)
        if dest.exists() and dest.is_file():
            dest.unlink()

        username = self.vcenter_settings.username.replace("@", "%40")
        cmd = ("ovftool --noSSLVerify --diskMode=thin vi://{username}:'{password}'@{vsphere_ip}"
               "/DEV_Datacenter/vm/{folder}/{vm_name} \"{destination}\""
               .format(username=username,
                       password=self.vcenter_settings.password,
                       vsphere_ip=self.vcenter_settings.ipaddress,
                       folder='Releases',
                       vm_name=vm_release_name,
                       destination=str(dest))
              )
        logging.info("Exporting OVA file to %s. This can take a few hours before it completes." % destination)
        proc = subprocess.Popen(shlex.split(cmd), shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        sout, serr = proc.communicate()
        logging.info(sout)
        os.chmod(str(dest), 0o644)
        if serr:
            logging.error(serr)

    def export_controller(self):
        logging.info("Exporting the controller to OVA.")
        cpt_export_path, mdt_export_path = create_export_path(self.export_loc)
        revert_to_baseline_and_power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node, 'baseline_with_docs')
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)
        prepare_for_export(self.ctrl_settings.node.username,
                           self.ctrl_settings.node.password,
                           self.ctrl_settings.node.ipaddress)

        payload = self.ctrl_settings.to_dict()
        export_name = self.export_loc.render_export_name("DIP_Controller")
        release_vm_name = export_name[0:len(export_name)-4]
        payload["release_template_name"] = release_vm_name
        execute_playbook([CTRL_EXPORT_PREP], payload)

        cpt_destination_path = "{}/{}".format(str(cpt_export_path), export_name)
        mdt_destination_path = "{}/{}".format(str(mdt_export_path), export_name)
        self._export(cpt_destination_path, release_vm_name)
        shutil.copy2(cpt_destination_path, mdt_destination_path)


class MIPControllerExport(ControllerExport):
    def __init__(self, ctrl_settings: ControllerSetupSettings, export_loc: ExportLocSettings):
        super().__init__(ctrl_settings, export_loc)

    def export_mip_controller(self):
        logging.info("Exporting the controller to OVA.")
        cpt_export_path, mdt_export_path = create_export_path(self.export_loc)

        revert_to_baseline_and_power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node, 'baseline_with_docs')
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)
        prepare_for_export(self.ctrl_settings.node.username,
                           self.ctrl_settings.node.password,
                           self.ctrl_settings.node.ipaddress)

        payload = self.ctrl_settings.to_dict()
        export_name = self.export_loc.render_export_name("MIP_Controller")
        release_vm_name = export_name[0:len(export_name)-4]
        payload["release_template_name"] = release_vm_name
        execute_playbook([CTRL_EXPORT_PREP], payload)

        cpt_destination_path = "{}/{}".format(str(cpt_export_path), export_name)
        mdt_destination_path = "{}/{}".format(str(mdt_export_path), export_name)
        self._export(cpt_destination_path, release_vm_name)
        shutil.copy2(cpt_destination_path, mdt_destination_path)


class GIPServiceExport(ControllerExport):
    def __init__(self, gip_service_settings: GIPServiceSettings, export_loc: ExportLocSettings):
        controller_settings = ControllerSetupSettings()
        controller_settings.node = gip_service_settings.node
        controller_settings.vcenter = gip_service_settings.vcenter

        super().__init__(controller_settings, export_loc)

    def export_gip_service_vm(self):
        logging.info("Exporting the service vm to OVA.")
        cpt_export_path, mdt_export_path = create_export_path(self.export_loc)

        power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)
        prepare_for_export(self.ctrl_settings.node.username,
                           self.ctrl_settings.node.password,
                           self.ctrl_settings.node.ipaddress,
                           False)

        payload = self.ctrl_settings.to_dict()
        export_name = self.export_loc.render_export_name("GIP_Services")
        release_vm_name = export_name[0:len(export_name)-4]
        payload["release_template_name"] = release_vm_name
        execute_playbook([CTRL_EXPORT_PREP], payload)

        cpt_destination_path = "{}/{}".format(str(cpt_export_path), export_name)
        mdt_destination_path = "{}/{}".format(str(mdt_export_path), export_name)
        self._export(cpt_destination_path, release_vm_name)
        shutil.copy2(cpt_destination_path, mdt_destination_path)


class ReposyncServerExport(ControllerExport):
    def __init__(self, repo_settings: RHELRepoSettings, export_loc: ExportLocSettings):
        super().__init__(repo_settings, export_loc)

    def export_reposync_server(self):
        logging.info("Exporting the Reposync server VM to OVA.")
        cpt_export_path, mdt_export_path = create_export_path(self.export_loc)

        revert_to_baseline_and_power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)
        prepare_for_export(self.ctrl_settings.node.username,
                           self.ctrl_settings.node.password,
                           self.ctrl_settings.node.ipaddress,
                           False)

        payload = self.ctrl_settings.to_dict()
        export_name = self.export_loc.render_export_name("Reposync_Server")
        release_vm_name = export_name[0:len(export_name)-4]
        payload["release_template_name"] = release_vm_name
        execute_playbook([PIPELINE_DIR + "playbooks/ctrl_export_prep.yml"], payload)

        cpt_destination_path = "{}/{}".format(str(cpt_export_path), export_name)
        mdt_destination_path = "{}/{}".format(str(mdt_export_path), export_name)
        self._export(cpt_destination_path, release_vm_name)
        shutil.copy2(cpt_destination_path, mdt_destination_path)


class ReposyncWorkstationExport(ControllerExport):
    def __init__(self, repo_settings: RHELRepoSettings, export_loc: ExportLocSettings):
        super().__init__(repo_settings, export_loc)

    def export_reposync_workstation(self):
        logging.info("Exporting the Reposync workstation VM to OVA.")
        cpt_export_path, mdt_export_path = create_export_path(self.export_loc)

        revert_to_baseline_and_power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)
        prepare_for_export(self.ctrl_settings.node.username,
                           self.ctrl_settings.node.password,
                           self.ctrl_settings.node.ipaddress,
                           False)

        payload = self.ctrl_settings.to_dict()
        export_name = self.export_loc.render_export_name("Reposync_Workstation")
        release_vm_name = export_name[0:len(export_name)-4]
        payload["release_template_name"] = release_vm_name
        execute_playbook([PIPELINE_DIR + "playbooks/ctrl_export_prep.yml"], payload)

        cpt_destination_path = "{}/{}".format(str(cpt_export_path), export_name)
        mdt_destination_path = "{}/{}".format(str(mdt_export_path), export_name)
        self._export(cpt_destination_path, release_vm_name)
        shutil.copy2(cpt_destination_path, mdt_destination_path)


class ConfluenceExport:

    def __init__(self, export_settings: ExportSettings):
        self.html_export_settings = export_settings.html_export
        self.pdf_export_settings = export_settings.pdf_export

    def export_html_docs(self):
        cpt_export_path, mdt_export_path = create_export_path(self.html_export_settings.export_loc)
        confluence = MyConfluenceExporter(url=self.html_export_settings.confluence.url,
                                          username=self.html_export_settings.confluence.username,
                                          password=self.html_export_settings.confluence.password)
        cpt_html_docs_path = confluence.export_page_w_children(str(cpt_export_path),
                                                              self.html_export_settings.export_loc.export_version,
                                                              "HTML",
                                                              self.html_export_settings.page_title)
        pos = cpt_html_docs_path.rfind("/") + 1
        file_name = cpt_html_docs_path[pos:]
        mdt_html_docs_path = "{}/{}".format(str(mdt_export_path), file_name)
        shutil.copy2(cpt_html_docs_path, mdt_html_docs_path)

    def export_pdf_docs(self):
        cpt_export_path, mdt_export_path = create_export_path(self.pdf_export_settings.export_loc)
        confluence = MyConfluenceExporter(url=self.pdf_export_settings.confluence.url,
                                          username=self.pdf_export_settings.confluence.username,
                                          password=self.pdf_export_settings.confluence.password)
        for page_title in self.pdf_export_settings.page_titles_ary:
            cpt_pdf_path = confluence.export_single_page_pdf(str(cpt_export_path),
                                                             self.pdf_export_settings.export_loc.export_version,
                                                             page_title)
            pos = cpt_pdf_path.rfind("/") + 1
            file_name = cpt_pdf_path[pos:]
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
