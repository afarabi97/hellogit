from numpy import sort
# from fabric import FabricConnection
from util.connection_mngs import FabricConnectionWrapper, MongoConnectionManager
from pymongo.cursor import Cursor
from typing import List


def _is_link_up(iface_name: str, shell) -> bool:
    cmd = 'ethtool {} | grep "Link detected: yes"'.format(iface_name)
    result = shell.run(cmd, warn=True, shell=True)
    return (result.return_code == 0)

def main():
    username = "root"
    password = "We.are.tfplenum4$"
    ipaddress = "10.20.213.53"
    # ipaddress = "10.20.141.50"
    #ultraman ctrl ip 10.20.213.15

    with FabricConnectionWrapper(username, password, ipaddress) as shell:
        result = shell.run("cat /proc/net/dev", hide=True)
        iface_names = []
        for index, line in enumerate(result.stdout.split('\n')):
            if index == 0 or index == 1:
                continue
            tokens = line.split()
            if len(tokens) > 0:
                iface = tokens[0][:-1]
                if iface.startswith("lo") or "tun" in iface or iface.startswith("cali"):
                    continue
                if not _is_link_up(iface, shell):
                    continue

                iface_names.append(iface)

        iface_names.sort()
        print(iface_names)

def get_interfaces_from_mongo(controller_ip: str, hostname: str) -> List[str]:
    with MongoConnectionManager(controller_ip) as mongo:
        results = mongo.mongo_catalog_saved_values.find({"values.node_hostname": hostname}) # type: Cursor
        for result in results:
            if result['values']['interfaces']:
                return result['values']['interfaces']
    return []


if __name__ == '__main__':
    # main()
    print(get_interfaces_from_mongo("10.20.213.15", "sensor4.ultraman"))
