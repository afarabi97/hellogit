from argparse import Namespace, ArgumentParser
from models import Model
from models.common import VCenterSettings, NodeSettings, RepoSettings
from models.constants import SubCmd


class ControllerSetupSettings(Model):
    valid_run_types = ("build_from_scratch", "clone_from_nightly")
    valid_system_names = ('DIP', 'MIP', 'GIP')

    def __init__(self):
        super().__init__()
        self.run_type = ''
        self.node = None # type: NodeSettings
        self.vcenter = None # type: VCenterSettings
        self.repo = None # type: RepoSettings
        self.system_name = None # type: str

    def _validate_settings(self):
        if self.run_type not in self.valid_run_types:
            raise ValueError("The command flag --run-type {} is invalid it must be one of {}".format(self.run_type, str(valid_run_types)))
        if self.system_name == "GIP":
            raise NotImplementedError

    def from_namespace(self, namespace: Namespace):
        self.rhel_source_repo = namespace.rhel_source_repo
        self.run_type = namespace.run_type

        self.vcenter = VCenterSettings()
        self.vcenter.from_namespace(namespace)

        self.node = NodeSettings()
        self.node.from_namespace(namespace)

        self.repo = RepoSettings()
        self.repo.from_namespace(namespace)

        self.system_name = namespace.system_name

        self._validate_settings()

    @staticmethod
    def add_args(parser: ArgumentParser):
        parser.add_argument('--run-type', dest='run_type', required=True,
                            help="You should either pass clone_from_nightly or build_from_scratch.")
        parser.add_argument('--rhel-source-repo', dest='rhel_source_repo', default="labrepo",
                            help="Use labrepo for SIL network otherwise pass in public.")
        parser.add_argument('--system-name', dest='system_name', default="DIP",
                            choices=['DIP','MIP','GIP'],
                            help="Selects which component your controller should be built for.")
        VCenterSettings.add_args(parser)
        RepoSettings.add_args(parser)
        NodeSettings.add_args(parser, True)
