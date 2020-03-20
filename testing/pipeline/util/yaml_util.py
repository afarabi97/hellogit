

import sys
import ruamel.yaml
from models.settings import (NodeSettings, VCenterSettings, Model,
                             RepoSettings, ControllerSetupSettings,
                             KickstartSettings, KitSettings, SuricataSettings,
                             CatalogSettings, MolochCaptureSettings, MolochViewerSettings,
                             ZeekSettings, LogstashSettings)
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

    @classmethod
    def save_to_yaml(cls, some_model: Model, application:str=None):
        cls._initalize()
        if application:
            yaml_name = "{}_{}.yml".format(some_model.__class__.__name__.lower(), application)
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
    def load_ctrl_settings_from_yaml(cls) -> ControllerSetupSettings:
        yaml_name = "{}.yml".format(ControllerSetupSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)

    @classmethod
    def load_kickstart_settings_from_yaml(cls) -> KickstartSettings:
        yaml_name = "{}.yml".format(KickstartSettings.__name__.lower())
        return cls._load_from_yaml(yaml_name)
