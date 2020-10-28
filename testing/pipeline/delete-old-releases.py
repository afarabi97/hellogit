import base64
import os
import sys
from argparse import ArgumentParser, Namespace
from binascii import Error
from models.common import VCenterSettings
from util.ansible_util import execute_playbook


PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/"


def main():
    parser = ArgumentParser(description="This application is used to run remove old VMs or templates from vsphere.")
    parser.add_argument("--vms", dest="vms", nargs="+", required=True)
    parser.add_argument("--folder", dest="folder", required=True, help="The folder in vsphere we will search for the named VM or template.")

    VCenterSettings.add_args(parser)
    args = parser.parse_args()
    vcenter = VCenterSettings()

    try:
        vcenter.from_namespace(args)
    except (Error, UnicodeDecodeError) as e:
        args.vcenter_password = base64.b64encode(bytes(args.vcenter_password, "UTF-8")).decode("UTF-8")
        vcenter.from_namespace(args)

    ctx = {
        "python_executable": sys.executable,
        "vcenter": vcenter.to_dict(),
        "vms": args.vms,
        "folder": args.folder
    }
    execute_playbook([PIPELINE_DIR + 'playbooks/delete_vms_or_templates.yml'], ctx)


if __name__ == '__main__':
    main()
