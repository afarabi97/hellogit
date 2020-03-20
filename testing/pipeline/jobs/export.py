import logging
import os
import tempfile
import subprocess
import shlex

from fabric import Connection
from invoke.exceptions import UnexpectedExit
from util.ansible_util import execute_playbook
from util.connection_mngs import FabricConnectionWrapper
from util.hash_util import hash_file
from models.export import ExportSettings, ExportLocSettings
from models.settings import ControllerSetupSettings, BasicNodeCreds
from pathlib import Path
from io import StringIO
from util.ansible_util import power_on_vms, power_off_vms
from util.docs_exporter import MyConfluenceExporter
from util.ssh import test_nodes_up_and_alive

PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"


def validate_export_location(export_loc: ExportLocSettings):
    if os.path.exists(export_loc.export_path) and os.path.isdir(export_loc.export_path):
        return
    raise ValueError("The export path: {} passed in does not exist \
                        or is not a directory.".format(export_loc.export_path))


def create_export_path(export_loc: ExportLocSettings) -> Path:
    path_to_export = Path(export_loc.export_path + '/' + export_loc.export_version)
    path_to_export.mkdir(parents=True, exist_ok=True)
    return path_to_export


def generate_versions_file(export_loc: ExportLocSettings):
    validate_export_location(export_loc)
    path_to_export = create_export_path(export_loc)
    hashes_content = StringIO()
    proc = subprocess.Popen('git rev-parse HEAD', shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    git_commit_hash, _ = proc.communicate()

    hashes_content.write("TFPlenum Version: {}\n".format(export_loc.export_version))
    hashes_content.write("GIT Commit Hash: {}\n\n".format(git_commit_hash.decode('utf-8')))
    for path in path_to_export.glob("**/*"):
        # Increased chunk size to 30MB so this wont take an ICE age to hash.
        hashes = hash_file(path, chunk_size=30000000)
        hashes_content.write("{}\t\tmd5: {}\n\t\t\tsha1: {}\n\t\t\tsha256: {}\n\n"
            .format(str(path.name), hashes["md5"], hashes["sha1"], hashes["sha256"]))

    with open(str(path_to_export) + '/versions.txt', 'w') as fa:
        fa.write(hashes_content.getvalue())


def publish_to_labrepo(export_loc: ExportLocSettings, creds: BasicNodeCreds):
    validate_export_location(export_loc)
    path_to_export = create_export_path(export_loc)

    with FabricConnectionWrapper(creds.username, creds.password, creds.ipaddress) as remote_shell:
        remote_dir_loc = '/repos/releases/{}'.format(export_loc.export_version)
        remote_shell.run('rm -rf {}'.format(remote_dir_loc))
        remote_shell.run('mkdir -p {}'.format(remote_dir_loc))
        for path in path_to_export.glob("**/*"):
            remote_shell.put(str(path), remote_dir_loc)
        remote_shell.local('rm -rf {}'.format(str(path_to_export)))
    logging.info("Completed the publishing of release deliverables to {}:{}".format(hostname, remote_dir_loc))


class ControllerExport:

    def __init__(self, ctrl_settings: ControllerSetupSettings, export_loc: ExportLocSettings):
        self.ctrl_settings = ctrl_settings
        self.vcenter_settings = ctrl_settings.vcenter
        self.export_loc = export_loc

    def _run_reclaim_disk_space(self, remote_shell: Connection):
        remote_shell.sudo('dd if=/dev/zero of=/tmp/zerofillfile bs=1M ; sync ; rm -rf /tmp/zerofillfile', warn=True)
        remote_shell.sudo('vmware-toolbox-cmd disk shrinkonly', warn=True)

    def _clear_history(self, remote_shell: Connection):
        remote_shell.sudo('cat /dev/null > /root/.bash_history')
        remote_shell.sudo('cat /dev/null > /home/assessor/.bash_history', warn=True)

    def _remove_extra_files(self, remote_shell: Connection):
        remote_shell.sudo('rm -rf /root/.ssh/*')
        remote_shell.sudo('rm -f /opt/tfplenum/.editorconfig')

    def _change_password(self, remote_shell: Connection) -> None:
        # To get hash for a new password run the following bash command and make sure you escape special characters.
        # perl -e "print crypt('<Your Password>', "Q9"),"
        change_root_pwd = "usermod --password Q9sIxtbggUGaw root"
        try:
            remote_shell.sudo(change_root_pwd)
        except UnexpectedExit:
            # For some strange reason, the password files can be
            # locked so we release those locks before changing the password
            remote_shell.sudo('rm -f /etc/passwd.lock')
            remote_shell.sudo('rm -f /etc/shadow.lock')
            remote_shell.sudo(change_root_pwd)

    def _update_network_scripts(self, iface_name: str, remote_shell: Connection):
        iface = ("TYPE=Ethernet\n"
                 "PROXY_METHOD=none\n"
                 "BROWSER_ONLY=no\n"
                 "BOOTPROTO=dhcp\n"
                 "DEFROUTE=yes\n"
                 "IPV4_FAILURE_FATAL=no\n"
                 "IPV6INIT=no\n"
                 "IPV6_AUTOCONF=yes\n"
                 "IPV6_DEFROUTE=yes\n"
                 "IPV6_FAILURE_FATAL=no\n"
                 "IPV6_ADDR_GEN_MODE=stable-privacy\n"
                 "NAME={}\n"
                 "ONBOOT=yes".format(iface_name))

        new_iface_file = StringIO(iface)
        remote_shell.sudo('find /etc/sysconfig -name "ifcfg-*" -not -name "ifcfg-lo" -delete')
        remote_shell.put(new_iface_file, '/etc/sysconfig/network-scripts/ifcfg-{}'.format(iface_name))

    def _prepare_for_export(self,
                            username: str,
                            password: str,
                            ctrl_ip: str):
        with FabricConnectionWrapper(username, password, ctrl_ip) as remote_shell:
            self._update_network_scripts("ens192", remote_shell)
            self._remove_extra_files(remote_shell)
            self._change_password(remote_shell)
            self._run_reclaim_disk_space(remote_shell)
            self._clear_history(remote_shell)

    def _export(self, destination: str):
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
        cmd = ("ovftool --noSSLVerify vi://{username}:'{password}'@{vsphere_ip}"
               "/DEV_Datacenter/vm/{folder}/{vm_name} {destination}"
               .format(username=username,
                       password=self.vcenter_settings.password,
                       vsphere_ip=self.vcenter_settings.ipaddress,
                       folder=self.ctrl_settings.node.folder,
                       vm_name=self.ctrl_settings.node.hostname,
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
        validate_export_location(self.export_loc)
        path_to_export = create_export_path(self.export_loc)

        # power_off_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
        power_on_vms(self.ctrl_settings.vcenter, self.ctrl_settings.node)
        test_nodes_up_and_alive(self.ctrl_settings.node, 10)
        self._prepare_for_export(self.ctrl_settings.node.username,
                                 self.ctrl_settings.node.password,
                                 self.ctrl_settings.node.ipaddress)

        execute_playbook([PIPELINE_DIR + "playbooks/ctrl_export_prep.yml"], self.ctrl_settings.to_dict())
        destination_path = "{}/DIP_{}_Controller.ova".format(str(path_to_export), self.export_loc.export_version)
        self._export(destination_path)


class ConfluenceExport:

    def __init__(self, export_settings: ExportSettings):
        self.html_export_settings = export_settings.html_export
        self.pdf_export_settings = export_settings.pdf_export

    def export_html_docs(self):
        validate_export_location(self.html_export_settings.export_loc)
        path_to_export = create_export_path(self.html_export_settings.export_loc)
        confluence = MyConfluenceExporter(url=self.html_export_settings.confluence.url,
                                          username=self.html_export_settings.confluence.username,
                                          password=self.html_export_settings.confluence.password)
        confluence.export_page_w_children(str(path_to_export),
                                          self.html_export_settings.export_loc.export_version,
                                          ["HTML"],
                                          self.html_export_settings.page_title)

    def export_pdf_docs(self):
        validate_export_location(self.pdf_export_settings.export_loc)
        path_to_export = create_export_path(self.pdf_export_settings.export_loc)
        confluence = MyConfluenceExporter(url=self.pdf_export_settings.confluence.url,
                                          username=self.pdf_export_settings.confluence.username,
                                          password=self.pdf_export_settings.confluence.password)
        for page_title in self.pdf_export_settings.page_titles:
            confluence.export_single_page_pdf(str(path_to_export),
                                              self.pdf_export_settings.export_loc.export_version,
                                              page_title.strip())

    def add_docs_to_controller(self, ctrl_settings: ControllerSetupSettings):
        page_title = self.html_export_settings.page_title
        confluence = MyConfluenceExporter(url=self.html_export_settings.confluence.url,
                                          username=self.html_export_settings.confluence.username,
                                          password=self.html_export_settings.confluence.password)
        with tempfile.TemporaryDirectory() as export_path:
            confluence.export_page_w_children(export_path, self.html_export_settings.export_loc.export_version, "HTML", page_title)
            file_to_push = "{}/DIP_{}_HTML_Manual.zip".format(export_path, self.html_export_settings.export_loc.export_version)
            with FabricConnectionWrapper(ctrl_settings.node.username,
                                         ctrl_settings.node.password,
                                         ctrl_settings.node.ipaddress) as remote_shell:
                export_loc = '/var/www/html'
                remote_shell.put(file_to_push, export_loc + '/thisiscvah.zip')
                with remote_shell.cd(export_loc):
                    remote_shell.run('rm -rf THISISCVAH/')
                    remote_shell.run('unzip thisiscvah.zip -d THISISCVAH/')

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
