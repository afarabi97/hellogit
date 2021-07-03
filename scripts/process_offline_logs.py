#!/opt/tfplenum/core/tfp-env/bin/python
import json
import getpass
import glob
import requests
import subprocess

from argparse import ArgumentParser, Namespace
from pathlib import Path
from typing import List


SETUP_CMD = 'setup'
RUN_CMD = 'run'


class OfflineLogProcessor:

    def __init__(self):
        api_gen_cmd = '/opt/tfplenum/core/tfp-env/bin/python3 /opt/sso-idp/gen_api_token.py --roles "controller-admin,controller-maintainer,operator" --exp 0.5'
        proc = subprocess.Popen(api_gen_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        stdout, _ = proc.communicate()
        controller_api_key = stdout.decode('utf-8').strip()
        self.session = requests.Session()
        self.session.headers.update({ 'Authorization': 'Bearer '+ controller_api_key })
        self.base_url = 'http://localhost:5001'

    def post_file(self,
                  index_suffix: str,
                  log_type: str,
                  log_files: List[str],
                  send_to_logstash: bool):
        for log_path in log_files:
            cold_log_form = {
                "module": log_type,
                "index_suffix": index_suffix,
                "send_to_logstash": send_to_logstash
            }

            payload = { "coldLogForm":
                json.dumps(cold_log_form)
            }

            files = {
                'upload_file': open(log_path, 'rb' ),
            }

            print(cold_log_form)
            response = self.session.post(self.base_url + "/api/upload_cold_log_file",
                                         files=files,
                                         data=payload)
            if response.status_code != 200:
                print("Failed to upload zip file.")
                exit(1)

            res_body = response.json()
            if "error_message" in res_body:
                print(res_body["error_message"])
            else:
                print("Successfully uploaded {}".format(log_path))

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

        response = self.session.post(self.base_url + "/api/install_winlogbeat",
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

    run_parser = subparsers.add_parser(RUN_CMD, help="This command submits user specified zip files to the REST calls.")
    run_parser.set_defaults(which=RUN_CMD)

    run_parser.add_argument('-t', '--log-type', dest='log_type', required=True,
                            choices=['suricata', 'system', 'apache', 'auditd', 'windows'],
                            help="Selects the proper Filebeat module to use")
    run_parser.add_argument('-z','--log-zip-or-file', dest='log_file_or_zip', required=True, nargs="*",
                            help="Select an individual file or a zip of files that is on the system.")
    run_parser.add_argument('-i','--index-suffix', dest='index_suffix', required=False, default="cold-log",
                            help="Change the index suffix. Default is filebeat-external-<cold-log>-<log-type>")
    run_parser.add_argument('-l', '--send-to-logstash', dest='send_to_logstash', action='store_true', default=False,
                            help="Sends the data to Logstash instead of going directly to Elasticsearch.  This is useful if you have custom processors/ filters setup in logstash that you want to use.")
    args = parser.parse_args()

    api = OfflineLogProcessor()
    if args.which == SETUP_CMD:
        api.kickoff_winlogbeat_install(args)
    elif args.which == RUN_CMD:
        check_invalid_file(args.log_file_or_zip)
        api.post_file(args.index_suffix, args.log_type, args.log_file_or_zip, args.send_to_logstash)


if __name__ == '__main__':
    main()
