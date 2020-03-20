import json
import sys
import base64

from argparse import ArgumentParser, Namespace
from typing import Dict, List


class Model:

    def __init__(self):
        self.python_executable = sys.executable

    def _handle_lists(self, key: str) -> List:
        a_list = []
        for item in self.__dict__[key]:
            if isinstance(item, Model):
                a_list.append(item.to_dict())
            else:
                return self.__dict__[key]
        return a_list

    def to_dict(self) -> Dict:
        ret_val = {}
        for key in self.__dict__:
            if isinstance(self.__dict__[key], Model):
                ret_val[key] = self.__dict__[key].to_dict()
            elif isinstance(self.__dict__[key], list):
                ret_val[key] = self._handle_lists(key)
            else:
                ret_val[key] = self.__dict__[key]
        return ret_val

    def __str__(self) -> str:
        return json.dumps(self.to_dict(), indent=4, sort_keys=True)

    def to_compact_str(self) -> str:
        return json.dumps(self.to_dict())

    def from_namespace(self, namespace: Namespace):
        for key in self.__dict__:
            value = getattr(namespace, key)
            if value:
                self.__dict__[key] = value

    def b64decode_string(self, some_str: str):
        ret_val = base64.b64decode(some_str.encode())
        return ret_val.decode('utf-8')


def add_args_from_instance(parser: ArgumentParser, instance: Model, is_required: bool=False):
    for key in instance.__dict__:
        argument = '--' + key.replace('_', '-')
        if isinstance(instance.__dict__[key], str):
            if len(instance.__dict__[key]) > 0:
                parser.add_argument(argument, dest=key, default=instance.__dict__[key])
            else:
                parser.add_argument(argument, dest=key, required=is_required)
        elif isinstance(instance.__dict__[key], list):
            if len(instance.__dict__[key]) > 0:
                parser.add_argument(argument, dest=key, nargs="+", default=instance.__dict__[key])
            else:
                parser.add_argument(argument, dest=key, nargs="+", required=is_required)
        elif isinstance(instance.__dict__[key], bool):
            parser.add_argument(argument, dest=key, action='store_true', required=is_required)
        elif isinstance(instance.__dict__[key], int):
            if instance.__dict__[key] != 0:
                parser.add_argument(argument, dest=key, type=int, default=instance.__dict__[key])
            else:
                parser.add_argument(argument, dest=key, type=int, required=is_required)
        elif isinstance(instance.__dict__[key], Model):
            add_args_from_instance(parser, instance.__dict__[key], is_required)


def populate_model_from_namespace(instance: Model, namespace: Namespace):
    for key in instance.__dict__:
        try:
            value = getattr(namespace, key)
            if value:
                instance.__dict__[key] = value
        except AttributeError as e:
            if isinstance(instance.__dict__[key], Model):
                populate_model_from_namespace(instance.__dict__[key], namespace)
            else:
                raise e
