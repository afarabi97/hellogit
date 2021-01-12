# Info
# =======================
#	File: set_fwprofile.py
#	Name: RHEL-8.2 Set Firewall Profile
#
#	Version: 3.00
# 	*version is major.minor format
# 	*major is updated when new capability is added
# 	*minor is updated on fixes and improvements

# History
# =======================
#	01Jan2016 v1.00
#		J. Doe
#		*Script created
#
# 	30May2015 v2.06
#		Andrew Benson
#		Frank Vasko
#		*Fenamed from fw_ask
#
# 	08Dec2016 v2.06
#		Andrew Benson
#		Frank Vasko
#		*Function added to clear vmware nat entries
#
#	20Dec2016 v2.07
#		Christopher Voss
#		*Updated file header to standard format
#
#	21Oct2020 v3.00
#		Dylan Sigler
#		*Converted script from .sh to Python3
#       *Updated for RHEL 8.2
#       *Didn't convert set_firewall to python because
#           it would take more time than it's worth right now.

# Description
# =======================
# This script changes the Firewall profile
from menu import Menu
from common_routines import Execute_Command, Clear_The_Screen
from os import path
import set_vmPortForward as portForward

FW = "/usr/local/sbin/set_firewall"


def vmnat_clear():
    nat = Execute_Command(
        ['grep', '"incomingudp"', '/etc/vmware/vmnet8/nat/nat.conf']).stdout
    try:
        nat = int(nat.split(':')[0])
        newcount = nat - 2

        if newcount > 62:
            arg = "61, {} d".format(newcount)
            Execute_Command(
                ['sed', '-i', arg, '/etc/vmware/vmnet8/nat/nat.conf'])
    except ValueError:
        return


def enable_firewalld():
    result = Execute_Command(['systemctl', 'status', 'firewalld'])
    if result.returncode != 0:
        Execute_Command(['systemctl', 'start', 'firewalld'])
        Execute_Command(['systemctl', 'enable', 'firewalld'])


def default():
    print('Setting the default policy.')
    enable_firewalld()
    vmnat_clear()
    Execute_Command([FW])


def deny():
    print('Denying all traffic')
    enable_firewalld()
    vmnat_clear()
    Execute_Command([FW, '-D'])


def share():
    print('Setting share policy')
    enable_firewalld()
    vmnat_clear()
    Execute_Command([FW, '-it', '22, 139, 445', '-ih', '/etc/trusted.hosts'])


def scan():
    print('Setting scan policy')
    enable_firewalld()
    if not path.exists(
            '/etc/trusted.hosts') or not path.exists('/etc/target.hosts'):
        print("Make sure /etc/trusted.hosts and /etc/target.hosts exists.")
        input('Press any key to exit')
        return
    Execute_Command([FW, '-tt'])


def disable():
    print('Disabling firewall rules (allows all traffic)')
    vmnat_clear()
    Execute_Command([FW, '-A'])
    Execute_Command(['systemctl', 'stop', 'firewalld'])
    Execute_Command(['systemctl', 'disable', 'firewalld'])


def forward():
    enable_firewalld()
    portForward.main()


def save():
    print('Saving the current firewall state/configuration.')
    Execute_Command(['nft', 'list', 'ruleset', '>',
                     '/etc/sysconfig/nftables.conf'])


def status():
    print(Execute_Command(['nft', 'list', 'table', 'ip', 'filter']).stdout)
    input('Any button to contiue...')


options = [{'selector': '1',
            'description': 'Default -- Allow all traffic outbound, deny all traffic inbound. ',
            'func': default},
           {'selector': '2',
            'description': 'Deny    -- Deny all traffic through the firewall.',
            'func': deny},
           {'selector': '3',
            'description': 'Share   -- Set the default policy and allow for inbound connections to an SMB share.',
            'func': share},
           {'selector': '4',
            'description': 'Scan    -- Set the default policy but limit based on files in /etc/target.hosts and /etc/trusted.hosts.',
            'func': scan},
           {'selector': '5',
            'description': 'Disable -- Disable the firewall completely. ',
            'func': disable},
           {'selector': '6',
            'description': 'Forward -- Port forward through to Virtual Machine hosts.',
            'func': forward},
           {'selector': '7',
            'description': 'Save    -- Save the current firewall state/configuration.',
            'func': save},
           {'selector': '8',
            'description': 'Status  -- Display the firewall status.',
            'func': status},
           ]


def main():
    menu = Menu()
    for opt in options:
        menu.register_option(opt["selector"], opt["description"], opt["func"])
    while(menu.present() != 'exit'):
        Clear_The_Screen()
    return
