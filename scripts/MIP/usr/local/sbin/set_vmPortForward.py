#!/bin/python3

# Info
# ====
#    file: set_vmPortForward
#     name: RHEL-8.2 VM Port Forwarding

#    version: 2.00
#         *version is major.minor format
#         *major is update when new capability is added
#         *minor is update on fixes & improvements

# History
# =======
#     07Dec2016 v1.00
#        I.A. Wild
#        T. Czerwinski
#        *created

#    20Dec2016 v1.01
#        Czerwinski
#        *Updated file header to standard format

#	 21Oct2020 v3.00
#		 Dylan Sigler
#		 *Converted script from .sh to Python3
#        *Updated for RHEL 8.2

# Description
# ===========

# Notes
# =====
#    Port forwarding to a VM must be configured using a vmware script rather than IPTABLES
# These changes may also be accomplished using the VMWARE GUI followed by
# restarting the guest

from common_routines import Get_Yes_No, Clear_The_Screen, Execute_Command
from menu import Menu
import os
import re
from time import sleep
# ---------------------------------
vmIp = 0
vmPort = 0
extPort = 0
correct = 0
# ---------------------------------


def get_ether():
    device_name = ""
    # Check to see that we have the appropriate IFCFG file
    r = re.compile('e/*')
    for file in os.listdir(path='/proc/net/dev_snmp6/'):
        if r.match(file):
            device_name = file
            break
    return device_name


# get proper tethernet device name
ETHERNET_DEVICE = get_ether()


def hostPortfor():
    # ----------------------------
    SNAT = 0
    DNAT = 0
    dport = 0
    sock = 0
    sock1 = 0
    extPort = 0
    protocol = 0
    # ----------------------------
    res = Execute_Command(['which', 'nft'])
    if res.returncode == 0:
        FWCMD = res.stdout.strip()
    else:
        print('Cannot find nft in path')
        input('Press enter to continue')
        return

    Execute_Command([FWCMD, 'flush', 'table', 'ip', 'nat'])

    print("POSTROUTING changed")
    SNAT = input(
        'What is the IP of your external interface (i.e. {})? '.format(ETHERNET_DEVICE))
    DNAT = input("What is the IP of your internal gateway (i.e. vmnet8)? ")
    extPort = input(
        'What is the port you need forwarded from the external interface? ')
    dport = input(
        'What is the port you want to forward to on your internal machine? ')
    protocol = input(
        'What protocol is the destination port you just specified? (i.e. tcp or udp)')

    sock = '{}:{}'.format(SNAT, extPort)
    sock1 = '{}:{}'.format(DNAT, dport)
    print('Your socket is {}.'.format(sock))

    cmd = '{} add rule ip nat POSTROUTING oifname "{}" ip daddr {} {} dport {} counter snat to {}'.format(
        FWCMD, ETHERNET_DEVICE, DNAT, protocol, dport, SNAT).split()
    print(Execute_Command(cmd).returncode)

    cmd = '{} add rule ip nat PREROUTING iifname "{}" {} dport {} counter dnat to {}'.format(
        FWCMD, ETHERNET_DEVICE, protocol, dport, sock1).split()
    print(Execute_Command(cmd).returncode)

    cmd = "{} add rule ip filter FORWARD ip daddr {} {} dport {} ct state new,related,established counter accept".format(
        FWCMD, DNAT, protocol, dport).strip().split()
    print(Execute_Command(cmd).returncode)

    Execute_Command([FWCMD, 'list', 'table', 'ip', 'nat'])


def config_vmware(extPort, vmIP, vmPort):
    line = '{} = {}:{}'.format(extPort, vmIP, vmPort)
    with open('/etc/vmware/vmnet8/nat/nat.conf') as f:
        if line in f.read():
            print('Port already forwarded')
            sleep(2)
            return
    # Verify inputs and write rule to vmware nat script
    Execute_Command(['sed',
                     '-i',
                     '/#8080 = 172.16.3.128:80/a {} = {}:{}'.format(extPort,
                                                                    vmIP,
                                                                    vmPort),
                     '/etc/vmware/vmnet8/nat/nat.conf'])
    Execute_Command(['vmware-networks', '--stop'])
    Execute_Command(['vmware-networks', '--start'])


def vmPortfor():
    vmIP = input("What is the IP of the VM you need to port forward to? ")
    vmPort = input("What is the port of the VM to forward to? ")
    extPort = input(
        "What is the port of the external interface you need to forward from? ")
    print('Forward {} to {}:{}'.format(extPort, vmIP, vmPort))
    if Get_Yes_No('Is this correct? [y/n] '):
        config_vmware(extPort, vmIP, vmPort)
    return


def vm_or_host():
    while(True):
        Clear_The_Screen()
        print('''
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        %%               Select VM or Host                      %%
        %%                                                      %%
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        %%                                                      %%
        %%                   [1] VM (MIP)                       %%
        %%                                                      %%
        %%                   [2] Host (DIP)                     %%
        %%                                                      %%
        %%                                                      %%
        %%                   [x] Exit                           %%
        %%                                                      %%
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

        ''')
        opt = input(
            "Are you port forwarding to the host or a VM within the host? ").lower()
        if opt == '1':
            vmPortfor()
        elif opt == '2':
            hostPortfor()
        elif opt == 'x':
            return
        else:
            print('Invalid option')
            sleep(2)


def main():
    vm_or_host()
