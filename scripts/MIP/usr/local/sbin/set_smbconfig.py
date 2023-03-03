#!/bin/python3
# Python3

# Info
# ====
#	file: smb_config
#	name: Samba Share Configurate

#	version: 1.00
#		*version is major.minor format
#		*major is update when new capability is added
#		*minor is update on fixes & improvements

# History
# =======
#	03Jan2017 v1.00
#		SSgt Czerwinski, Thomas J.
#		*Created
#
#	28Oct2020 v2.00
#		Dylan Sigler
#		Updated for RHEL 8.2
#		Updated to Python3
#
#	17-Nov-2022 v4.0
#		ceburkhard
#		Changes necessary inputs to not allow for BLANK input.
#

# Description
# ===========
#	Assist user in creating and connecting to SMB shares

# Notes
# =====

from time import sleep
from os import system
from configparser import RawConfigParser as ConfigParser
from common_routines import Execute_Command, Get_Yes_No, Clear_The_Screen
from menu import Menu

SMB_CONF_FILE = '/etc/samba/smb.conf'
SHARE_ROOT = '/cvah/data/assess/'
MOUNT_ROOT = '/mnt/'

SET_SMBCONFIG_VERSION="4.0"

class smb_manager():
    def __init__(self):
        self.menu = Menu()
        self.options = [
            {
                'selector': 'v',
                'description': 'View smb.conf Shares',
                'func': self.view_smb
            }, {
                'selector': 'l',
                'description': 'List Current Shares',
                'func': self.list_shares
            }, {
                'selector': 'n',
                'description': 'New Local Share',
                'func': self.create_new_share
            }, {
                'selector': 'd',
                'description': 'Delete Local Share',
                'func': self.delete_share
            }, {
                'selector': 'c',
                'description': 'List & Connect to a Remote Share',
                'func': self.connect_remote_share
            }, {
                'selector': 'r',
                'description': 'Manual SMB & NMB Restart',
                'func': self.restart_smb
            },
        ]
        self.conf = ConfigParser()
        self.conf.read(SMB_CONF_FILE)

    # Get input, reject blank lines.
    def _input(self, prompt : str):
        Answer = ""
        while len(Answer) == 0 :
            Answer = input (prompt)
        return Answer

    # Restarts services to effect share changes
    def restart_smb(self):
        print('Restarting SMB Service..')
        try:
            stop_cmd = Execute_Command('service smb stop'.split())
        except BaseException:
            print('Unable to stop smb service')
        try:
            start_cmd = Execute_Command('service smb start'.split())
        except BaseException:
            print('Unable to start smb service')
        if stop_cmd.returncode != 0:
            print('Unable to stop smb service')
            return False
        if start_cmd.returncode != 0:
            print('Unable to start smb service')
            return False

        print('Restarting NMB Service..')
        try:
            stop_cmd = Execute_Command('service nmb stop'.split())
        except BaseException:
            print('Unable to stop smb service')
        try:
            start_cmd = Execute_Command('service smb start'.split())
        except BaseException:
            print('Unable to start nmb service')
        if stop_cmd.returncode != 0:
            print('Unable to stop nmb service')
            return False
        if start_cmd.returncode != 0:
            print('Unable to start nmb service')
            return False
        sleep(2)
        Clear_The_Screen()

    # Prints the share information, pulled from smb.conf
    def view_smb(self, include_vals=True):
        print('Shares')
        print('------')

        for share in self.conf.sections():
            print(share)

            if include_vals is True:
                for kv in self.conf.items(share):
                    print('\t{} = {}'.format(kv[0], kv[1]))
                print('')

        print('------')
        input("Press enter to continue.")

    # Lists local shares, actively shared on this machine
    def list_shares(self):
        system('smbclient -L localhost')
        input("Press enter to continue.")

    # Creates a new share entry in smb.conf and creates a directory for the
    # share path
    def create_new_share(self):
        print('Enter x at any point to exit.')
        name = self._input("Please enter a 'share name' to create: ")
        if name.lower() == 'x':
            return

        comment = input("Please enter a 'comment' for this share: ")
        if comment.lower() == 'x':
            return

        Prompt = """
Please enter 'hosts allowed' access to this share\n
* hosts must be 'space separated'
* hosts are in 'x.x.x.x' format
* entire subnets end with a '.'( i.e. x.x.x. is /24 )
"""
        host = self._input(Prompt)
        if host.lower() == 'x':
            return

        share_path = SHARE_ROOT + name

        print('Creating share directory in ' + share_path)
        Execute_Command('mkdir -p {}'.format(share_path).split())
        Execute_Command('chmod 777 {}'.format(share_path).split())

        self.conf.add_section(name)
        self.conf.set(name, 'path', share_path)
        self.conf.set(name, 'comment', comment)
        #self.conf.set( name, 'workgroup', 'WORKGROUP' )
        self.conf.set(name, 'read only', 'no')
        self.conf.set(name, 'writeable', 'yes')
        #self.conf.set( name, 'write list', 'assessor' )
        self.conf.set(name, 'directory mask', '0755')
        self.conf.set(name, 'create mask', '0644')
        self.conf.set(name, 'valid users', 'assessor')

        self.conf.set('global', 'hosts allow', host + ' 127.')

        self.conf.write(open(SMB_CONF_FILE, 'w'))

        self.restart_smb()
        sleep(3)

    # Deletes a share from smb.conf, but does not remove the share path. This
    # way, the user can preserved data
    def delete_share(self):
        self.view_smb(include_vals=False)

        print('Enter x at any point to exit.')
        print("The share directory will not be deleted")
        Share = self._input( "Please enter the 'share name' to remove ")
        if Share.lower() == 'x' :
            return
        else :
            self.conf.remove_section(self._input( "Please enter the 'share name' to remove "))
            self.conf.write(open(SMB_CONF_FILE, 'w'))
            self.restart_smb()

    # Initiates a remote smb connect, lists remote shares, and connects to
    # remote shares
    def connect_remote_share(self):
        print('Enter x at any point to exit.')
        ip = self._input("Please enter the 'IP address' of the remote machine ")
        if ip.lower() == 'x':
            return
        user = self._input("Please enter a 'user' to authenticate as ")
        if user.lower() == 'x':
            return

        print('Aquiring list of shares from server..')

        result_code = system('smbclient -L localhost {}'.format(ip))
        if result_code != 0:
            print('Unable to connect to remote share.')
            input("Press enter to continue.")
            return False

        name = self._input( "What is the 'share name' you would like to connect to? ")
        if name.lower() == 'x':
            return

        print('Creating share directory in ' + MOUNT_ROOT + name)
        Execute_Command('mkdir -p {}'.format(MOUNT_ROOT + name).split())

        choice = Get_Yes_No("Is the remote machine Win7? y/n: ")
        if choice == 'y':
            print('Connecting to remote share..')
            result = Execute_Command(
                'mount -t cifs //{}/{} /mnt{} -o username={}'.format(ip, name, name, user).split())
            if result.returncode != 0:
                print('Unable to connect to remote share')
                input("Press enter to continue.")
                return False
        else:
            print('Connecting to remote share..')
            result = Execute_Command(
                'mount //{}/{} /mnt/{} -o username={}'.format(ip, name, name, user).split())
            if result.returncode != 0:
                print('Unable to connect to remote share')
                input("Press enter to continue.")
                return False

    def main(self):
        Clear_The_Screen()
        if system('which smbd') != 0:
            print('SAMBA Server is not installed')
            sleep(3)
            return
        # Create Menu by registering options, desctiptions, and hooks/handlers
        for opt in self.options:
            self.menu.register_option(
                opt["selector"], opt["description"], opt["func"])

        self.restart_smb()

        # Format smb.conf so it's compatable with the ConfigParser module used
        # by this script
        with open(SMB_CONF_FILE, 'r+') as file:
            trimmed_file = []

            for line in file:
                trimmed_file.append(line.lstrip())

            file.seek(0)
            for line in trimmed_file:
                file.write(line)

            file.truncate()
        Clear_The_Screen()
        while self.menu.present() != 'exit':
            Clear_The_Screen()


# Present the menu to the user & enter main loop
if __name__ == '__main__':
    Clear_The_Screen()
    sm = smb_manager()
    sm.main()
    Clear_The_Screen()
