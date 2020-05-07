

import sys
import ruamel.yaml
from models.common import NodeSettings, VCenterSettings, Model, RepoSettings
from models.ctrl_setup import ControllerSetupSettings
from models.kit import KitSettings
from models.kickstart import KickstartSettings, MIPKickstartSettings, GIPKickstartSettings
from models.gip_settings import GIPControllerSettings, GIPKitSettings, GIPServiceSettings
from models.catalog import (CatalogSettings, MolochCaptureSettings,
                            MolochViewerSettings, ZeekSettings,
                            LogstashSettings, SuricataSettings)
from models.mip_config import MIPConfigSettings
from typing import Union


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
            cls.yaml.register_class(MIPKickstartSettings)
            cls.yaml.register_class(MIPConfigSettings)
            cls.yaml.register_class(GIPControllerSettings)
            cls.yaml.register_class(GIPServiceSettings)
            cls.yaml.register_class(GIPKickstartSettings)
            cls.yaml.register_class(GIPKitSettings)

    @classmethod
    def save_to_yaml(cls, some_model: Model, application: str = None):
        cls._initalize()
        if application:
            yaml_name = "{}_{}.yml".format(
                some_model.__class__.__name__.lower(), application.lower())
        else:
            yaml_name = "{}.yml".format(some_model.__class__.__name__.lower())
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
    def load_ctrl_settings_from_yaml(cls, application: str) -> ControllerSetupSettings:
        yaml_name = "{}_{}.yml".format(
            ControllerSetupSettings.__name__.lower(), application.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_gip_ctrl_settings_from_yaml(cls) -> GIPControllerSettings:
        yaml_name = "{}.yml".format(GIPControllerSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_kickstart_settings_from_yaml(cls) -> KickstartSettings:
        yaml_name = "{}.yml".format(KickstartSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_gip_kickstart_settings_from_yaml(cls) -> GIPKickstartSettings:
        yaml_name = "{}.yml".format(GIPKickstartSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_mip_kickstart_settings_from_yaml(cls) -> KickstartSettings:
        yaml_name = "{}.yml".format(MIPKickstartSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_gip_service_settings_from_yaml(cls) -> GIPServiceSettings:
        yaml_name = "{}.yml".format(GIPServiceSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_kit_settings_from_yaml(cls) -> KitSettings:
        yaml_name = "{}.yml".format(KitSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)
