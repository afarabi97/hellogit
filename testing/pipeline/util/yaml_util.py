

import sys
import ruamel.yaml
from models.common import NodeSettings, VCenterSettings, Model, RepoSettings
from models.ctrl_setup import ControllerSetupSettings
from models.kit import KitSettings
from models.kickstart import KickstartSettings, MIPKickstartSettings, GIPKickstartSettings
from models.gip_settings import GIPControllerSettings, GIPKitSettings, GIPServiceSettings
from models.catalog import (CatalogSettings, MolochCaptureSettings,
                            MolochViewerSettings, ZeekSettings,
                            LogstashSettings, SuricataSettings,
                            WikijsSettings, MispSettings, HiveSettings,
                            MongodbSettings, RocketchatSettings, CortexSettings)
from models.mip_config import MIPConfigSettings
from models.rhel_repo_vm import RHELRepoSettings
from typing import Union

YAML_FILE = "{}.yml"
YAML_APPLICATION_FILE = "{}_{}.yml"

class YamlManager:
    yaml = None

    @classmethod
    def _initalize(cls):
        if cls.yaml is None:
            cls.yaml = ruamel.yaml.YAML()
            cls.yaml.register_class(ControllerSetupSettings)
            cls.yaml.register_class(NodeSettings)
            cls.yaml.register_class(VCenterSettings)
            cls.yaml.register_class(RepoSettings)
            cls.yaml.register_class(KickstartSettings)
            cls.yaml.register_class(KitSettings)
            cls.yaml.register_class(SuricataSettings)
            cls.yaml.register_class(CatalogSettings)
            cls.yaml.register_class(MolochCaptureSettings)
            cls.yaml.register_class(MolochViewerSettings)
            cls.yaml.register_class(ZeekSettings)
            cls.yaml.register_class(LogstashSettings)
            cls.yaml.register_class(WikijsSettings)
            cls.yaml.register_class(MispSettings)
            cls.yaml.register_class(HiveSettings)
            cls.yaml.register_class(CortexSettings)
            cls.yaml.register_class(MongodbSettings)
            cls.yaml.register_class(RocketchatSettings)
            cls.yaml.register_class(MIPKickstartSettings)
            cls.yaml.register_class(MIPConfigSettings)
            cls.yaml.register_class(GIPControllerSettings)
            cls.yaml.register_class(GIPServiceSettings)
            cls.yaml.register_class(GIPKickstartSettings)
            cls.yaml.register_class(GIPKitSettings)
            cls.yaml.register_class(RHELRepoSettings)


    @classmethod
    def save_to_yaml(cls, some_model: Model, application: str = None):
        cls._initalize()
        if application:
            yaml_name = "{}_{}.yml".format(
                some_model.__class__.__name__.lower(), application.lower())
        else:
            yaml_name = YAML_FILE.format(some_model.__class__.__name__.lower())
        with open(yaml_name, 'w') as outfile:
            cls.yaml.dump(some_model, outfile)

    @classmethod
    def _load_from_yaml(cls, name: str) -> Model:
        cls._initalize()
        some_model = None
        with open(name, 'r') as fhandle:
            some_model = cls.yaml.load(fhandle)
        return some_model

    @classmethod
    def load_node_settings(cls, application: str):
        return cls._load_from_yaml(YAML_APPLICATION_FILE.format(NodeSettings.__name__.lower(), application))

    @classmethod
    def load_vcenter_settings(cls, application: str):
        return cls._load_from_yaml(YAML_APPLICATION_FILE.format(VCenterSettings.__name__.lower(), application))

    @classmethod
    def load_ctrl_settings_from_yaml(cls, application: str) -> ControllerSetupSettings:
        yaml_name = "{}_{}.yml".format(
            ControllerSetupSettings.__name__.lower(), application.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_gip_ctrl_settings_from_yaml(cls) -> GIPControllerSettings:
        yaml_name = YAML_FILE.format(GIPControllerSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_kickstart_settings_from_yaml(cls) -> KickstartSettings:
        yaml_name = YAML_FILE.format(KickstartSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_gip_kickstart_settings_from_yaml(cls) -> GIPKickstartSettings:
        yaml_name = YAML_FILE.format(GIPKickstartSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_mip_kickstart_settings_from_yaml(cls) -> MIPKickstartSettings:
        yaml_name = YAML_FILE.format(MIPKickstartSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_gip_service_settings_from_yaml(cls) -> GIPServiceSettings:
        yaml_name = YAML_FILE.format(GIPServiceSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_kit_settings_from_yaml(cls) -> KitSettings:
        yaml_name = YAML_FILE.format(KitSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_reposync_settings_from_yaml(cls, application: str) -> RHELRepoSettings:
        yaml_name = "{}_{}.yml".format(RHELRepoSettings.__name__.lower(), application.lower())
        return cls._load_from_yaml(yaml_name)
