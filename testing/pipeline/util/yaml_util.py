import glob
import os
from typing import List, Union

import ruamel.yaml
from models.common import (ESXiSettings, HwNodeSettings, Model, NodeSettings,
                           RepoSettings, VCenterSettings)
from models.ctrl_setup import (ControllerSetupSettings,
                               HwControllerSetupSettings)
from models.gip_settings import GIPServiceSettings
from models.kit import KitSettingsDef, KitSettingsV2
from models.node import (HardwareNodeSettingsV2, NodeSettingsV2,
                         load_control_plane_nodes_from_mongo)
from models.remote_node import RemoteNodeSettings
from models.rhel_repo_vm import RHELRepoSettings
from models.vm_builder import VMBuilderSettings

YAML_FILE = "{}.yml"
YAML_APPLICATION_FILE = "{}_{}.yml"

"""
    This is an opener that sets the permissions to 660
    use this when opening a file with the builtin open function.
    See: https://docs.python.org/3.6/library/functions.html#open
"""
def _perm_opener(path, flags, file_permission=0o100660):
    # os.umask(15) # uncomment if the system umask is not restrictive enough
    return os.open(path, flags, file_permission)

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
            cls.yaml.register_class(GIPServiceSettings)
            cls.yaml.register_class(RHELRepoSettings)
            cls.yaml.register_class(RemoteNodeSettings)
            cls.yaml.register_class(KitSettingsV2)
            cls.yaml.register_class(KitSettingsDef)
            cls.yaml.register_class(NodeSettingsV2)
            cls.yaml.register_class(HardwareNodeSettingsV2)
            cls.yaml.register_class(VMBuilderSettings)

    @classmethod
    def save_to_yaml(cls, some_model: Model, yaml_name: str=None):
        cls._initalize()
        if not yaml_name:
            yaml_name = YAML_FILE.format(some_model.__class__.__name__.lower())
        with open(yaml_name, 'w', opener=_perm_opener) as outfile:
            cls.yaml.dump(some_model, outfile)

    @classmethod
    def save_to_yaml_by_index(cls, node: Union[NodeSettingsV2, HardwareNodeSettingsV2]):
        cls._initalize()
        file_name = node.__class__.__name__.lower() + "_" + node.node_type + str(node.index)
        yaml_name = YAML_FILE.format(file_name)
        with open(yaml_name, 'w', opener=_perm_opener) as outfile:
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
        yaml_name = YAML_FILE.format(RHELRepoSettings.__name__.lower())
        cls.save_to_yaml(model, yaml_name)

    @classmethod
    def load_reposync_settings_from_yaml(cls) -> RHELRepoSettings:
        yaml_name = YAML_FILE.format(RHELRepoSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)
