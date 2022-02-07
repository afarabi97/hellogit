"""
Contains the main Model base class that all models will inherit from.

Additionally, this base module contains all teh custom exceptions
"""

import base64
import json
from argparse import Namespace
from ipaddress import IPv4Address
from typing import Dict, List


class DBModelNotFound(Exception):
    """
    This should be raised in instances where a mongo lookup did not find the the object.
    """

    pass


class PostValidationError(Exception):
    """
    This should be raised in instances where additional validation is done that marshmallow
    did not catch.
    """

    def __init__(self):
        self.errors_msgs = []

    def append_error(self, msg: str):
        self.errors_msgs.append(msg)

    def has_errors(self):
        return len(self.errors_msgs) > 0


class Model:
    def _handle_lists(self, key: str) -> List:
        a_list = []
        for item in self.__dict__[key]:
            if isinstance(item, Model):
                a_list.append(item.to_dict())
            else:
                return self.__dict__[key]
        return a_list

    def _handle_lists2(self, key: str, some_dict: List) -> List:
        a_list = []
        for item in some_dict[key]:
            if isinstance(item, Model):
                a_list.append(item.to_dict())
            else:
                return some_dict[key]
        return a_list

    def to_dict(self) -> Dict:
        ret_val = {}
        for key in self.__dict__:
            if isinstance(self.__dict__[key], Model):
                ret_val[key] = self.__dict__[key].to_dict()
            elif isinstance(self.__dict__[key], list):
                ret_val[key] = self._handle_lists(key)
            elif isinstance(self.__dict__[key], IPv4Address):
                ret_val[key] = str(self.__dict__[key])
            else:
                ret_val[key] = self.__dict__[key]
        return ret_val

    def from_dict(self, some_dict: Dict):
        for key in some_dict:
            if isinstance(some_dict[key], Model):
                self.__dict__[key] = some_dict[key].to_dict()
            elif isinstance(some_dict[key], list):
                self.__dict__[key] = self._handle_lists2(key, some_dict[key])
            else:
                self.__dict__[key] = some_dict[key]

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
        return ret_val.decode("utf-8")

    def b64encode_string(self, some_str: str) -> str:
        ret_val = base64.b64encode(some_str.encode("utf-8"))
        return ret_val.decode("utf-8")
