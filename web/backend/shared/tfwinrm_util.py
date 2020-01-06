from base64 import b64encode
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from pypsexec.client import Client as SMBClient
from pypsexec.exceptions import SCMRException
from pypsrp.client import Client
from pypsrp.powershell import PSDataStreams
from pypsrp.shell import Process, SignalCode, WinRS, CommandState
from pypsrp.wsman import WSMan
from shared.utils import fix_hostname
from smbprotocol.exceptions import SMBException, SMBResponseException
from smb.SMBConnection import SMBConnection
from time import sleep
from typing import Tuple, Union, List


WINRM_PROTOCOLS = ("kerberos", "negotiate", "ntlm", "certificate", "smb")
DEFAULT_TIMEOUT = 300

class WinrmFileNotFound(Exception):
    pass

class WinrmCommandFailure(Exception):
    pass


class WindowsConnectionManager:

    def __init__(self,
                 host: str,
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

        self._host = fix_hostname(dns_suffix, host)
        self._pool = None
        self._wsman = None
        self._winrs = None
        self._smb_command_connected = False
        self._protocol = protocol
        self._username = username
        self._password = password

        if protocol not in WINRM_PROTOCOLS:
            raise ValueError("Not a valid protocol please use one of " + str(WINRM_PROTOCOLS))

        if protocol == WINRM_PROTOCOLS[0]:
            self._client = Client(self._host,
                                  auth=WINRM_PROTOCOLS[0],
                                  cert_validation=cert_validation,
                                  port=self._port)
            self._wsman = self._client.wsman
        elif protocol == WINRM_PROTOCOLS[1]:
            self._client = Client(self._host,
                                  username=username,
                                  password=password,
                                  cert_validation=cert_validation,
                                  ssl=ssl,
                                  port=self._port)
            self._wsman = self._client.wsman
        elif protocol == WINRM_PROTOCOLS[2]:
            self._client = Client(self._host,
                                  auth=WINRM_PROTOCOLS[2],
                                  username=username,
                                  password=password,
                                  cert_validation=cert_validation,
                                  ssl=ssl,
                                  port=self._port)
            self._wsman = self._client.wsman
        elif protocol == WINRM_PROTOCOLS[3]:
            self._client = Client(self._host,
                                  auth=WINRM_PROTOCOLS[3],
                                  username=username,
                                  password=password,
                                  cert_validation=cert_validation,
                                  ssl=True,
                                  port=self._port,
                                  certificate_key_pem=certificate_key_pem,
                                  certificate_pem=certificate_pem)
            self._wsman = self._client.wsman
        elif protocol == WINRM_PROTOCOLS[4]:
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

    def run_command(self, cmd: str, timeout_seconds: int=DEFAULT_TIMEOUT) -> Tuple[str, str, int]:
        """
        Executes a Windows remote command.
        :param cmd: The windows command to run
        :param timeout_seconds: Timeout in seconds defaults to 10.
        :return: return_code, stdout, stderr
        """
        with WinRS(self._wsman) as shell:
            process = Process(shell, cmd)
            process.begin_invoke()
            future_time = datetime.utcnow() + timedelta(seconds=timeout_seconds)
            while process.state == CommandState.RUNNING or process.state == CommandState.PENDING:
                process.poll_invoke(30)
                if future_time <= datetime.utcnow():
                    print("The following command timed out: {}".format(cmd))
                    process.signal(SignalCode.CTRL_C)
                    break
                sleep(1)

            process.end_invoke()
            return process.stdout.decode("utf-8"), process.stderr.decode("utf-8"), process.rc

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

    def run_powershell_cmd(self, cmd: str) -> Tuple[str, str, bool]:
        encoded_cmd = b64encode(cmd.encode('UTF-16LE'))
        stdout, stderr, rc = self.run_command("powershell.exe -noprofile -executionpolicy bypass -EncodedCommand {} < nul".format(encoded_cmd.decode("UTF-8")))
        return stdout, stderr, rc

    def run_powershell_file(self, file_path: str) -> Tuple[str, str, bool]:
        stdout, stderr, rc = self.run_command("powershell.exe -noprofile -executionpolicy bypass -file {} < nul".format(file_path))
        return stdout, stderr, rc

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

        if self._protocol == WINRM_PROTOCOLS[4]:
            self._send_over_smb(str(source), remote_dest_path)
        else:
            self._client.copy(str(source), remote_dest_path)

    def fetch_file(self, remote_path: str, local_path: str):
        self._client.fetch(remote_path, local_path)
