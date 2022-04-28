#!/opt/tfplenum/.venv/bin/python3
import json
import getpass
import glob
import requests
import subprocess
import shutil
import sys
import tempfile

from uuid import uuid4
from argparse import ArgumentParser, Namespace
from pathlib import Path
from typing import List

sys.path.append('/opt/tfplenum/web/backend/app/utils')

from constants import ColdLogModules


SETUP_CMD = 'setup'
RUN_CMD = 'run'


class OfflineLogProcessor:

    def __init__(self):
        api_gen_cmd = '/opt/tfplenum/.venv/bin/python3 /opt/sso-idp/gen_api_token.py --roles "controller-admin,controller-maintainer,operator" --exp 0.5'
        proc = subprocess.Popen(api_gen_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        stdout, _ = proc.communicate()
        controller_api_key = stdout.decode('utf-8').strip()
        self.session = requests.Session()
        self.session.headers.update({ 'Authorization': 'Bearer '+ controller_api_key })
        self.base_url = 'http://localhost:5001'

    def _find_in_list(self, log_paths: List[str], str_to_find: str) -> int:
        for index, log_path in enumerate(log_paths):
            if str_to_find in log_path:
                return index
        return -1

    def post_file(self,
                  index_suffix: str,
                  log_type: str,
                  log_files: List[str],
                  send_to_logstash: bool,
                  file_set: str):

        event_file_path = log_files[0]
        if len(log_files) > 1:
            event_file_path = "windows_events"
            tmp = Path(event_file_path+".zip")
            if tmp.exists():
                pos = self._find_in_list(log_files, str(tmp))
                if pos > 0:
                    log_files.pop(pos)
                tmp.unlink()

            with tempfile.TemporaryDirectory() as export_path:
                for log_path in log_files:
                    shutil.copy2(log_path, export_path)

                shutil.make_archive(event_file_path, 'zip', export_path)
            event_file_path = event_file_path + ".zip"
            print(f"Bundled multiple windows event files into {event_file_path}.")

        cold_log_form = {
            "module": log_type,
            "index_suffix": index_suffix,
            "send_to_logstash": send_to_logstash,
            "fileset": file_set
        }

        payload = { "cold_log_form":
            json.dumps(cold_log_form)
        }

        files = {
            'upload_file': open(event_file_path, 'rb' ),
        }

        print(cold_log_form)
        response = self.session.post(self.base_url + "/api/coldlog/upload",
                                     files=files,
                                     data=payload)
        if response.status_code != 200:
            print("Failed to upload zip file.")
            exit(1)

        res_body = response.json()
        if "error_message" in res_body:
            print(res_body["error_message"])
        else:
            print("Successfully uploaded {}".format(event_file_path))

    def prompt_for_password(self):
        while True:
            password = getpass.getpass("Enter Windows host password: ")
            re_password = getpass.getpass("Renter Windows host password: ")
            if password == re_password:
                return password
            else:
                print("Passwords you entered did not match please try again.")

    def kickoff_winlogbeat_install(self, args: Namespace):
        password = args.password
        if not password:
            password = self.prompt_for_password()

        windows_install_form = {
            "windows_host": args.windows_host,
            "winrm_port": args.winrm_port,
            "username": args.username,
            "password": password,
            "winrm_transport": args.winrm_transport,
            "winrm_scheme": args.winrm_scheme
        }

        response = self.session.post(self.base_url + "/api/coldlog/winlogbeat/install",
                                     json=windows_install_form)

        if response.status_code != 200:
            print("Failed to initalize install Winlogbeat rq task.")
        else:
            print("Successfully kicked off Winlogbeat install.")


def check_invalid_file(files: List[str]):
    for log in files:
        ret_val = Path(log).exists() and Path(log).is_file()
        if not ret_val:
            print("{} not exist or is an invalid file.".format(log))
            exit(1)


def main():
    parser = ArgumentParser(description="This application can setup Winlogbeat and processes zip files through the applications REST interface.")
    subparsers = parser.add_subparsers(help='commands')
    setup_parser = subparsers.add_parser(SETUP_CMD, help="This command is used to setup the Windows 2019 server so that it can be used for processing cold log ingest.")
    setup_parser.set_defaults(which=SETUP_CMD)

    setup_parser.add_argument('-i', '--windows-host', dest="windows_host",
                              help="The Windows 2019 Server Host VM.", required=True)
    setup_parser.add_argument('-o', '--winrm-port', dest="winrm_port", default=5985, type=int,
                              help="The Windows Remote Management port.")
    setup_parser.add_argument('-u', '--username', dest="username",
                              help="A local admin username account.", required=True)
    setup_parser.add_argument('-p', '--password', dest="password", help="A local admin password.")
    setup_parser.add_argument('-t', '--winrm-transport', dest="winrm_transport", choices=["ntlm", "basic"],
                              help="The Windows Remote Management transport. If not specified it defaults to ntlm.", default="ntlm")
    setup_parser.add_argument('-s', '--winrm-scheme', dest="winrm_scheme",
                              help="The Windows Remote Management transport. If not specified it defaults to http.",
                              default="http", choices=['http', 'https'])

    for module in ColdLogModules.to_list(): # type: Dict
        generic_parser = subparsers.add_parser(module['value'], help=f"Use this to parse {module['name']} files.")
        generic_parser.set_defaults(which="generic", log_type=module['value'])

        filessets = [fileset['value'] for fileset in module['filesets']]
        if len(filessets) == 1:
            generic_parser.add_argument('-t', '--file-set', required=False, choices=filessets)
            generic_parser.set_defaults(file_set=filessets[0])
        elif len(filessets) > 1:
            generic_parser.add_argument('-t', '--file-set', required=True, choices=filessets)

        generic_parser.add_argument('-z','--log-zip-or-file', dest='log_file_or_zip', required=True, nargs="*",
                                help="Select an individual file or a zip of files that is on the system.")
        generic_parser.add_argument('-i','--index-suffix', dest='index_suffix', required=False, default="cold-log",
                                help="Change the index suffix. Default is filebeat-external-<cold-log>-<log-type>")
        generic_parser.add_argument('-l', '--send-to-logstash', dest='send_to_logstash', action='store_true', default=False,
                                help="Sends the data to Logstash instead of going directly to Elasticsearch.  This is useful if you have custom processors/ filters setup in logstash that you want to use.")
    args = parser.parse_args()
    api = OfflineLogProcessor()
    try:
        if args.which == SETUP_CMD:
            api.kickoff_winlogbeat_install(args)
        else:
            check_invalid_file(args.log_file_or_zip)
            if "file_set" not in args:
                api.post_file(args.index_suffix, args.log_type, args.log_file_or_zip, args.send_to_logstash, None)
            else:
                api.post_file(args.index_suffix, args.log_type, args.log_file_or_zip, args.send_to_logstash, args.file_set)
    except AttributeError:
        parser.print_help()

if __name__ == '__main__':
    main()
