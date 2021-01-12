from common_routines import Check_Root_User, Get_Yes_No, Execute_Command, Clear_The_Screen
from menu import Menu
from time import sleep
from os import replace, path, remove, listdir
import re
import sys


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
    result = Execute_Command(
        ['cat', '/etc/sysconfig/network-scripts/ifcfg-' + device_name])
    if not device_name or result.returncode != 0:

        mac_list = Execute_Command(
            ['ip', '-o', 'link', 'show', 'dev', device_name]).stdout.split('ether ')[1]
        mac_address = mac_list.split(' ')[0]

        try:
            uuids = list(filter(lambda x: device_name in x, Execute_Command(
                ['nmcli', 'connection', 'show']).stdout.split('\n')))
            uuid = str(uuids[0].split()[2])
        except IndexError:
            print("Unable to get uuid")
            return


def valid_ip(IP):
    regex = '''^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(
            25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(
            25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(
            25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$'''
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
    cmd = Execute_Command('nmcli device show {}'.format(
        global_opts['ETHERNET_DEVICE']).split())
    print(cmd.stdout)
    input('Press enter to continue')


def mac_func():
    global global_opts
    reset = Get_Yes_No(
        'Would you like to reset the mac to default? [y/n/x]: ')
    if reset == 'x':
        return
    if reset == 'y':
        # Remove old MACs from con ifcfg files.
        filename = '/etc/sysconfig/network-scripts/ifcfg-{}'.format(
            global_opts['CON'].replace(' ', '_'))
        with open(filename, "r") as f:
            lines = f.readlines()
        with open(filename, "w") as f:
            for line in lines:
                if "MACADDR" not in line.strip("\n"):
                    f.write(line)
        # Remove old MACs from dev ifcfg files.
        filename = '/etc/sysconfig/network-scripts/ifcfg-{}'.format(
            global_opts['ETHERNET_DEVICE'].replace(' ', '_'))
        with open(filename, "r") as f:
            lines = f.readlines()
        with open(filename, "w") as f:
            for line in lines:
                if "MACADDR" not in line.strip("\n"):
                    f.write(line)
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
        Execute_Command('ip link set dev {} down'.format(
            global_opts['ETHERNET_DEVICE']).split())
        Execute_Command('ip link set dev {} address {}'.format(
            global_opts['ETHERNET_DEVICE'], mac).split())
        res = Execute_Command('ip link set dev {} up'.format(
            global_opts['ETHERNET_DEVICE']).split())
        if res.returncode != 0:
            print("Unable to bring {} back up. Check mac address.",
                  global_opts["ETHERNET_DEVICE"])
        else:
            netservice()
            print("Successfully changed mac address for {}",
                  global_opts["ETHERNET_DEVICE"])
            print(Execute_Command('ip link show {}'.format(
                global_opts["ETHERNET_DEVICE"]).split()).stdout)
            sleep(2)


def clear_ip():
    Execute_Command(['nmcli', 'con', 'mod', global_opts['CON'],
                     'ipv4.method', 'manual',
                     'ipv4.addresses', '\"\"',
                     'ipv4.gateway', '\"\"',
                     'ipv4.dns', '\"\"'])


def clean_config_file():
    # Remove old IP, cidr, gateway, and dns from con ifcfg files.
    filename = '/etc/sysconfig/network-scripts/ifcfg-{}'.format(
        global_opts['CON'].replace(' ', '_'))
    with open(filename, "r") as f:
        lines = f.readlines()
    with open(filename, "w") as f:
        matches = ["IPADDR", "PREFIX", "GATEWAY", "DNS"]
        for line in lines:
            l = line.strip("\n")
            if not any(opt in l for opt in matches):
                f.write(line)
    # Remove old IP, cidr, gateway, and dns from dev ifcfg files.
    filename = '/etc/sysconfig/network-scripts/ifcfg-{}'.format(
        global_opts['ETHERNET_DEVICE'].replace(' ', '_'))
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
        old_ip = Execute_Command(['nmcli',
                                  '-f',
                                  'IP4.ADDRESS',
                                  'dev',
                                  'show',
                                  global_opts["ETHERNET_DEVICE"]]).stdout.split()[1]
        Execute_Command(['nmcli', 'con', 'mod', global_opts['CON'],
                         'ipv4.method', 'auto'])
        clean_config_file()
        netservice()
        Execute_Command(['ip', 'addr', 'del', old_ip, 'dev',
                         global_opts["ETHERNET_DEVICE"]])
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
            Execute_Command(['nmcli', 'con', 'mod', global_opts['CON'],
                             'ipv4.method', 'manual',
                             'ipv4.addresses', '{}/{}'.format(ip, str(cidr)),
                             'ipv4.gateway', '{}'.format(gateway),
                             'ipv4.dns', '{}'.format(dns_server)])
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
