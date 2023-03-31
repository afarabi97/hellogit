
#
#	17-NOV-2022 ceburkhard
#	v4.0
#	Changed several INPUT statements to allow BLANK line.
#
#       27-MAR-2023 ceburkhard
#       V4.1
#       THISISCVAH-13766
#

# THISISCVAH-13766 : Added Execute_Command_String to be imported.
from common_routines import Check_Root_User, Get_Yes_No, Execute_Command, Clear_The_Screen, Execute_Command_String
from menu import Menu
from time import sleep
from os import replace, path, remove, listdir
import re
import sys

SET_NETWORKING_VERSION="4.1"

def get_ether():
    device_name = ""
    devices = Execute_Command('nmcli -g device con'.split()).stdout.split()
    for d in devices:
        if d.startswith('e'):
            device_name = d
            break
    return device_name


def get_con():
    result = Execute_Command(
        'nmcli -f GENERAL.CONNECTION dev show {}'.format(get_ether()).split())
    if result.returncode == 0:
        return " ".join(result.stdout.split()[1:])
    else:
        print('Unable to determine connection for device {}'.format(get_ether()))
        return None


global_opts = {
    'ETHERNET_DEVICE': get_ether(),
    'CON': get_con(),
    'DHCP': True,
    'MAC_ADDR': "",
    'MAC': "",
    'UUID': "",
}


def netservice():
    print("Restarting Network Service...")
    Execute_Command(['nmcli', 'connection', 'down', global_opts['CON']])
    Execute_Command(['nmcli', 'connection', 'up', global_opts['CON']])
    Execute_Command('systemctl restart NetworkManager.service'.split())
    sleep(2)


def check_ifcfg():
    device_name = get_ether()
    if device_name != "":
        result = Execute_Command( ['cat', '/etc/sysconfig/network-scripts/ifcfg-' + device_name])
        if not device_name or result.returncode != 0:

            mac_list = Execute_Command(['ip', '-o', 'link', 'show', 'dev', device_name]).stdout.split('ether ')[1]
            mac_address = mac_list.split(' ')[0]

            try:
                uuids = list(filter(lambda x: device_name in x, Execute_Command(
                    ['nmcli', 'connection', 'show']).stdout.split('\n')))
                uuid = str(uuids[0].split()[2])
            except IndexError:
                print("Unable to get uuid")
    else:
        print("Unable to get an ethernet device name")
    return


def valid_ip(IP):
    regex = '''^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.
                (25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.
                (25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.
                (25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$'''
    if(re.search(regex, IP)):
        return True
    else:
        print("{} is not invalid. Please try again".format(IP))
        return False


def valid_mac(mac):
    regex = '''^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$'''
    if(re.search(regex, mac)):
        return True
    else:
        # print("{} is not invalid. Please try again".format(mac))
        return False


def show_connections():
    cmd = Execute_Command('nmcli connection show'.split())
    print(cmd.stdout)
    input('Press enter to continue')


def show_dev_info():
    cmd = Execute_Command('nmcli device show {}'.format( global_opts['ETHERNET_DEVICE']).split())
    print(cmd.stdout)
    input('Press enter to continue')


# THISISCVAH-13766 : This function changed to better handle changing MAC Address.
def mac_func():
    global global_opts
    reset = Get_Yes_No( 'Would you like to reset the mac to default? [y/n/x]: ')
    old_mac = ''
    dev_name = global_opts['ETHERNET_DEVICE'].replace(' ', '_')
    filename = "/etc/sysconfig/network-scripts/ifcfg-{}".format(dev_name)
    MAC_filename = "/etc/sysconfig/network-scripts/MAC-{}".format(dev_name)
    if reset == 'y':
        if Execute_Command_String(f'sed -n "/MACADDR/p" {filename}') == 0:
            if path.exists(MAC_filename):
                with open(MAC_filename, "r") as f:
                    old_mac = f.readline()
                f.close()
                print("Re-applying mac address..{}".format(old_mac))
                Execute_Command_String(f'sed -i "/MACADDR/d" {filename}')
                res = Execute_Command('ip link set dev {} down'.format(dev_name).split())
                if res.returncode != 0:
                    print("Unable to bring down Ethernet Device {}".format(dev_name))
                else:
                    Execute_Command('ip link set dev {} address {}'.format(dev_name, old_mac).split())
                    res = Execute_Command('ip link set dev {} up'.format(dev_name).split())
                    if res.returncode != 0:
                        print("Unable to bring {} back up. Check mac address.".format(dev_name))
                    else:
                        netservice()
                        print("Successfully changed to old mac address for {}".format(dev_name))
                        print("A REBOOT is required to get the OLD MAC to take effect.")
                        print(Execute_Command('ip link show {}'.format(dev_name).split()).stdout)
                        remove(MAC_filename)
            else:
                print("Unknown old mac address to revert to.")
        else:
            print("No old MAC address to revert to.")
    else:
        mac = ''
        while True:
            mac = input(
                'Enter a valid mac address. XX:XX:XX:XX:XX:XX (x to exit) ')
            if mac.lower() == 'x':
                return
            if valid_mac(mac):
                break
        print("Applying mac changes..")
        Old_MAC_Address = Execute_Command('ip -o link show {}'.format(dev_name).split())
        Execute_Command('ip link set dev {} down'.format(dev_name).split())
        Execute_Command('ip link set dev {} address {}'.format(dev_name, mac).split())
        Execute_Command_String(f'sed -i "/MACADDR/d" {filename}')
        Execute_Command_String(f'sed -i "$ a\MACADDR={mac}" {filename}')
        res = Execute_Command('ip link set dev {} up'.format(dev_name).split())
        if res.returncode != 0:
            print("Unable to bring {} back up. Check mac address.".format(dev_name))
        else:
            netservice()
            print("Successfully changed mac address for {}".format(dev_name))
            print(res.stdout)
            if path.exists(MAC_filename) == False:
                old_mac = Old_MAC_Address.stdout.split(" ")[19]
                with open(MAC_filename, "w") as f:
                    f.write(old_mac)
                f.close()
    sleep(5)
    return


def clear_ip():
    Execute_Command(['nmcli', 'con', 'mod', global_opts['CON'],
                     'ipv4.method', 'manual',
                     'ipv4.addresses', '\"\"',
                     'ipv4.gateway', '\"\"',
                     'ipv4.dns', '\"\"'])


def clean_config_file():
    # Remove old IP, cidr, gateway, and dns from con ifcfg files.
    dev_name = global_opts['CON'].replace(' ', '_')
    filename = '/etc/sysconfig/network-scripts/ifcfg-{}'.format(dev_name)
    with open(filename, "r") as f:
        lines = f.readlines()
    with open(filename, "w") as f:
        matches = ["IPADDR", "PREFIX", "GATEWAY", "DNS"]
        for line in lines:
            l = line.strip("\n")
            if not any(opt in l for opt in matches):
                f.write(line)
    # Remove old IP, cidr, gateway, and dns from dev ifcfg files.
    filename = '/etc/sysconfig/network-scripts/ifcfg-{}'.format(dev_name)
    with open(filename, "r") as f:
        lines = f.readlines()
    with open(filename, "w") as f:
        matches = ["IPADDR", "PREFIX", "GATEWAY", "DNS"]
        for line in lines:
            l = line.strip("\n")
            if not any(opt in l for opt in matches):
                f.write(line)


def ip_func():
    global global_opts
    dhcp = Get_Yes_No('Use DHCP to connect? [y/n/x] ')
    if dhcp == 'x':
        return
    if dhcp == 'y':
        old_ip = Execute_Command(['nmcli', '-f', 'IP4.ADDRESS', 'dev', 'show',
                                  global_opts["ETHERNET_DEVICE"]]).stdout.split()[1]
        Execute_Command(['nmcli', 'con', 'mod', global_opts['CON'], 'ipv4.method', 'auto'])
        clean_config_file()
        netservice()
        Execute_Command(['ip', 'addr', 'del', old_ip, 'dev', global_opts["ETHERNET_DEVICE"]])
    else:
        ip = ''
        while True:
            ip = input(
                'Enter the ipaddress you would like. [x.x.x.x] (x to exit) ')
            if ip.lower() == 'x':
                return
            if valid_ip(ip):
                cidr = -1
                while cidr < 0 or cidr > 32:
                    cidr = int(
                        input('Enter the size of the network [CIDR] (0-32): '))
                break
        gateway = ''
        while True:
            gateway = input('Enter a gateway address. [x.x.x.x] (x to exit) ')
            if gateway.lower() == 'x':
                return
            if valid_ip(gateway):
                break
        dns_server = ''
        while True:
            dns_server = input("Enter a DNS server [x.x.x.x] (x to exit) ")
            if dns_server.lower() == 'x':
                return
            if valid_ip(dns_server):
                break
        apply = Get_Yes_No('Apply changes? [y/n/x] \n \
                Connection: {} \n \
                Method: manual \n \
                Address: {}/{} \n \
                Gateway: {} \n \
                DNS: {} \n'.format(global_opts['CON'], ip, cidr, gateway, dns_server))
        if apply == 'y':
            Command = 'nmcli con mod {} ipv4.method manual ipv4.addresses {}/{} ipv4.gateway {} ipv4.dns {}'.format(
                      global_opts['CON'], ip, str(cidr), gateway, dns_server)
            Execute_Command(Command.split())
            netservice()


def main():
    if Check_Root_User():
        options = [
            {
                'selector': '1',
                'description': 'Mac Configuration ',
                'func': mac_func
            },
            {
                'selector': '2',
                'description': 'IP Configuration ',
                'func': ip_func
            },
            {
                'selector': '3',
                'description': 'Show connections ',
                'func': show_connections
            },
            {
                'selector': '4',
                'description': 'Show device information (ip, mac, etc.) ',
                'func': show_dev_info
            },
        ]
        menu = Menu()
        for opt in options:
            menu.register_option(
                opt["selector"], opt["description"], opt["func"])

        check_ifcfg()
        # create_ifcfg_file()

        Clear_The_Screen()
        while True:
            if menu.present() == 'exit':
                break
            Clear_The_Screen()
        return
    else:
        print('Script must be run as root user')
        return


if __name__ == '__main__':
    main()
