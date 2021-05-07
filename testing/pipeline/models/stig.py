import os

from argparse import Namespace, ArgumentParser
from models import Model
from models.constants import StigSubCmd
from util.yaml_util import YamlManager
from util.ansible_util import power_on_vms, take_snapshot
from enum import Enum, auto


PIPELINE_DIR = os.path.dirname(os.path.realpath(__file__)) + "/../"
STIG_PATH_TO_SITE_YAML = PIPELINE_DIR + '/../../rhel8-stigs/' + 'site.yml'
STIG_TIMEOUT = 300
STIG_MAKE_PATH_TO_PLAYBOOK_DIR = '/opt/tfplenum/rhel8-stigs/'


class STIGSettings(Model):

    def __init__(self):
        super().__init__()
        self.sub_system_name = None
        self.model_settings = None
        self.username = None
        self.password = None
        self.ipaddress = None
        self.executor_type = ExecutorType.MAKE   # default: ExecutorType.MAKE
        self.play_execution_vars = None
        self.make_execution_vars = None

    def from_namespace(self, namespace: Namespace):
        self.sub_system_name = namespace.sub_system_name
        self._get_model_settings_from_yaml()

    def initalize_for_server_repo(self):
        self.sub_system_name = StigSubCmd.RHEL_REPO_SERVER
        self._get_model_settings_from_yaml()

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--sub-system-name', dest='sub_system_name', type=str,
                            choices=[
                                StigSubCmd.GIPSVC, StigSubCmd.RHEL_REPO_SERVER]
                            )

    def _get_model_settings_from_yaml(self):
        if self.sub_system_name == StigSubCmd.GIPSVC:  # GIPSVC
            self.model_settings = YamlManager.load_gip_service_settings_from_yaml()
            self._setup_username_password_ip(self.model_settings)
            self._setup_play_execution_vars(play_targets='gip-service-vms', play_tags='gip-service-vm-stigs',
                                            play_timeout=STIG_TIMEOUT, play_path_to_site_yaml=STIG_PATH_TO_SITE_YAML)
        elif self.sub_system_name == StigSubCmd.RHEL_REPO_SERVER:
            self.model_settings = YamlManager.load_reposync_settings_from_yaml()
            power_on_vms(self.model_settings.vcenter, self.model_settings.node)
            self._setup_username_password_ip(self.model_settings)
            self._setup_play_execution_vars(play_targets='all', play_tags='repo-server-stigs',
                                            play_path_to_site_yaml=STIG_PATH_TO_SITE_YAML)

    def take_snapshot_for_certain_systems(self):
        if self.sub_system_name == StigSubCmd.RHEL_REPO_SERVER:
            take_snapshot(self.model_settings.vcenter, self.model_settings.node)

    def _setup_username_password_ip(self, model: Model):
        self.username = model.node.username
        self.password = model.node.password
        self.ipaddress = model.node.ipaddress

    def _setup_make_execution_vars(self, make_tags: str, path_to_make_dir: str = STIG_MAKE_PATH_TO_PLAYBOOK_DIR, shell: bool = True):
        """
        This setups the @var: self.execute_make_vars which will be used by the stig job
        to pass the proper parameters to the proprer execution method.
        Use this if you want the StigJob to use the makefile to run STIGs
        """
        self.executor_type = ExecutorType.MAKE       # default is MAKE but, this will eliminate mistakes possibly
        self.make_execution_vars = {
            'path_to_make_dir': path_to_make_dir,
            'make_command': "make {}".format(make_tags),
            'shell': shell
        }

    def _setup_play_execution_vars(self, play_targets: str, play_tags: str, play_timeout: int = STIG_TIMEOUT, play_path_to_site_yaml: str = STIG_PATH_TO_SITE_YAML):
        """
        This setups the @var: self.execute_make_vars which will be used by the stig job
        to pass the proper parameters to the proprer execution method
        """
        self.executor_type = ExecutorType.PLAY      # default is MAKE but, if you call this function you probably don't want to run a make command
        self.play_execution_vars = {
            'play_ipaddress': self.ipaddress,
            'play_extra_vars': {"ansible_ssh_pass": self.password, "ansible_user": self.username, "node_type": "Server"},
            'play_targets': play_targets,
            'play_tags': play_tags,
            'play_timeout': play_timeout,
            'play_path_to_site_yaml': play_path_to_site_yaml
        }


class ExecutorType(Enum):
    MAKE = auto()
    PLAY = auto()
