import os
import sys
import tempfile

from app.models.cold_log import WinlogbeatInstallModel
from ansible import context
from ansible.cli import CLI
from ansible.module_utils.common.collections import ImmutableDict
from ansible.executor.playbook_executor import PlaybookExecutor
from ansible.parsing.dataloader import DataLoader
from ansible.inventory.manager import InventoryManager
from ansible.vars.manager import VariableManager
from base64 import b64encode
from pathlib import Path
from pypsexec.client import Client as SMBClient
from pypsexec.exceptions import SCMRException
from shared.constants import BEATS_IMAGE_VERSIONS
from shared.utils import fix_hostname
from shared.ansible_collector import CallbackModule
from smbprotocol.exceptions import SMBException, SMBResponseException
from smb.SMBConnection import SMBConnection
from typing import Tuple, Union, List, Dict


BACKEND_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"
REINSTALL_AGENT_PKG = BACKEND_DIR + "playbooks/reinstall.yml"
UNINSTALL_AGENT_PKG = BACKEND_DIR + "playbooks/uninstall.yml"
COLD_LOG_CONFIGURE_WINLOGBEAT = BACKEND_DIR + "playbooks/configure_cold_log_winlogbeat.yml"
COLD_LOG_INSTALL_WINLOGBEAT = BACKEND_DIR + "playbooks/install_winlogbeat_for_cold_log_ingest.yml"

WINRM_PROTOCOLS = ("kerberos", "ntlm", "certificate", "smb")
DEFAULT_TIMEOUT = 300


class WinrmFileNotFound(Exception):
    pass


class WinrmCommandFailure(Exception):
    def __init__(self, message: str, results: Dict, results_list):
        super(WinrmCommandFailure, self).__init__(message, )
        self.results = results
        self.results_list = results_list


class ProtocolNotSupported(Exception):
    pass


def execute_win_playbook(playbooks: List, extra_vars: Dict={},
                         inventory_file: str=None, tags=[],
                         timeout=20) -> Dict:
    """
    :returns:
    {'10_96_0_101': {'ok': 5, 'failures': 0, 'unreachable': 0, 'changed': 5, 'skipped': 1, 'rescued': 0, 'ignored': 0},
    '10_96_0_103': {'ok': 5, 'failures': 0, 'unreachable': 0, 'changed': 5, 'skipped': 1, 'rescued': 0, 'ignored': 0},
    '10_96_0_104': {'ok': 5, 'failures': 0, 'unreachable': 0, 'changed': 5, 'skipped': 1, 'rescued': 0, 'ignored': 0}}
    """
    loader = DataLoader()
    context.CLIARGS = ImmutableDict(tags=tags, listtags=False, listtasks=False,
                                    listhosts=False, syntax=False, connection='ssh',
                                    module_path=None, forks=100, remote_user='xxx', private_key_file=None,
                                    sftp_extra_args=None, scp_extra_args=None, become=True,
                                    become_method='sudo', become_user=None, verbosity=True,
                                    check=False, start_at_task=None,
                                    timeout=timeout)

    inventory = InventoryManager(loader=loader, sources=(inventory_file,))
    variable_manager = VariableManager(loader=loader,
                                       inventory=inventory,
                                       version_info=CLI.version_info(gitinfo=False))
    variable_manager._extra_vars = extra_vars
    pbex = PlaybookExecutor(playbooks=playbooks,
                            inventory=inventory,
                            variable_manager=variable_manager,
                            loader=loader,
                            passwords=None)
    results_callback = CallbackModule()
    pbex._tqm._stdout_callback = results_callback
    status_code = pbex.run()
    print(results_callback.summary)
    if status_code != 0:
        raise WinrmCommandFailure("Failed with status_code {}. Run tail -f /var/log/celery/*.log for more information.".format(status_code), results_callback.summary, results_callback.results)
    return results_callback.summary


def _create_inventoryfile(hosts: List, username: str, password: str,
                          port: int, winrm_transport: str, tmp_dir: str, ansible_winrm_scheme: str) -> str:
    file_path = tmp_dir + "/inventory.ini"
    with open(file_path, "w") as fhandle:
        fhandle.write("[windows_targets]\n")
        for host in hosts:
            host_id = host.replace(".", "_")
            fhandle.write("{} ansible_host={}\n".format(host_id, host))

        fhandle.write("\n")
        fhandle.write("[windows_targets:vars]\n")
        fhandle.write("ansible_user={}\n".format(username))
        fhandle.write('ansible_password="{}"\n'.format(password))
        fhandle.write("ansible_connection=winrm\n")
        fhandle.write("ansible_port={}\n".format(port))
        fhandle.write("ansible_winrm_transport={}\n".format(winrm_transport))
        fhandle.write("ansible_winrm_scheme={}\n".format(ansible_winrm_scheme))
        fhandle.write("ansible_winrm_server_cert_validation=ignore\n")

    return file_path


def reinstall_agent(hosts: Union[List, str], username: str, password: str, port: int, ansible_winrm_scheme: str,
                    winrm_transport="ntlm", agent_zip_path="agents.zip") -> Dict:
    print("Reinstalling agent with hosts: {}, username: {}, port: {}, winrm_scheme: {}, winrm_transport: {}".format(str(hosts), username, port, ansible_winrm_scheme, winrm_transport))
    if isinstance(hosts, str):
        hosts = [hosts]

    ret_val = None
    with tempfile.TemporaryDirectory() as tmp_dir:
        inventory_path = _create_inventoryfile(hosts, username, password, port, winrm_transport, tmp_dir, ansible_winrm_scheme)
        extra_vars = { 'python_executable': sys.executable,
                       "goto_user": username ,
                       "agent_zip_path": agent_zip_path}
        ret_val = execute_win_playbook([REINSTALL_AGENT_PKG] , extra_vars, inventory_path)
    return ret_val


def uninstall_agent(hosts: Union[List, str], username: str, password: str, port: int, ansible_winrm_scheme: str,
                    winrm_transport="ntlm", agent_zip_path="agents.zip") -> Dict:
    print("Uninstalling agent with host: {}, username: {}, port: {}, winrm_scheme: {}, winrm_transport: {}".format(str(hosts), username, port, ansible_winrm_scheme, winrm_transport))
    if isinstance(hosts, str):
        hosts = [hosts]

    if isinstance(hosts, str):
        hosts = [hosts]
    ret_val = None
    with tempfile.TemporaryDirectory() as tmp_dir:
        inventory_path = _create_inventoryfile(hosts, username, password, port, winrm_transport, tmp_dir, ansible_winrm_scheme)
        extra_vars = { 'python_executable': sys.executable,
                       "goto_user": username ,
                       "agent_zip_path": agent_zip_path}
        ret_val = execute_win_playbook([UNINSTALL_AGENT_PKG] , extra_vars, inventory_path)
    return ret_val


def install_winlogbeat_for_cold_log_ingest(config: WinlogbeatInstallModel):
    hosts = config.windows_host
    if isinstance(hosts, str):
        hosts = [config.windows_host]

    ret_val = None
    with tempfile.TemporaryDirectory() as tmp_dir:
        inventory_path = _create_inventoryfile(hosts, config.username, config.password, config.winrm_port, config.winrm_transport, tmp_dir, config.winrm_scheme)
        extra_vars = { 'python_executable': sys.executable,
                        "goto_user": config.username,
                        'beats_version': BEATS_IMAGE_VERSIONS }
        ret_val = execute_win_playbook([COLD_LOG_INSTALL_WINLOGBEAT], extra_vars, inventory_path)
    return ret_val


def configure_and_run_winlogbeat_for_cold_log_ingest(config: WinlogbeatInstallModel,
                                                     cold_log_zip_path: str,
                                                     tmp_dir: str):
    hosts = config.windows_host
    if isinstance(hosts, str):
        hosts = [config.windows_host]

    inventory_path = _create_inventoryfile(hosts, config.username, config.password, config.winrm_port, config.winrm_transport, tmp_dir, config.winrm_scheme)
    extra_vars = { 'python_executable': sys.executable,
                    "goto_user": config.username,
                    'cold_log_zip_path': cold_log_zip_path,
                    'beats_version': BEATS_IMAGE_VERSIONS }
    return execute_win_playbook([COLD_LOG_CONFIGURE_WINLOGBEAT], extra_vars, inventory_path)


class WindowsConnectionManager:

    def __init__(self,
                 host: Union[List, str],
                 protocol: str,
                 username: str=None,
                 password: str=None,
                 port: Union[str, int]=None,
                 ssl: bool=False,
                 cert_validation: bool=False,
                 reconnection_retries: int=5,
                 reconnection_backoff: float=10.0,
                 certificate_pem: str=None,
                 certificate_key_pem: str=None,
                 dns_suffix: str=''):

        if isinstance(port, str):
            self._port = int(port)
        else:
            self._port = port


        if isinstance(host, list):
            self._host = [fix_hostname(dns_suffix, i) for i in host]
        else:
            self._host = fix_hostname(dns_suffix, host)


        self._pool = None
        self._wsman = None
        self._winrs = None
        self._smb_command_connected = False
        self._protocol = protocol
        self._username = username
        self._password = password
        self._is_ssl = ssl

        if protocol not in WINRM_PROTOCOLS:
            raise ValueError("Not a valid protocol please use one of " + str(WINRM_PROTOCOLS))

        if protocol == WINRM_PROTOCOLS[3]:
            self._smb_conn = SMBConnection(username,
                                           password,
                                           "tfcontroller",
                                           self._host,
                                           domain=dns_suffix,
                                           use_ntlm_v2=True,
                                           is_direct_tcp=True)

            self._smb_executer = SMBClient(self._host,
                                           username=username,
                                           password=password,
                                           port=self._port)

    def run_smb_command(self, cmd: str, executable: str="powershell.exe", timeout_seconds: int=DEFAULT_TIMEOUT) -> Tuple[str, str, int]:
        if not self._smb_command_connected:
            try:
                self._smb_executer.connect()
            except SMBException as e:
                print(str(e))
                self._smb_executer = SMBClient(self._host,
                                               username=self._username,
                                               password=self._password,
                                               port=self._port,
                                               encrypt=False)
                self._smb_executer.connect()

            try:
                self._smb_executer.cleanup()
            except (SCMRException, SMBResponseException) as e:
                print("WARN: " + str(e))
            self._smb_executer.create_service()
        self._smb_command_connected = True

        args = "/c \"{}\""
        if executable == "powershell.exe":
            encoded_cmd = b64encode(cmd.encode('UTF-16LE'))
            args = "-noprofile -executionpolicy bypass -EncodedCommand {}".format(encoded_cmd.decode("UTF-8"))

        stdout, stderr, rc = self._smb_executer.run_executable(executable, arguments=args.format(cmd), run_elevated=True, timeout_seconds=timeout_seconds)
        return stdout.decode("utf-8"), stderr.decode("utf-8"), rc

    def cleanup_smb_command_operations(self):
        if self._smb_command_connected:
            try:
                self._smb_executer.cleanup()
            except (SCMRException, SMBResponseException) as e:
                print("WARN: " + str(e))
            self._smb_executer.disconnect()
            self._smb_command_connected = False

    def _send_over_smb(self, source_path: str, dest_path: str):
        self._smb_conn.connect(self._host, self._port)
        try:
            dest_path = dest_path.replace("C:\\", "")
            with open(source_path, 'rb') as file:
                self._smb_conn.storeFile("C$", dest_path, file)
        finally:
            self._smb_conn.close()

    def push_file(self, local_source_file: Union[str, Path],
                        remote_dest_path: str) -> None:
        source = local_source_file
        if isinstance(local_source_file, str):
            source = Path(local_source_file)

        if not source.exists() or not source.is_file():
            raise WinrmFileNotFound("The {} either does not exist or is not a file.".format(source))

        if self._protocol == WINRM_PROTOCOLS[3]:
            self._send_over_smb(str(source), remote_dest_path)
        else:
            raise ProtocolNotSupported("push_file not supported for {}".format(self._protocol))

    def reinstall_agent_pkg(self, agent_zip_path: str) -> Dict:
        ansible_winrm_scheme = "http"
        if self._is_ssl:
            ansible_winrm_scheme = "https"
        return reinstall_agent(self._host, self._username, self._password,
                               self._port, ansible_winrm_scheme,
                               agent_zip_path=agent_zip_path)

    def uninstall_agent_pkg(self, agent_zip_path: str) -> Dict:
        ansible_winrm_scheme = "http"
        if self._is_ssl:
            ansible_winrm_scheme = "https"
        return uninstall_agent(self._host, self._username, self._password,
                               self._port, ansible_winrm_scheme,
                               agent_zip_path=agent_zip_path)

