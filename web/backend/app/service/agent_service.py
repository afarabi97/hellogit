import json
import shutil
import tempfile
import traceback
import os

from app import celery, conn_mng
from app.service.socket_service import NotificationMessage, NotificationCode, notify_page_refresh
from app.service.job_service import run_command2, run_command
from bson import ObjectId
from datetime import datetime
from shared.constants import TARGET_STATES, DATE_FORMAT_STR, AGENT_UPLOAD_DIR, PLAYBOOK_DIR
from shared.tfwinrm_util import WindowsConnectionManager
from shared.utils import fix_hostname, decode_password
from pathlib import Path
from pypsrp.powershell import PSDataStreams
from typing import Dict, List


_JOB_NAME = "agent"

AGENT_FILENAME_x64 = 'monitor_install_x86_64.exe'
AGENT_FILENAME_x32 = 'monitor_install_x86.exe'


def _get_extra_vars_build(payload: Dict,
                          install_path_str: str,
                          filename: str,
                          arch: str):
    installer_config = payload['installer_config']
    extra_vars = {
        "system_arch": arch,
        "installer_name": filename,
        "winlog_beat_dest_ip": "" if installer_config['winlog_beat_dest_ip'] == None else installer_config['winlog_beat_dest_ip'].strip(),
        "installer_dir": install_path_str,
        "winlog_beat_dest_port": "" if installer_config['winlog_beat_dest_port'] == None else installer_config['winlog_beat_dest_port'].strip(),
        "install_winlogbeat": installer_config['install_winlogbeat'],
        "install_sysmon": installer_config['install_sysmon'],
        "install_endgame": installer_config['install_endgame'],
        "endgame_server": "" if installer_config['endgame_server_ip'] == None else installer_config['endgame_server_ip'].strip(),
        "endgame_port": "" if installer_config['endgame_port'] == None else installer_config['endgame_port'].strip(),
        "endgame_user": "" if installer_config['endgame_user_name'] == None else installer_config['endgame_user_name'].strip(),
        "endgame_password": decode_password(installer_config['endgame_password']).replace('$', '\\$'),
        "endgame_sensor_id": installer_config['endgame_sensor_id'],
        "targets": []
    }
    return extra_vars


def build_agent_if_not_exists(payload: Dict, filename: str, arch: str):
    folder_name = payload['installer_config']['_id']
    agent_dir = Path(AGENT_UPLOAD_DIR + "/" + folder_name)
    agent_path = Path('{}/{}'.format(str(agent_dir), filename))
    if not agent_path.exists():
        agent_dir.mkdir(parents=True, exist_ok=True)
        extra_vars = _get_extra_vars_build(payload, str(agent_dir), filename, arch)
        command = "ansible-playbook winlogbeat.yml -i inventory.yml -t winlogbeat \
                    --extra-vars '{}'".format(extra_vars)
        print("Command: {}".format(command))
        stdout = run_command(command, working_dir = str(PLAYBOOK_DIR))
        if stdout:
            print(stdout)


class WinRunnerError(Exception):
    pass


class WinRunner:

    def __init__(self,
                 hostname_or_ip: str,
                 configs: Dict,
                 do_uninstall_only: bool=False):
        self._notification = NotificationMessage(role=_JOB_NAME)
        self._payload = configs
        self._target_config = configs["target_config"]
        self._installer_config = configs["installer_config"]
        self._credentials = configs["windows_domain_creds"]
        self._agent_folder_name = self._installer_config['_id']
        self._agent_dir = Path(AGENT_UPLOAD_DIR + "/" + self._agent_folder_name)
        self._hostname_or_ip = hostname_or_ip
        self._installer = None
        self._winapi = None
        self._do_uninstall_only = do_uninstall_only

        self._action = "reinstall"
        if self._do_uninstall_only:
            self._action = "uninstall"

    def _update_windows_host_state(self, new_state: str):
        """
        { "_id" : ObjectId("5d10f8af8937267d139f804a"), "name" : "test", "domain_name" : "bc_domain.sil.local",
        "key_controller" : "win-16bm96c237f.bc_domain.sil.local", "admin_server" : "win-16bm96c237f.bc_domain.sil.local",
        "targets" : [ { "hostname" : "desktop-rgg1jbk", "state" : "Uninstalled", "last_state_change" : "" } ] }
        """
        dt_string = datetime.utcnow().strftime(DATE_FORMAT_STR)
        new_target = { "hostname" : self._hostname_or_ip, "state" : new_state, "last_state_change" : dt_string }
        ret_val = conn_mng.mongo_windows_target_lists.update_one({"_id": ObjectId(self._target_config["_id"]), "targets.hostname": self._hostname_or_ip},
                                                                {"$set": {"targets.$": new_target }} )
        if ret_val.modified_count != 1:
            print("==Failed to update the state of the Windows host")
            print("Modified count: %s" % str(ret_val.modified_count))
            print("==END")

    def _set_installer(self):
        if self._arch_version == 64:
            self._installer = self._agent_dir / AGENT_FILENAME_x64
        else:
            self._installer = self._agent_dir / AGENT_FILENAME_x32

        if not self._installer.exists() or not self._installer.is_file():
            self._notification.setMessage("Failed because the installer file does not exist.")
            self._notification.setStatus(NotificationCode.ERROR.name)
            self._notification.post_to_websocket_api()
            self._update_windows_host_state(TARGET_STATES.error.value)

    def _run_prep_operations_over_smb(self):
        self._winapi.run_smb_command("DEL /F/Q/S C:\\tfplenum_agent\\*.*")
        self._winapi.run_smb_command("RMDIR /Q/S C:\\tfplenum_agent")
        stdout, stderr, rc = self._winapi.run_smb_command("mkdir C:\\tfplenum_agent")
        if rc != 0:
            raise WinRunnerError("Failed to create the tfplenum_agent directory. \nhost: \
                                  {}, \nstdout: {}, \nstderr: {} \nret_code: {}".format(self._hostname_or_ip, stdout, stderr, rc))
        else:
            stdout, stderr, rc = self._winapi.run_smb_command("(wmic os get OSArchitecture)")
            if rc != 0:
                raise WinRunnerError("Failed to get architecture version \nhost: \
                                      {}, \nstdout: {}, \nstderr: {} \nret_code: {}".format(self._hostname_or_ip, stdout, stderr, rc))

            if "64-bit" in stdout:
                self._arch_version = 64
            else:
                self._arch_version = 32

    def _run_post_operatios_over_smb(self):
        if self._do_uninstall_only:
            script = [{"exe": "cmd.exe", "cmd": "cd C:\\tfplenum_agent\\ && .\\{}".format(self._installer.name), "ret_code": True},
                      {"exe": "powershell.exe", "cmd": "cd C:\\tfplenum_agent\\;.\\uninstall.ps1", "ret_code": False, "timeout": 15},
                      {"exe": "cmd.exe", "cmd": "DEL /F/Q/S C:\\tfplenum_agent\\*.*", "ret_code": True},
                      {"exe": "cmd.exe", "cmd": "RMDIR /Q/S C:\\tfplenum_agent", "ret_code": True}]
        else:
            script = [{"exe": "cmd.exe", "cmd": "cd C:\\tfplenum_agent\\ && .\\{}".format(self._installer.name), "ret_code": True },
                      {"exe": "powershell.exe", "cmd": "cd C:\\tfplenum_agent\\;.\\uninstall.ps1", "ret_code": False, "timeout": 15},
                      {"exe": "powershell.exe", "cmd": "cd C:\\tfplenum_agent\\;.\\setup.ps1", "ret_code": False, "timeout": 180}]

        for entry in script:
            cmd = entry["cmd"]
            exe = entry["exe"]
            check_ret_code = entry["ret_code"]
            try:
                stdout, stderr, rc = self._winapi.run_smb_command(cmd, exe, entry["timeout"])
            except KeyError:
                stdout, stderr, rc = self._winapi.run_smb_command(cmd, exe)
            if check_ret_code and rc != 0:
                raise WinRunnerError("Failed to run {} {} {}.".format(cmd, stdout, stderr))

    def _run_prep_powershell_script(self):
        ps_script = "Remove-Item –path C:\\tfplenum_agent –recurse; mkdir C:\\tfplenum_agent"
        stdout, stderr, rc = self._winapi.run_powershell_cmd(ps_script)
        if rc != 0:
            raise WinRunnerError("Failed to run the power shell prep script \
                                  for {}. \n{} \nstdout: {} \nstderr: {} \nret_code: {}".format(self._hostname_or_ip, ps_script, stdout, stderr, rc))
        else:
            stdout, stderr, rc = self._winapi.run_powershell_cmd("(Get-WmiObject Win32_Processor).AddressWidth")
            if rc != 0:
                raise WinRunnerError("Failed to get the architecture version from the host. \
                                      for {}. \nstdout: {} \nstderr: {} \nret_code: {}".format(self._hostname_or_ip, stdout, stderr, rc))
            self._arch_version = int(stdout)

    def _build_agents(self):
        build_agent_if_not_exists(self._payload, AGENT_FILENAME_x64, "x86_64")
        build_agent_if_not_exists(self._payload, AGENT_FILENAME_x32, "x86")

    def _move_agent_installer(self) -> None:
        self._winapi.push_file(str(self._installer), "C:\\tfplenum_agent\\" + self._installer.name)

    def _run_post_powershell_scripts(self):
        if self._do_uninstall_only:
            ps_script = ["cd C:\\tfplenum_agent\\",
                         ".\\{installer_name}".format(installer_name=self._installer.name),
                         ".\\uninstall.ps1",
                         "cd ..",
                         "Remove-Item –path C:\\tfplenum_agent –recurse"]
        else:
            ps_script = ["cd C:\\tfplenum_agent\\",
                         ".\\{installer_name}".format(installer_name=self._installer.name),
                         ".\\uninstall.ps1",
                         ".\\setup.ps1"]

        ps_script = ";".join(ps_script)
        stdout, stderr, rc = self._winapi.run_powershell_cmd(ps_script)
        if rc != 0:
            raise WinRunnerError("Failed to run the powershell {} script for {} \n{}. \nstdout: {} \nstderr: {} \nret_code: {}"
                                 .format(self._action, self._hostname_or_ip, ps_script, stdout, stderr, rc))

    def _set_end_state(self):
        if self._action == 'uninstall':
            self._update_windows_host_state(TARGET_STATES.uninstalled.value)
        else:
            self._update_windows_host_state(TARGET_STATES.installed.value)

        msg = "%s %s successfully completed for Windows host: %s." % (_JOB_NAME.capitalize(), self._action, self._hostname_or_ip)
        self._notification.setMessage(msg)
        self._notification.setStatus(NotificationCode.COMPLETED.name)
        self._notification.post_to_websocket_api()

    def _initalize_winapi(self):
        protocol = self._target_config["protocol"]
        username = self._credentials["user_name"]
        password = self._credentials["password"]

        if protocol == "ntlm" or protocol == "negotiate":
            is_ssl = self._target_config["ntlm"]["is_ssl"]
            dns_suffix = self._target_config["ntlm"]["domain_name"]
            port = self._target_config["ntlm"]["port"]
            self._winapi = WindowsConnectionManager(self._hostname_or_ip,
                                                    protocol,
                                                    username=username,
                                                    password=password,
                                                    ssl=is_ssl,
                                                    port=port,
                                                    dns_suffix=dns_suffix)
        elif protocol == "kerberos":
            dns_suffix = self._target_config["kerberos"]["domain_name"]
            port = self._target_config["kerberos"]["port"]
            self._winapi = WindowsConnectionManager(self._hostname_or_ip,
                                                    "kerberos",
                                                    ssl=False,
                                                    port=port,
                                                    dns_suffix=dns_suffix)
        elif protocol == "smb":
            dns_suffix = self._target_config["smb"]["domain_name"]
            port = self._target_config["smb"]["port"]
            self._winapi = WindowsConnectionManager(self._hostname_or_ip,
                                                    "smb",
                                                    username,
                                                    password,
                                                    port,
                                                    dns_suffix=dns_suffix)
        else:
            raise ValueError("The protocol passed in is not supported.")

    def execute(self) -> int:
        self._notification.setMessage("%s %s for %s in progress." % (_JOB_NAME.capitalize(), self._action, self._hostname_or_ip) )
        self._notification.setStatus(NotificationCode.IN_PROGRESS.name)
        self._notification.post_to_websocket_api()

        try:
            self._initalize_winapi()

            if self._target_config["protocol"] == "smb":
                try:
                    self._build_agents()
                    self._run_prep_operations_over_smb()
                    self._set_installer()
                    self._move_agent_installer()
                    self._run_post_operatios_over_smb()
                finally:
                    self._winapi.cleanup_smb_command_operations()
            else:
                self._build_agents()
                self._run_prep_powershell_script()
                self._set_installer()
                self._move_agent_installer()
                self._run_post_powershell_scripts()

            self._set_end_state()
        except Exception as e:
            traceback.print_exc()
            self._notification.setMessage(str(e))
            self._notification.setStatus(NotificationCode.ERROR.name)
            self._notification.post_to_websocket_api()
            self._update_windows_host_state(TARGET_STATES.error.value)
        return 0


@celery.task
def perform_agent_reinstall(configs: Dict, hostname_or_ip: str, do_uninstall_only: bool) -> int:
    # print(json.dumps(configs, indent=4, sort_keys=True))
    # print(hostname_or_ip)
    # print(do_uninstall_only)
    try:
        runner = WinRunner(hostname_or_ip, configs, do_uninstall_only)
        return runner.execute()
    finally:
        notify_page_refresh()
