import json
import sys
import base64

from argparse import Namespace
from typing import Dict, List


class Model:

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

    def b64encode_string(self, some_str: str) -> str:
        ret_val = base64.b64encode(some_str.encode("utf-8"))
        return ret_val.decode('utf-8')
