import base64
import os
import sys
from argparse import ArgumentParser
from binascii import Error
from models.common import VCenterSettings
from util.ansible_util import execute_playbook
from util.vmware_util import get_vms_in_folder


PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/"


class SubCmds:
    GET_LIST = "get-list"
    DELETE_VMS = "delete-vms"


def add_vm_list(parser: ArgumentParser):
    parser.add_argument("--folder", dest="folder", required=True, help="The folder in vsphere we will search for the named VM or template.")


def main():
    parser = ArgumentParser(description="This application is used to run remove old VMs or templates from vsphere.")
    subparsers = parser.add_subparsers(help='commands')

    list_parser = subparsers.add_parser(SubCmds.GET_LIST, help="This command is used to grab a list of VMs out of specified folder.")
    list_parser.set_defaults(which=SubCmds.GET_LIST)

    delete_parser = subparsers.add_parser(SubCmds.DELETE_VMS, help="This command is ddelete VMs out of specified folder.")
    delete_parser.set_defaults(which=SubCmds.DELETE_VMS)

    add_vm_list(list_parser)
    add_vm_list(delete_parser)
    VCenterSettings.add_args(list_parser)
    VCenterSettings.add_args(delete_parser)
    delete_parser.add_argument("--vms", dest="vms", nargs="+", required=True)

    args = parser.parse_args()
    vcenter = VCenterSettings()

    try:
        vcenter.from_namespace(args)
    except (Error, UnicodeDecodeError) as e:
        args.vcenter_password = base64.b64encode(bytes(args.vcenter_password, "UTF-8")).decode("UTF-8")
        vcenter.from_namespace(args)

    if args.which == SubCmds.GET_LIST:
        vms = get_vms_in_folder(args.folder, vcenter)
        vms.sort()
        for vm in vms:
            print(vm + " \\")

    if args.which == SubCmds.DELETE_VMS:
        ctx = {
            "python_executable": sys.executable,
            "vcenter": vcenter.to_dict(),
            "vms": args.vms,
            "folder": args.folder
        }
        execute_playbook([PIPELINE_DIR + 'playbooks/delete_vms_or_templates.yml'], ctx)


if __name__ == '__main__':
    main()
