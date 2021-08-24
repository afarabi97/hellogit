import glob
import sys
import ruamel.yaml
from typing import Union
from models.common import NodeSettings, HwNodeSettings, VCenterSettings, Model, RepoSettings, ESXiSettings
from models.remote_node import RemoteNodeSettings
from models.ctrl_setup import ControllerSetupSettings, HwControllerSetupSettings
from models.kit import KitSettingsV2, KitSettingsDef
from models.gip_settings import GIPServiceSettings
from models.node import NodeSettingsV2, HardwareNodeSettingsV2, load_control_plane_nodes_from_mongo
from models.catalog import (CatalogSettings, ArkimeCaptureSettings,
                            ArkimeViewerSettings, ZeekSettings,
                            LogstashSettings, SuricataSettings,
                            WikijsSettings, MispSettings, HiveSettings,
                            RocketchatSettings, CortexSettings, MattermostSettings,
                            RedmineSettings, NifiSettings, JcatNifiSettings, NetflowFilebeatSettings)
from models.rhel_repo_vm import RHELRepoSettings
from models.minio import MinIOSettings
from typing import Union, List


YAML_FILE = "{}.yml"
YAML_APPLICATION_FILE = "{}_{}.yml"


class YamlManager:
    yaml = None

    @classmethod
    def _initalize(cls):
        if cls.yaml is None:
            cls.yaml = ruamel.yaml.YAML()
            cls.yaml.register_class(ControllerSetupSettings)
            cls.yaml.register_class(HwControllerSetupSettings)
            cls.yaml.register_class(NodeSettings)
            cls.yaml.register_class(HwNodeSettings)
            cls.yaml.register_class(VCenterSettings)
            cls.yaml.register_class(ESXiSettings)
            cls.yaml.register_class(RepoSettings)
            cls.yaml.register_class(SuricataSettings)
            cls.yaml.register_class(CatalogSettings)
            cls.yaml.register_class(ArkimeCaptureSettings)
            cls.yaml.register_class(ArkimeViewerSettings)
            cls.yaml.register_class(ZeekSettings)
            cls.yaml.register_class(LogstashSettings)
            cls.yaml.register_class(WikijsSettings)
            cls.yaml.register_class(MispSettings)
            cls.yaml.register_class(HiveSettings)
            cls.yaml.register_class(CortexSettings)
            cls.yaml.register_class(RocketchatSettings)
            cls.yaml.register_class(MattermostSettings)
            cls.yaml.register_class(NifiSettings)
            cls.yaml.register_class(JcatNifiSettings)
            cls.yaml.register_class(RedmineSettings)
            cls.yaml.register_class(NetflowFilebeatSettings)
            cls.yaml.register_class(GIPServiceSettings)
            cls.yaml.register_class(RHELRepoSettings)
            cls.yaml.register_class(RemoteNodeSettings)
            cls.yaml.register_class(KitSettingsV2)
            cls.yaml.register_class(KitSettingsDef)
            cls.yaml.register_class(NodeSettingsV2)
            cls.yaml.register_class(HardwareNodeSettingsV2)
            cls.yaml.register_class(MinIOSettings)

    @classmethod
    def save_to_yaml(cls, some_model: Model, yaml_name: str=None):
        cls._initalize()
        if not yaml_name:
            yaml_name = YAML_FILE.format(some_model.__class__.__name__.lower())
        with open(yaml_name, 'w') as outfile:
            cls.yaml.dump(some_model, outfile)

    @classmethod
    def save_to_yaml_by_index(cls, node: Union[NodeSettingsV2, HardwareNodeSettingsV2]):
        cls._initalize()
        file_name = node.__class__.__name__.lower() + "_" + str(node.index)
        yaml_name = YAML_FILE.format(file_name)
        with open(yaml_name, 'w') as outfile:
            cls.yaml.dump(node, outfile)

    @classmethod
    def save_nodes_to_yaml_files(cls, nodes: List[NodeSettingsV2]):
        for node in nodes:
            cls.save_to_yaml_by_index(node)

    @classmethod
    def _load_from_yaml(cls, name: str) -> Model:
        cls._initalize()
        some_model = None
        with open(name, 'r') as fhandle:
            some_model = cls.yaml.load(fhandle)
        return some_model

    @classmethod
    def load_nodes_from_yaml_files(cls,
                                   ctrl_settings: Union[ControllerSetupSettings, HwControllerSetupSettings],
                                   kit_settings: KitSettingsV2) -> List[NodeSettingsV2]:
        ret_val = []
        for name in glob.glob("*nodesettingsv2*"):
            ret_val.append(cls._load_from_yaml(name))

        ret_val += load_control_plane_nodes_from_mongo(ctrl_settings, kit_settings)
        return ret_val

    @classmethod
    def load_minio_settings_from_yaml(cls) -> MinIOSettings:
        return cls._load_from_yaml(f"{MinIOSettings.__name__.lower()}.yml")

    @classmethod
    def load_ctrl_settings_from_yaml(cls) -> Union[ControllerSetupSettings,HwControllerSetupSettings]:
        yaml_name = "{}.yml".format(ControllerSetupSettings.__name__.lower())
        try:
            return cls._load_from_yaml(yaml_name)
        except FileNotFoundError:
            yaml_name = "{}.yml".format(HwControllerSetupSettings.__name__.lower())
            return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_gip_service_settings_from_yaml(cls) -> GIPServiceSettings:
        yaml_name = YAML_FILE.format(GIPServiceSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_kit_settingsv2_from_yaml(cls) -> KitSettingsV2:
        yaml_name = YAML_FILE.format(KitSettingsV2.__name__.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def save_reposync_settings_from_yaml(cls, model: RHELRepoSettings) -> RHELRepoSettings:
        yaml_name = "{}_{}.yml".format(RHELRepoSettings.__name__.lower(), "server")
        cls.save_to_yaml(model, yaml_name)

    @classmethod
    def load_reposync_settings_from_yaml(cls) -> RHELRepoSettings:
        yaml_name = "{}_{}.yml".format(RHELRepoSettings.__name__.lower(), "server")
        return cls._load_from_yaml(yaml_name)
