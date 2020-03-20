import logging
import os
import paramiko
import socket
import sys

from datetime import datetime, timedelta
from models.settings import NodeSettings
from paramiko import SSHException
from time import sleep
from typing import List, Dict, Union


class SSH_client():
    """
    Represents an SSH connection to a remote server

    Attributes:
        client (SSHClient): An SSHClient object on which you can run commands
    """

    client = None  # type: SSHClient

    def __init__(self, hostname: str, username: str, password: str, port=22) -> None:
        """
        Initializes a new SSH connection

        :param hostname (str): The hostname of the server you want to connect to
        :param username (str): The username of the server you want to connect to
        :param password (str): The password of the server you want to connect to
        :param port (int): The port number SSH is running on. Defaults to 22
        :return:
        """
        try:
            self.client = paramiko.SSHClient()
            self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            save_stderr = sys.stdout
            self.client.connect(hostname, port=port, username=username, password=password)
            sys.stderr = save_stderr

        except Exception as e:
            logging.error('Connection Failed')
            logging.error(e)
            self.client.close()

    def run_command(self, command: str, working_directory=None) -> tuple:
        """
        Runs a command on the SSH client

        :param command (str): The command you want to run on the host
        :param working_directory (str): The directory in which you want to run the command
        :returns: A tuple containing stdout and stderr from the command run
        """

        # Change into the working directory if it is specified
        if working_directory is not None:
            stdin, stdout, stderr = self.client.exec_command("cd " + working_directory + ";" + command)
        else:
            stdin, stdout, stderr = self.client.exec_command(command)

        return (stdout.read(), stderr.read())

    @staticmethod
    def test_connection(hostname: str, username: str, password: str, port=22, timeout=5) -> bool:
        """
        Tests whether a server is responding to SSH connections

        :param hostname (str): The hostname of the server you want to connect to
        :param username (str): The username of the server you want to connect to
        :param password (str): The password of the server you want to connect to
        :param port (int): The port number SSH is running on. Defaults to 22
        :param timeout (int): The length of time before the target is considered failed
        :return (bool): Returns true if the connection succeeded and false otherwise
        """

        try:
            client = paramiko.SSHClient() # type: SSHClient
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            save_stderr = sys.stdout
            client.connect(hostname=hostname, username=username, password=password, port=port, timeout=timeout)
            sys.stderr = save_stderr
            client.close()
            return True
        except (SSHException, socket.error) as e:
            logging.error(hostname + " received error: ")
            logging.error(e)
            return False

    def scp(self, source: str, dest: str) -> None:
        """
        Used to SCP files from location to another. Note: the filename is required
        on both source and destination.

        :param source (str): The source file name with path
        :param dest (str): The destination file name with path
        """

        sftp = self.client.open_sftp()
        sftp.put(source, dest)


def test_nodes_up_and_alive(nodes_to_test: Union[NodeSettings, List[NodeSettings]], minutes_timeout: int) -> None:
    """
    Checks to see if a list of VMs are up and alive by using SSH. Does not return
    until all VMs are up.

    :param kit: an instance of a Kit object
    :param nodes_to_test: A list of Node objects you would like to test for liveness
    :param minutes_timeout: The amount of time in minutes we will wait for vms to become alive before failing.
    :return:
    """
    # Make a clone of the list so we do not delete the reference list by accident.
    if isinstance(nodes_to_test, NodeSettings):
        nodes_to_test = [nodes_to_test]

    nodes_to_test = nodes_to_test.copy()
    # Wait until all VMs are up and active
    future_time = datetime.utcnow() + timedelta(minutes=minutes_timeout)
    while True:
        if future_time <= datetime.utcnow():
            logging.error("The machines took too long to come up")
            exit(3)

        for node in nodes_to_test: # type: NodeSettings
            logging.info("Machines remaining:")
            logging.info([node.hostname for node in nodes_to_test])
            logging.info("Testing " + node.hostname + " (" + node.ipaddress + ")")
            result = SSH_client.test_connection(
                node.ipaddress,
                node.username,
                node.password,
                timeout=5)
            if result:
                nodes_to_test.remove(node)

        if not nodes_to_test:
            logging.info("All machines up and active.")
            break

        sleep(5)
