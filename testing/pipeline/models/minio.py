from models import Model
from models.common import VCenterSettings
from argparse import Namespace, ArgumentParser
from util.network import IPAddressManager


class MinIOSettings(Model):
    def __init__(self, namespace: Namespace):
        super().__init__()
        self.vcenter = VCenterSettings()
        self.vcenter.from_namespace(namespace)
        self.template = namespace.template
        self.folder = namespace.folder
        self.password = self.b64decode_string(namespace.password)
        self.export_password = namespace.export_password
        self.datastore = namespace.datastore
        self.vmname = namespace.vmname
        self.hostname = namespace.hostname
        self.portgroup = namespace.portgroup
        self.gateway = namespace.gateway
        self.dns_servers = namespace.dns_servers
        self.domain = namespace.domain
        self.disk_size = namespace.disk_size
        self.storage_disk_size = namespace.storage_disk_size
        self.cpu = namespace.cpu
        self.memory = namespace.memory
        self.use_tls = namespace.use_tls
        self.commit_hash = namespace.commit_hash
        self.pipeline = namespace.pipeline
        self.ip = IPAddressManager(namespace.network_id, namespace.network_block_index).get_next_node_address()

    @staticmethod
    def add_args(parser: ArgumentParser):
        VCenterSettings.add_args(parser)
        parser.add_argument('--vm-template', dest='template', required=True, help="The name of the VM or Template to clone from.")
        parser.add_argument("--vm-folder", dest="folder", required=True, help="The folder where all your VM(s) will be created within vsphere.")
        parser.add_argument("--vm-password", dest="password", help="The root password of the VM after it is cloned.", required=True)
        parser.add_argument("--export-password", dest="export_password", help="The root password set during export.", required=True)
        parser.add_argument('--vm-datastore', dest='datastore', required=True, help="The name of vsphere's datastore where it will be storing its VMs.")
        parser.add_argument('--vm-name', dest='vmname', required=True, help="The name given to the VM.")
        parser.add_argument('--hostname', dest='hostname', required=True, help="The hostname for the VM.")
        parser.add_argument("--portgroup", dest="portgroup", help="The managment network or portgroup name on the vsphere or esxi server.", required=True)
        parser.add_argument("--gateway", dest="gateway", help="The gateway ipaddress for the VM.", required=True)
        parser.add_argument('--dns-servers', dest='dns_servers', nargs="+", required=True, help="The dns servers that will be used for nodes created.")
        parser.add_argument('--domain', dest='domain', required=False, help="Domain", default="lan")
        parser.add_argument('--disk-size', dest='disk_size', required=True)
        parser.add_argument('--storage-disk-size', dest='storage_disk_size', required=True)
        parser.add_argument("--cpu", dest="cpu", required=False, help="The default number of CPU cores to assign to the VM(s).", default="8")
        parser.add_argument("--memory", dest="memory", required=False, help="The default amount of memory to assign to the VM(s)", default="16384")
        parser.add_argument("--network-id", dest="network_id", help="The network ID the application will be selecting IPs from.", required=True)
        parser.add_argument("--network-block-index", dest="network_block_index", help="The network block index to use. If left as default it will default to 1 which uses 64 as the last octet. [64, 128, 192]", default=0, choices=range(0, 3), type=int)
        parser.add_argument('--tls', dest='use_tls', action='store_true')
        parser.set_defaults(use_tls=False)
        parser.add_argument("--commit-hash", dest="commit_hash", required=True)
        parser.add_argument("--pipeline", dest="pipeline", required=True)
