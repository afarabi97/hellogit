#!/bin/python3
# Info
# ====
#	file: set_mip.py
# 	name: RHEL-8.2 Setup Script

#	version: 2.00
# 		*version is major.minor format
# 		*major is update when new capability is added
# 		*minor is update on fixes & improvementsements

# History
# =======
# 	29May2016 v1.00
#		Daniel Bentz( daniel.bentz@us.af.mil )
#		Kyle Wilson( kyle.wilson.19@us.af.mil )
#		Dread Pirate( jason.roberts.14@us.af.mil )
#		*Created to automate MIP setup on RHEL-7 for network connectivity and firewall rules

#	02Dec2016 v1.01
#		Dread Pirate( jason.roberts.14@us.af.mil )
#		*Updated to break out networking to "set_networking" script" and add shares

#	20Dec2016 v1.02
#		Czerwinski
#		*Updated file header to standard format

#	21Oct2020 v2.00
#		Dylan Sigler
#		*Converted script from .sh to Python3
#               *Updated for RHEL 8.2

#       05Jan2023  V4.0
#               Carl Burkhard
#               Updated per THISISCVAH-13319 ticket, specifically Network Configuration &
#               Classification Banner Menu.

# Description
# ===========

# Notes
# =====
import os
import sys
import subprocess
import socket
import time
import re
from uuid import getnode as get_mac
from common_routines import Check_Root_User, Clear_The_Screen, Get_Yes_No, Execute_Command
import set_classification as classification
import set_fwprofile as fwprofile
import set_networking as set_network
from set_smbconfig import smb_manager

from common_routines import COMMON_ROUTINES_VERSION
from menu import MENU_VERSION 
from set_classification import SET_CLASSIFICATION_VERSION 
from set_fwprofile import SET_FWPROFILE_VERSION 
from set_networking import SET_NETWORKING_VERSION
from set_smbconfig import SET_SMBCONFIG_VERSION
from set_vmPortForward import SET_VMPORTFORWARD_VERSION

######################
# Script Variables
SET_MIP_VERSION = "4.0 "
######################


def mainmenu():
    while(True):
        Clear_The_Screen()
        print("""
    ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    +                  Red Hat Setup Script {}                           +
    ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    +                                                                      +
    +        [ 1 ] Firewall Options                                        +
    +                                                                      +
    +        [ 2 ] Network Configuration (IP and Mac)                      +
    +                                                                      +
    +        [ 3 ] HostName Configuration                                  +
    +                                                                      +
    +        [ 4 ] Network Shares                                          +
    +                                                                      +
    +        [ 5 ] Classification Configuration                            +
    +                                                                      +
    +        [ Q ] Quick Setup Configuration (Firewall,Network,Hostname)   +
    +                                                                      +
    +        [ V ] Show version of all Setup Python Script files           +
    +                                                                      +
    +        [ X ] Exit Script                                             +
    +                                                                      +
    ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
""".format(SET_MIP_VERSION))
        command = input("Please make a Selection: ")
        if command == '1':
            Clear_The_Screen()
            fwprofile.main()
        elif command == '2':
            Clear_The_Screen()
            set_network.main()
        elif command == '3':
            hostname_func()
        elif command == '4':
            sm = smb_manager()
            sm.main()
        elif command == '5':
            Clear_The_Screen()
            classification.main()
        elif command.lower() == 'q':
            quickSetup()
        elif command.lower() == 'v':
            show_version()
        elif command.lower() == 'x':
            return
        else:
            print("Invalid input")
            time.sleep(1)

def show_version():
    print("set_mip.py            version is {}".format(SET_MIP_VERSION))
    print("common_routines.py    version is {}".format(COMMON_ROUTINES_VERSION))
    print("menu.py               version is {}".format(MENU_VERSION ))
    print("set_classification.py version is {}".format(SET_CLASSIFICATION_VERSION ))
    print("set_fwprofile.py      version is {}".format(SET_FWPROFILE_VERSION ))
    print("set_networking.py     version is {}".format(SET_NETWORKING_VERSION))
    print("set_smbconfig.py      version is {}".format(SET_SMBCONFIG_VERSION))
    print("set_vmPortForward.py  version is {}".format(SET_VMPORTFORWARD_VERSION))
    time.sleep(5)

def quickSetup():
    Clear_The_Screen()
    print("""

        **************************
        *       Firewall         *
        **************************

    """)
    time.sleep(1)
    fwprofile.main()
    print("""

        **************************
        *  Network Configuration *
        **************************

    """)
    time.sleep(1)
    set_network.main()
    print("""

        **************************
        * Hostname Configuration *
        **************************

    """)
    time.sleep(1)
    hostname_func()


def hostname_func():
    Clear_The_Screen()
    hostname = socket.gethostname()
    choice = Get_Yes_No(
        'Would you like to change the hostname? [y/n/x] Currently: {} '.format(hostname))
    if choice == 'x':
        return
    new_hostname = ''
    if choice == 'y':
        while not new_hostname:
            new_hostname = input(
                'What would you like the new hostname to be? ')
            if new_hostname:
                append = Get_Yes_No(
                    'Would you like to append the new name to the original hostname? [y/n/x] ')
                if append == 'x':
                    return
                if append == 'y':
                    new_hostname = hostname + '-' + new_hostname

                cmd = Execute_Command(['hostname', new_hostname])
                if cmd.returncode == 0:
                    print('The new hostname is {} '.format(new_hostname))
                    # Commented code is in case there needs to be multiple hostname entries. Not sure if this is a thing.
                    # Read in the file
                    # with open('/etc/hostname', 'r') as file :
                    #    filedata = file.read()

                    # Replace the target string
                    #filedata = filedata.replace(hostname, new_hostname)
                    # print(filedata)
                    # Write the file out again
                    with open('/etc/hostname', 'w') as file:
                        file.write(new_hostname + '\n')

                restart_opt = Get_Yes_No(
                    'System must be restarted to take affect. Restart after script completion? [y/n] ',
                    False)
                if restart_opt == 'y':
                    print('Restarting in 5 seconds...')
                    time.sleep(5)
                    restart()
                else:
                    print('No restart scheduled')
            else:
                print('No hostname input.')
    else:
        print('No hostname change.')
    time.sleep(2)


def restart():
    Execute_Command(['shutdown', '-r', 'now'])


def main():
    if Check_Root_User():
        subprocess.call("alias ll='ls -al --color=auto'", shell=True)
        mainmenu()
    else:
        print("This script must be run as root.")
        time.sleep(3)
        return


if __name__ == '__main__':
    main()
