# Info
# =======================
#	File: set_fwprofile.py
#	Name: RHEL-8.2 Set Firewall Profile
#
#	Version: 3.00
# 	*version is major.minor format
# 	*major is updated when new capability is added
# 	*minor is updated on fixes and improvements
#
#	Version 3.8
#       Corrected main menu to fit nicely in a 80X24 screen.
#       Changed the "STATUS" page to show IP Rules & Filtering.
#       cleaned up this source file.

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
#
#	15Oct2021 v3.01
#		Kassio Coutinho
#		*Added sleep command for end user to view print statement
#
#	17-NOV-2022 V4.0
#		Carl Burkhard
#		Cleaned up source and menu.
#		Changed STATUS output
#
#       27-MAR-2023 V4.1
#               Carl Burkhard
#               Changed per THISISCVAH-13766.
#               Remove all SYSTEMDTL command for FIREWALLD as it is now
#               disabled on the MIP.
#
# Description
# =======================
# This script changes the Firewall profile
from menu import Menu
from time import sleep
from common_routines import Execute_Command, Clear_The_Screen
from os import path
import set_vmPortForward as portForward

FW = "/usr/local/sbin/set_firewall"
SET_FWPROFILE_VERSION = "4.1"


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


# THISISCVAH-13766 - Commented out these commands as FIREWALLD is not used.
#def enable_firewalld():
    #result = Execute_Command(['systemctl', 'status', 'firewalld'])
    #if result.returncode != 0:
        #Execute_Command(['systemctl', 'start', 'firewalld'])
        #Execute_Command(['systemctl', 'enable', 'firewalld'])


def default():
    print('Setting the default policy.')
    sleep(1)
    # THISISCVAH-13766 - Commented out these commands as FIREWALLD is not used.
    #enable_firewalld()
    vmnat_clear()
    Execute_Command([FW])


def deny():
    print('Denying all traffic')
    sleep(1)
    # THISISCVAH-13766 - Commented out these commands as FIREWALLD is not used.
    #enable_firewalld()
    vmnat_clear()
    Execute_Command([FW, '-D'])


def share():
    print('Setting share policy')
    sleep(1)
    # THISISCVAH-13766 - Commented out these commands as FIREWALLD is not used.
    #enable_firewalld()
    vmnat_clear()
    Execute_Command([FW, '-it', '22, 139, 445', '-ih', '/etc/trusted.hosts'])


def scan():
    print('Setting scan policy')
    sleep(1)
    # THISISCVAH-13766 - Commented out these commands as FIREWALLD is not used.
    #enable_firewalld()
    if not path.exists(
            '/etc/trusted.hosts') or not path.exists('/etc/target.hosts'):
        print("Make sure /etc/trusted.hosts and /etc/target.hosts exists.")
        input('Press any key to exit')
        return
    Execute_Command([FW, '-tt'])


def disable():
    print('Disabling firewall rules (allows all traffic)')
    sleep(1)
    vmnat_clear()
    Execute_Command([FW, '-A'])
    # THISISCVAH-13766 - Commented out these commands as FIREWALLD is not used.
    #Execute_Command(['systemctl', 'stop', 'firewalld'])
    #Execute_Command(['systemctl', 'disable', 'firewalld'])


def forward():
    # THISISCVAH-13766 - Commented out these commands as FIREWALLD is not used.
    #enable_firewalld()
    portForward.main()


def save():
    print('Saving the current firewall state/configuration.')
    sleep(1)
    completed_process = Execute_Command(['nft', 'list', 'ruleset'])
    with open ("/etc/sysconfig/nftables.conf", "w") as save_file:
        save_file.write(completed_process.stdout)


def status():
    print(Execute_Command(['/usr/local/sbin/set_fwstatus.sh']).stdout)
    input('Press Any Key to continue...')


options = [{'selector': '1',
            'description': 'Default -- Allow all traffic outbound, deny all traffic inbound. ',
            'func': default},
           {'selector': '2',
            'description': 'Deny    -- Deny all traffic through the firewall.',
            'func': deny},
           {'selector': '3',
            'description': 'Share   -- Set the default policy and allow for inbound connections\n        to an SMB share and SSH.',
            'func': share},
           {'selector': '4',
            'description': 'Scan    -- Set the default policy but limit based on files in\n        /etc/target.hosts and /etc/trusted.hosts.',
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
