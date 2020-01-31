import json
import os
import yaml
from pathlib import Path


SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))


def _change_ip(current_ip: str, port: str):
    pos1 = current_ip.rfind('.')
    pos2 = current_ip.rfind('.', 0, pos1) + 1
    current_ip = current_ip[:pos2] + port + current_ip[pos1:]
    return current_ip


def main():
    folder_name = input("What is your folder name on Vsphere? ")
    port_group = input("What is your port group (EX: 76 Portgroup)? ")
    remote_sensor_port_group = input("What is your remote port group (EX: 76 Portgroup)? ")

    port = port_group[:2]
    remote_port = remote_sensor_port_group[:2]
    test_cases_dir = SCRIPT_DIR + '/testcases'
    out_test_case_dir = SCRIPT_DIR + '/testcases/userdefined'
    Path(out_test_case_dir).mkdir(parents=True, exist_ok=True)

    for path in Path(test_cases_dir).glob("test*.yml"):
        yml_content = None
        out_file_name = (folder_name + "_" + path.name).lower()
        with open(str(path), 'r') as kit_schema:
            yml_content = yaml.load(kit_schema)

            # Update folder
            yml_content["host_configuration"]["storage"]["folder"] = folder_name

            yml_content["kit"]["kickstart_configuration"]["dhcp_range"] = _change_ip(yml_content["kit"]["kickstart_configuration"]["dhcp_range"], port)
            yml_content["kit"]["kickstart_configuration"]["gateway"] = _change_ip(yml_content["kit"]["kickstart_configuration"]["gateway"], port)
            yml_content["kit"]["kit_configuration"]["kubernetes_cidr"] = _change_ip(yml_content["kit"]["kit_configuration"]["kubernetes_cidr"], port)

            try:
                yml_content["kit"]["remote_sensor_network"] = _change_ip(yml_content["kit"]["remote_sensor_network"], remote_port)
                yml_content["kit"]["remote_sensor_portgroup"] = remote_sensor_port_group
            except KeyError:
                #Not all configurations have remote sensors defined.
                pass

            for vm in list(yml_content["kit"]["VMs"]):
                # Update port group and IP Address
                for nic in list(yml_content["kit"]["VMs"][vm]["networking"]["nics"]):
                    if yml_content["kit"]["VMs"][vm]["networking"]["nics"][nic]["dv_portgroup_name"] != "Monitoring Portgroup":
                        yml_content["kit"]["VMs"][vm]["networking"]["nics"][nic]["ip_address"] = _change_ip(yml_content["kit"]["VMs"][vm]["networking"]["nics"][nic]["ip_address"], port)

                try:
                    yml_content["kit"]["VMs"][vm]["gateway"] = _change_ip(yml_content["kit"]["VMs"][vm]["gateway"], port)
                except KeyError:
                    # Not all VMs have a gateway defined just the controller in this case.
                    pass

                # Update vm names
                pos = vm.find('-')
                yml_content["kit"]["VMs"][folder_name.lower() + vm[pos:]] = yml_content["kit"]["VMs"][vm]
                del yml_content["kit"]["VMs"][vm]

        with open(out_test_case_dir + '/' + out_file_name, 'w') as outfile:
            yaml.dump(yml_content, outfile, default_flow_style=False)

        print("Completed processing of {}.".format(out_test_case_dir + '/' + out_file_name))


if __name__ == "__main__":
    main()
