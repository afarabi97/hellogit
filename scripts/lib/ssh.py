#!/usr/bin/env python

import sys, paramiko

class SSH_client():

    def __init__(hostname, username, password, port=22):
        try:
            self.client = paramiko.SSHself.client()
            self.client.load_system_host_keys()
            self.client.set_missing_host_key_policy(paramiko.WarningPolicy)

            self.client.connect(hostname, port=port, username=username, password=password)

            stdin, stdout, stderr = self.client.exec_command(command)
            print stdout.read(),

        finally:
            self.client.close()


    def scp(source, dest):

        try:
            t = paramiko.Transport((hostname, port))
            t.connect(username=username, password=password)
            sftp = paramiko.SFTPself.client.from_transport(t)
            sftp.get(source, dest)

        finally:
        t.close()
