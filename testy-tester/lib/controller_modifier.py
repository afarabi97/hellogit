"""
Module is responsible for making any needed changes to teh controller for
integration testing purposes.
"""
import os
from lib.connection_mngs import FabricConnectionWrapper
from lib.model.node import Node
from lib.util import zero_pad, retry

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

    def make_controller_changes(self):
        try:
            self._change_mongo_confg()
            self._open_port(27017)
        finally:
            if self._conn:
                self._conn.close()
