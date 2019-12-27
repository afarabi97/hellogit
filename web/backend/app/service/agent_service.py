import json
import re
import requests
import shutil
import sys
import tempfile
import traceback
import os
import zipfile

from app import celery, conn_mng, AGENT_PKGS_DIR
from app.service.socket_service import NotificationMessage, NotificationCode, notify_page_refresh
from app.service.job_service import run_command2, run_command
from bson import ObjectId
from datetime import datetime
from jinja2 import Environment, select_autoescape, FileSystemLoader
from shared.constants import TARGET_STATES, DATE_FORMAT_STR, AGENT_UPLOAD_DIR, PLAYBOOK_DIR
from shared.tfwinrm_util import WindowsConnectionManager
from shared.utils import fix_hostname, decode_password
from pathlib import Path
from pprint import PrettyPrinter
from pypsrp.powershell import PSDataStreams
from typing import Dict, List
from contextlib import ExitStack


_JOB_NAME = "agent"


class EndgameAgentException(Exception):
    pass


class EndgameAgentPuller:

    def __init__(self,
                 endgame_server_ip: str,
                 endgame_user: str,
                 endgame_pass: str,
                 endgame_port: str = "443"):
        self._session = requests.Session()
        self._session.verify = False
        self._endgame_server_ip = endgame_server_ip
        self._endgame_port = endgame_port
        self._endgame_user = endgame_user
        self._endgame_pass = endgame_pass
        self._content_header = { 'Content-Type': 'application/json' }

    def _checkResponse(self, resp, action):
        if(resp.ok):
            return action(resp)
        else:
            PrettyPrinter(stream=sys.stderr).pprint(resp.json())
            raise EndgameAgentException()

    def _merge_dicts(self, d1, *args):
        merged = d1.copy();
        for d in args:
            merged.update(d)
        return merged

    def _get_sensor_configuration(self):
        #Get data about current sensor configuration
        url = 'https://{}:{}/api/v1/deployment-profiles'.format(self._endgame_server_ip, self._endgame_port)
        resp = self._session.get(url)
        sensor_data = self._checkResponse(resp, lambda r : r.json()['data'][0])
        return sensor_data

    def _authenticate(self):
        url = 'https://{}:{}/api/v1/auth/login'.format(self._endgame_server_ip, self._endgame_port)

        resp = self._session.post(url, json = { 'username': self._endgame_user, 'password': self._endgame_pass }, headers = self._content_header)
        return self._checkResponse(resp, lambda r: r.json()['metadata']['token'])

    def _saveInstaller(self, resp, sensor_data, dst_folder: str):
        cd = resp.headers.get('Content-Disposition')
        installer_name = re.search('"(.*)"', cd).group(1)
        installer_path = dst_folder + '/' + installer_name
        with open(installer_path, 'wb') as f:
            f.write(resp.content)

    def getAgentPkg(self, installer_id: str, dst_folder: str) -> str:
        auth_token = self._authenticate()

        auth_header = { "Authorization": "JWT {}".format(auth_token) }
        self._session.headers = self._merge_dicts(self._content_header, auth_header)
        sensor_data = self._get_sensor_configuration()

        #Download the Windows sensor software and save it to a file.
        url = 'https://{}:{}/api/v1/windows/installer/{}'.format(self._endgame_server_ip, self._endgame_port, installer_id)
        resp = self._session.get(url)
        self._saveInstaller(resp, sensor_data, dst_folder)
        return sensor_data['api_key']


class AgentBuilder:

    def __init__(self, payload: Dict):
        self._packages = self._get_packages()
        self._payload = payload
        self._installer_config = payload['installer_config']
        self._install_endgame = self._installer_config["install_endgame"]
        self._output_folder = "/var/www/html/agents/" + self._installer_config["_id"]
        self._zip_path = self._output_folder + '/agent.zip'
        Path(self._output_folder).mkdir(parents=True, exist_ok=True)

    def _create_config(self,
                       template_path: Path,
                       template_ctx: Dict):
        if not template_path.exists() or not template_path.is_file():
            raise ValueError("The template passed in does not exists {}.".format(str(template_path)))

        pos = str(template_path).rfind("/")
        template_dir = str(template_path)[:pos+1]
        template_name = template_path.name
        out_file_path = template_dir + '../' + template_name
        jinja_env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=select_autoescape(['html', 'xml'])
        )
        template = jinja_env.get_template(template_name)
        template_out = template.render(template_ctx=template_ctx)

        with open(str(Path(out_file_path)), "w") as out_file:
            out_file.write(template_out)

    def _copy_package(self, folder_to_copy: str, dst_folder: str):
        pos = folder_to_copy.rfind("/")
        shutil.copytree(folder_to_copy, dst_folder + folder_to_copy[pos:])

    def _package_endgame(self, dst_folder: str):
        if not self._install_endgame:
            return

        folder_to_copy = "/opt/tfplenum/agent_pkgs/endgame"
        agent_puller = EndgameAgentPuller(self._installer_config['endgame_server_ip'].strip(),
                                          self._installer_config['endgame_user_name'].strip(),
                                          decode_password(self._installer_config['endgame_password']),
                                          self._installer_config['endgame_port'].strip())

        api_token = agent_puller.getAgentPkg(self._installer_config['endgame_sensor_id'], folder_to_copy)
        self._create_config(AGENT_PKGS_DIR / "endgame/templates/install.ps1", {"api_token": api_token})
        self._create_config(AGENT_PKGS_DIR / "endgame/templates/uninstall.ps1", {"api_token": api_token})
        self._copy_package(folder_to_copy, dst_folder)
    
    def _get_packages(self):
        with ExitStack() as stack:
            appconfigs = AGENT_PKGS_DIR.rglob('*/appconfig.json')
            packages = {}
            for appconfig in appconfigs:
                _file = stack.enter_context(open(appconfig))
                package_name = json.load(_file).get('name', None)
                packages[package_name] = {'folder': appconfig.parent.name}
            return packages

    def _package_generic(self, pkg_folder: Path, dst_folder: Path, tpl_context: Dict):
        tpl_dir = pkg_folder / 'templates'
        templates = tpl_dir.glob('*')
        for template in templates:
            self._create_config(template, tpl_context)
        folder_to_copy = str(pkg_folder)
        self._copy_package(folder_to_copy, str(dst_folder))

    def _package_generic_all(self, dst_folder: Path):
        customPackages = self._installer_config.get('customPackages', None)
        if customPackages:
            for name, tpl_context in customPackages.items():
                package = self._packages.get(name, None)
                if package:
                    folder = package['folder']
                    pkg_folder = AGENT_PKGS_DIR / folder
                    self._package_generic(pkg_folder, dst_folder, tpl_context)
  
    def _zip_package(self, package_dir: str):
        zipf = zipfile.ZipFile(self._zip_path, 'w', zipfile.ZIP_DEFLATED)
        try:
            for root, dirs, files in os.walk(package_dir):
                for fname in files:
                    abs_path = os.path.join(root, fname)
                    rel_path = abs_path.replace(package_dir, '')
                    zipf.write(os.path.join(root, fname), "/tfplenum_agent" + rel_path)
        finally:
            zipf.close()

    def build_agent(self) -> str:
        # if not Path(self._zip_path).exists():
        with tempfile.TemporaryDirectory() as agent_path: # type: str
            shutil.copy2("/opt/tfplenum/agent_pkgs/install.ps1", agent_path)
            shutil.copy2("/opt/tfplenum/agent_pkgs/uninstall.ps1", agent_path)
            self._package_endgame(agent_path)
            self._package_generic_all(Path(agent_path))
            self._zip_package(agent_path)

        return self._zip_path


def build_agent_if_not_exists(payload: Dict) -> str:
    """
    {'installer_config': {'_id': '5db328ea893726790498601a', 'config_name': 'Winlogbeat and Sysmon',
    'winlog_beat_dest_ip': '172.16.77.212', 'install_sysmon': True, 'install_winlogbeat': True,
    'winlog_beat_dest_port': '5045', 'install_endgame': False, 'endgame_port': '443',
    'endgame_sensor_name': None, 'endgame_password': '', 'endgame_user_name': None,
    'endgame_server_ip': None, 'endgame_sensor_id': None}, 'target_config':
            {'targets': [{'hostname': 'DESKTOP-5', 'state': 'Error', 'last_state_change': '2019-10-28 16:27:15',
             'target_config_id': '5db32917893726790498601b'}], '_id': '5db32917893726790498601b', 'name': 'Negotiate',
             'protocol': 'negotiate', 'ntlm': {'is_ssl': False, 'port': '5985', 'domain_name': 'bc_domain.sil.local'},
             'kerberos': {'domain_name': '', 'key_controller': '', 'admin_server': '', 'port': ''}, 'smb': {'port': '', 'domain_name': ''}}, 'windows_domain_creds': None}
    monitor_install_x86_64.exe
    x86_64
    """
    builder = AgentBuilder(payload)
    return builder.build_agent()


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

        self._prep_powershell_script = "Remove-Item –path C:\\tfplenum_agent –recurse"
        if self._do_uninstall_only:
            self._post_ps_script = '''function Unzip {
                param([string]$zipfile, [string]$outpath)
                $Shell = New-Object -com Shell.Application
                $Shell.Namespace($outpath).copyhere($Shell.NameSpace($zipfile).Items(),4)
            }
            Unzip "C:\\agent.zip" "C:\\"
            cd C:\\tfplenum_agent
            .\\uninstall.ps1
            cd C:\\
            '''
        else:
            self._post_ps_script = '''function Unzip {
                param([string]$zipfile, [string]$outpath)
                $Shell = New-Object -com Shell.Application
                $Shell.Namespace($outpath).copyhere($Shell.NameSpace($zipfile).Items(),4)
            }
            Unzip "C:\\agent.zip" "C:\\"
            cd C:\\tfplenum_agent
            .\\install.ps1
            cd C:\\
            '''

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
        self._installer = self._agent_dir / "agent.zip"

        if not self._installer.exists() or not self._installer.is_file():
            self._notification.setMessage("Failed because the installer file does not exist.")
            self._notification.setStatus(NotificationCode.ERROR.name)
            self._notification.post_to_websocket_api()
            self._update_windows_host_state(TARGET_STATES.error.value)

    def _run_prep_operations_over_smb(self):
        self._winapi.run_smb_command(self._prep_powershell_script)

    def _run_post_operatios_over_smb(self):
        stdout, stderr, rc = self._winapi.run_smb_command(self._post_ps_script)
        print("stdout=======================================================")
        print(stdout)
        print("stderr=======================================================")
        print(stderr)

    def _run_prep_powershell_script(self):
        self._winapi.run_powershell_cmd(self._prep_powershell_script)

    def _build_agents(self):
        build_agent_if_not_exists(self._payload)

    def _move_agent_installer(self) -> None:
        self._winapi.push_file(str(self._installer), "C:\\" + self._installer.name)

    def _run_post_powershell_scripts(self):
        stdout, stderr, rc = self._winapi.run_powershell_cmd(self._post_ps_script)
        print("stdout=======================================================")
        print(stdout)
        print("stderr=======================================================")
        print(stderr)
        if rc != 0:
            raise WinRunnerError("Failed to run the powershell {} script for {} \n{}. \nstdout: {} \nstderr: {} \nret_code: {}"
                                 .format(self._action, self._hostname_or_ip, self._post_ps_script, stdout, stderr, rc))

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
            self._notification.setMessage("Failed to {} {} because of error: {}".format(self._action, self._hostname_or_ip, str(e)))
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
