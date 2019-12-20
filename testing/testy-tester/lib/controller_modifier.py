"""
Module is responsible for making any needed changes to teh controller for
integration testing purposes.
"""
import os
from lib.connection_mngs import FabricConnectionWrapper
from lib.model.node import Node
from lib.util import retry

TEMPLATES_DIR = os.path.dirname(os.path.realpath(__file__)) + '/../templates/'


class ControllerModifier:

    def __init__(self, ctrl_node: Node):
        self._ctrl_node = ctrl_node
        self._initalize_connection()

    @retry()
    def _initalize_connection(self):
        """
        Creates a fabric connection to the controller
        :return:
        """
        self._conn = FabricConnectionWrapper(self._ctrl_node.username,
                                             self._ctrl_node.password,
                                             self._ctrl_node.management_interface.ip_address)

    @retry()
    def _change_mongo_confg(self):
        """
        Changes the mongo config file so that we can access it remotely.
        :return:
        """
        self._conn.connection.put(TEMPLATES_DIR + "mongod.conf", '/etc/mongod.conf')
        self._conn.connection.run('systemctl restart mongod')

    @retry()
    def _open_port(self, port: int, port_type='tcp'):
        """
        Opens a specified port.

        :param port:
        :param port_type:
        :return:
        """
        cmd = "firewall-cmd --permanent --add-port={port}/{port_type}".format(port=port, port_type=port_type)
        self._conn.connection.run(cmd)
        self._conn.connection.run('firewall-cmd --reload')

    @retry()
    def _set_hostname(self):
        """
        Set Controller Hostname Properly
        :return:
        """
        cmd = "hostnamectl set-hostname {hostname}".format(hostname="controller.lan")
        self._conn.connection.run(cmd)

    @retry()
    def _update_code(self, git_username: str, git_password: str, branch_name: str):
        self._conn.connection.run("git config --global --unset credential.helper", warn=True)
        self._conn.connection.run("""
cat <<EOF > ~/credential-helper.sh
#!/bin/bash
echo username="{}"
echo password="{}"
EOF
""".format(git_username, git_password))
        self._conn.connection.run('git config --global credential.helper "/bin/bash ~/credential-helper.sh"')
        self._conn.connection.run('cd /opt/tfplenum && git fetch', warn=True)
        self._conn.connection.run('cd /opt/tfplenum && git checkout {}'.format(branch_name))
        self._conn.connection.run('cd /opt/tfplenum && git pull --rebase')
        self._conn.connection.run('git config --global --unset credential.helper', warn=True)
        self._conn.connection.run('/opt/tfplenum/web/setup/redeploy.sh')

    def change_hostname(self):
        try:
            self._set_hostname()
        finally:
            if self._conn:
                self._conn.close()

    def update_cloned_nightly_build(self, git_username: str, git_password: str, branch_name: str):
        try:
            self._set_hostname()
            self._update_code(git_username, git_password, branch_name)
        finally:
            if self._conn:
                self._conn.close()

    def make_controller_changes(self):
        try:
            self._change_mongo_confg()
            self._open_port(27017)
        finally:
            if self._conn:
                self._conn.close()
