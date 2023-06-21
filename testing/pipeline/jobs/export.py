import logging
import os
import shlex
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Tuple, Union

from fabric import Connection
from invoke.exceptions import UnexpectedExit
from models import Model
from models.common import VCenterSettings
from models.ctrl_setup import ControllerSetupSettings
from models.export import ExportLocSettings, ExportSettings
from models.gip_settings import GIPServiceSettings
from models.rhel_repo_vm import RHELRepoSettings
from util.ansible_util import (execute_playbook, power_on_vms,
                               revert_to_baseline_and_power_on_vms,
                               take_snapshot)
from util.connection_mngs import FabricConnectionWrapper
from util.constants import (CONTROLLER_PREFIX, PIPELINE_DIR,
                            REPO_SYNC_PREFIX)
from util.docs_exporter import MyConfluenceExporter
from util.general import encryptPassword
from util.ssh import test_nodes_up_and_alive
from util.constants import (ROOT_DIR, VM_BUILDER_DIR)
import ruamel.yaml as yaml
from jinja2 import Template

CTRL_EXPORT_PREP = PIPELINE_DIR + "playbooks/ctrl_export_prep.yml"


def create_export_path(export_loc: ExportLocSettings) -> Tuple[Path]:
    staging_export_path = Path(export_loc.staging_export_path + '/')
    staging_export_path.mkdir(parents=True, exist_ok=True)

    cpt_export_path = Path(export_loc.cpt_export_path + '/')
    cpt_export_path.mkdir(parents=True, exist_ok=True)

    mdt_export_path = Path(export_loc.mdt_export_path + '/')
    mdt_export_path.mkdir(parents=True, exist_ok=True)

    return cpt_export_path, mdt_export_path, staging_export_path

def create_export_path2(export_loc: ExportLocSettings, dest: str) -> Tuple[Path]:
    staging_export_path = Path(export_loc.staging_export_path + '/')
    staging_export_path.mkdir(parents=True, exist_ok=True)

    cpt_export_path = Path(f"{staging_export_path}/CPT/{dest}")
    cpt_export_path.mkdir(parents=True, exist_ok=True)

    mdt_export_path = Path(f"{staging_export_path}/MDT/{dest}")
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


def get_commit_hash_or_tag(ctrl_settings: ControllerSetupSettings):
    with FabricConnectionWrapper(ctrl_settings.node.username,
                                 ctrl_settings.node.password,
                                 ctrl_settings.node.ipaddress) as remote_shell:
        try:
            long_hash=remote_shell.run("cd /opt/tfplenum; git log | head -n 1 | awk '{print $2}'", hide=True).stdout.strip()
            short_hash=remote_shell.run(f"cd /opt/tfplenum; git rev-parse --short {long_hash}").stdout.strip()
            return str(short_hash)
        except UnexpectedExit:
            output = remote_shell.run("dnf list installed tfplenum").stdout.strip()
            tag = output.split()[3]
            pos = tag.rfind(".")
            tag = tag[:pos]
            return "rpm_tag_v" + tag


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
    options = "--noSSLVerify --maxVirtualHardwareVersion=14 --diskMode=thin"
    cmd = ("ovftool {option} vi://{username}:'{password}'@{vsphere_ip}/DEV_Datacenter/vm/{folder}/{vm_name} \"{destination}\""
           .format(username=username,
                   option=options,
                   password=vcenter_settings.password,
                   vsphere_ip=vcenter_settings.ipaddress,
                   folder='Releases',
                   vm_name=vm_release_name,
                   destination=str(staging_destination_path)))
    if (vm_release_name == "") :
        print(" Houston: We have a problem:")
        print(" VM_RELEASE_NAME is blank ")
        serr="VM Release Name is BLANK!"
        logging.info(serr)
        logging.error(serr)
        raise(255)

    logging.info("Exporting OVA file to %s. This can take a few hours before it completes." % staging_destination_path)
    logging.info("Command: %s" % cmd)
    proc = subprocess.Popen(shlex.split(cmd), shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    sout, serr = proc.communicate()
    logging.info(sout)
    os.chmod(str(dest), 0o644)
    if serr:
        logging.error(serr)

    clear_based_on_pattern(str(cpt_export_path), export_prefix + "*")
    cpt_destination_path = "{}/{}".format(str(cpt_export_path), export_name)
    shutil.move(staging_destination_path, cpt_destination_path)

    clear_based_on_pattern(str(mdt_export_path), export_prefix + "*")
    mdt_destination_path = "{}/{}".format(str(mdt_export_path), export_name)
    shutil.copy2(cpt_destination_path, mdt_destination_path)


class ControllerExport:

    def __init__(self, ctrl_settings: ControllerSetupSettings, export_loc: ExportLocSettings):
        self.ctrl_settings = ctrl_settings
        self.vcenter_settings = ctrl_settings.vcenter
        self.export_loc = export_loc
        self._export_prefix = CONTROLLER_PREFIX
        self._export_name = ""
        self._release_vm_name = ""
        self._set_private_names_ = 0

    def _set_private(self, commit_hash: str):
        self._set_private_names_ = 1
        self._export_name = self.export_loc.render_export_name(self._export_prefix, commit_hash)
        self._release_vm_name = self._export_name[0:len(self._export_name)-4]

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

    def create_ctrl_template(self):
        revert_to_baseline_and_power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)

        commit_hash = get_commit_hash_or_tag(self.ctrl_settings)
        self._set_private(commit_hash)
        export_password = encryptPassword(self.ctrl_settings.node.export_password)
        payload = self.ctrl_settings.to_dict()
        payload["commands"] = [
            {"vm_shell": "/usr/bin/sed", "vm_shell_args": "-i '/.ontroller/d' /etc/hosts"},
            {"vm_shell": '/bin/nmcli', "vm_shell_args": "connection modify 'Bridge br0' ipv4.method auto ipv4.addresses '' ipv4.gateway '' ipv4.dns ''"},
            {"vm_shell": '/usr/sbin/usermod', "vm_shell_args": f"--password '{export_password}' root"}
        ]
        payload["release_template_name"] = self._release_vm_name
        execute_playbook([CTRL_EXPORT_PREP], payload)

    def export_controller(self):
        self.create_ctrl_template()

        logging.info("Exporting the controller to OVA.")
        export(self.vcenter_settings,
               self.export_loc,
               self._release_vm_name,
               self._export_prefix)


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
        export_password = encryptPassword(self.ctrl_settings.node.export_password)
        payload = self.ctrl_settings.to_dict()
        export_prefix = "GIP_Services"
        export_name = self.export_loc.render_export_name(export_prefix, self.ctrl_settings.node.commit_hash)
        release_vm_name = export_name[0:len(export_name)-4]
        payload["commands"] = [
            {"vm_shell": '/bin/nmcli', "vm_shell_args": 'connection delete ens192'},
            {"vm_shell": '/bin/nmcli', "vm_shell_args": 'connection delete "Wired connection 1"'},
            {"vm_shell": '/usr/sbin/usermod', "vm_shell_args": f"--password '{export_password}' root"}
        ]
        payload["release_template_name"] = release_vm_name
        execute_playbook([CTRL_EXPORT_PREP], payload)
        export(self.vcenter_settings,
               self.export_loc,
               release_vm_name,
               export_prefix)


class ReposyncServerExport(ControllerExport):
    def __init__(self, repo_settings: RHELRepoSettings, export_loc: ExportLocSettings):
        super().__init__(repo_settings, export_loc)
        self._export_prefix = REPO_SYNC_PREFIX
        self._set_private(repo_settings.node.commit_hash)

    def create_release_template(self):
        logging.info("Creating release template for RepoSync Server.")
        revert_to_baseline_and_power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)
        export_password = encryptPassword(self.ctrl_settings.node.export_password)
        payload = self.ctrl_settings.to_dict()
        payload["release_template_name"] = self._release_vm_name
        payload["commands"] = [
            {"vm_shell": '/bin/nmcli', "vm_shell_args": 'connection delete ens192'},
            {"vm_shell": '/bin/nmcli', "vm_shell_args": 'connection delete "Wired connection 1"'},
            {"vm_shell": '/usr/sbin/usermod', "vm_shell_args": f"--password '{export_password}' root"}
        ]
        execute_playbook([PIPELINE_DIR + "playbooks/ctrl_export_prep.yml"], payload)

    def export_reposync_server(self):
        self.create_release_template()

        logging.info("Exporting the Reposync server VM to OVA.")
        export(self.vcenter_settings,
               self.export_loc,
               self._release_vm_name,
               self._export_prefix)


class ConfluenceExport:

    def __init__(self, export_settings: ExportSettings):
        self.html_export_settings = export_settings.html_export
        self.pdf_export_settings = export_settings.pdf_export
        self.doc_export_settings = export_settings.doc_export

    def export_html_docs(self):
        cpt_export_path, mdt_export_path, staging_export_path = create_export_path(self.html_export_settings.export_loc)
        print(f"self.html_export_settings.page_title: {self.html_export_settings.page_title}")
        file_list = self.html_export_settings.page_title.split(",")
        print(f"file list: {file_list}")
        for page_title in file_list:
            if(len(page_title)>0):
                print(f"Exporting: {page_title}")
                confluence = MyConfluenceExporter(url=self.html_export_settings.confluence.url, bearer_token=self.html_export_settings.confluence.bearer_token)
                stage_html_docs_path = confluence.export_page_w_children(str(staging_export_path),
                                                                    self.html_export_settings.export_loc.export_version,
                                                                    "HTML",
                                                                    page_title)
                pos = stage_html_docs_path.rfind("/") + 1
                file_name = stage_html_docs_path[pos:]

                cpt_html_docs_path = "{}/{}".format(str(cpt_export_path), file_name)
                clear_based_on_pattern(str(cpt_export_path), "*.zip")
                shutil.move(stage_html_docs_path, cpt_html_docs_path)

                mdt_html_docs_path = "{}/{}".format(str(mdt_export_path), file_name)
                clear_based_on_pattern(str(mdt_export_path), "*.zip")
                shutil.copy2(cpt_html_docs_path, mdt_html_docs_path)

    def get_doc_manifest(self, ver: str):
        file = ROOT_DIR + "release-doc-manifest.yaml"
        data = None
        yaml_dict = {}
        with open(file, 'r') as file:
            template = Template(file.read())
            rendered_template = template.render(yaml_dict, VERSION=ver)
            data = yaml.safe_load(rendered_template)
        return data

    def export_manifest_docs(self):
        confluence = MyConfluenceExporter(url=self.doc_export_settings.confluence.url, bearer_token=self.doc_export_settings.confluence.bearer_token)
        version = self.doc_export_settings.export_loc.export_version
        manifest = self.get_doc_manifest(version)
        print(f"Staging Export Path: {self.doc_export_settings.export_loc.staging_export_path}", flush=True)
        print(f"Export Version: {version}", flush=True)
        for page_group in manifest:
            if(page_group=="VERSION"):
                continue
            for component in manifest[page_group]:
                if((self.doc_export_settings.export_type=="DIP" and (page_group in ["CPT","MDT","SHARED"])) or
                        (self.doc_export_settings.export_type=="GIP" and page_group=="GIP")):
                    for page_title in component['titles']:
                        if(len(page_title)>0):
                            print(f"Exporting: {page_title}", flush=True)
                            stage_pdf_path = []
                            print(f"Exporting Sub-Pages: {self.doc_export_settings.sub_pages}", flush=True)
                            cpt_export_path, mdt_export_path, staging_export_path = create_export_path2(self.doc_export_settings.export_loc,component['dest'])
                            stage_pdf_path.extend(confluence.export_single_page_pdf(str(staging_export_path),
                                                                    self.doc_export_settings.export_loc.export_version,
                                                                    page_title, sub_pages=(self.doc_export_settings.sub_pages=="True")))
                            for export_pdf_path in stage_pdf_path:
                                if(len(export_pdf_path)==0):
                                    continue
                                if((self.doc_export_settings.export_type=="DIP" and (page_group in ["CPT","SHARED"])) or
                                                (self.doc_export_settings.export_type=="GIP" and page_group=="GIP")):
                                    pos = str(export_pdf_path).rfind("/") + 1
                                    file_name = str(export_pdf_path)[pos:]
                                    cpt_pdf_path = f"{str(cpt_export_path)}/{file_name}"
                                    print(f"Moving {str(export_pdf_path)} to: {cpt_pdf_path}", flush=True)
                                    shutil.move(str(export_pdf_path), cpt_pdf_path)
                                    if(page_group=="SHARED"):
                                        mdt_pdf_path = f"{str(mdt_export_path)}/{file_name}"
                                        print(f"Copying {cpt_pdf_path} to: {mdt_pdf_path}", flush=True)
                                        shutil.copy2(cpt_pdf_path, mdt_pdf_path)
                                elif(page_group=="MDT"):
                                    mdt_pdf_path = f"{str(mdt_export_path)}/{file_name}"
                                    print(f"Copying {cpt_pdf_path} to: {mdt_pdf_path}", flush=True)
                                    shutil.move(str(export_pdf_path), mdt_pdf_path)

    def export_pdf_docs(self):
        cpt_export_path, mdt_export_path, staging_export_path = create_export_path(self.pdf_export_settings.export_loc)
        print(f"self.pdf_export_settings.page_titles_ary: {self.pdf_export_settings.page_titles_ary}")
        confluence = MyConfluenceExporter(url=self.pdf_export_settings.confluence.url, bearer_token=self.pdf_export_settings.confluence.bearer_token)
        for page_title in self.pdf_export_settings.page_titles_ary:
            if(len(page_title)>0):
                print(f"Exporting: {page_title}")
                stage_pdf_path = []
                print(f"Exporting Sub-Pages: {self.pdf_export_settings.sub_pages}")
                stage_pdf_path.extend(confluence.export_single_page_pdf(str(staging_export_path),
                                                                self.pdf_export_settings.export_loc.export_version,
                                                                page_title, sub_pages=(self.pdf_export_settings.sub_pages=="True")))
                for export_pdf_path in stage_pdf_path:
                    pos = str(export_pdf_path).rfind("/") + 1
                    file_name = str(export_pdf_path)[pos:]
                    cpt_pdf_path = "{}/{}".format(str(cpt_export_path), file_name)
                    print(f"Moving {str(export_pdf_path)} to: {cpt_pdf_path}")
                    shutil.move(str(export_pdf_path), cpt_pdf_path)

                    # Is this necessary? Does MDT have its own set of files to export, or are they the same?
                    mdt_pdf_path = "{}/{}".format(str(mdt_export_path), file_name)
                    print(f"Copying {cpt_pdf_path} to: {mdt_pdf_path}")
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
            confluence = MyConfluenceExporter(url=self.html_export_settings.confluence.url, bearer_token=self.html_export_settings.confluence.bearer_token)
            with tempfile.TemporaryDirectory() as export_path:
                file_to_push = confluence.export_page_w_children(export_path, self.html_export_settings.export_loc.export_version, "HTML", page_title)
                self._push_file_and_unzip(file_to_push, ctrl_settings)
        take_snapshot(ctrl_settings.vcenter, ctrl_settings.node, 'baseline_with_docs')

    def set_perms_restricted_on_page(self):
        page_title = self.html_export_settings.page_title
        confluence = MyConfluenceExporter(url=self.html_export_settings.confluence.url, bearer_token=self.html_export_settings.confluence.bearer_token)
        confluence.set_permissions(page_title)

    def set_perms_unrestricted_on_page(self):
        page_title = self.html_export_settings.page_title
        confluence = MyConfluenceExporter(url=self.html_export_settings.confluence.url, bearer_token=self.html_export_settings.confluence.bearer_token)
        confluence.set_permissions(page_title, is_restricted=False)
