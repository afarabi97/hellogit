import subprocess
import functools
from pymongo import MongoClient
from halo import Halo
import os
from anytree.importer import DictImporter
from anytree import Node, RenderTree, ContStyle
import requests
import sys

TERMINAL = sys.stdout.isatty()

def session(username:str, password:str) -> object:
        with requests.Session() as session:
            session.auth = (username, password)
            session.timeout = 60
        return session

def tree_to_string(data: dict) -> str:
    if not TERMINAL:
        return tree_to_string_notty(data)
    return_text = ""
    importer = DictImporter()
    top_level = importer.import_(data)
    for pre, _, node in RenderTree(top_level, style=ContStyle()):
        return_text = return_text + "  {}{}\n".format(pre, node.name)
    return return_text

def tree_to_string_notty(data: dict) -> str:
    return_text = []
    importer = DictImporter()
    top_level = importer.import_(data)
    for row in RenderTree(top_level, style=ContStyle()):
        return_text.append("{}{}".format(row.pre, row.node.name))
    return_text[0] = ""
    return "\n".join(return_text)

def remove_file(log_path:str):
    if os.path.exists(log_path):
        os.remove(log_path)

def log_append(log_path:str, data:str):
    try:
        with open(log_path, "a") as log:
            log.write(data)
            log.write("\n")
    except FileNotFoundError:
        pass

def log_write(log_path:str, data:str):
    try:
        with open(log_path, "w") as log:
            log.write(data)
    except FileNotFoundError:
        pass

def run_command(command: str):
    proc = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    sout, _ = proc.communicate()
    return sout.decode('utf-8'), proc.poll()

def parse_systemctl_show(lines):
    parsed = {}
    multival = []
    k = None
    for line in lines:
        if k is None:
            if '=' in line:
                k, v = line.split('=', 1)
                if k.startswith('Exec') and v.lstrip().startswith('{'):
                    if not v.rstrip().endswith('}'):
                        multival.append(v)
                        continue
                parsed[k] = v.strip()
                k = None
        else:
            multival.append(line)
            if line.rstrip().endswith('}'):
                parsed[k] = '\n'.join(multival).strip()
                multival = []
                k = None
    return parsed


def dict_compare(dict1, dict2, itercount=0):
    dict1_keys = set(dict1.keys())
    dict2_keys = set(dict2.keys())
    intersection = dict1_keys.difference(dict2_keys)
    faulties = []
    if itercount > 0 and len(intersection) > 0:
        return (False, list(intersection))

    flag_no_error = True
    for k, v in dict1.items():
        if isinstance(v, dict):
            if k not in dict2:
                faulties.append({k: dict1[k]})
                flag_no_error = False
            else:
                status, faulty = dict_compare(v, dict2[k], itercount+1)
                flag_no_error = flag_no_error and status
                if len(faulty) > 0:
                    faulties.append({k: faulty})
        else:
            return (True, [])
    if flag_no_error:
        return (True, [])
    else:
        return (False, faulties)

class MongoConn():

    def __init__(self):
        self.client = MongoClient('mongodb://localhost:27017/')
        self.tfplenum_db = self.client.tfplenum_database

    def mongo_settings(self):

        return self.tfplenum_db.settings

    def mongo_metrics(self):

        return self.tfplenum_db.metrics


class TimeoutException(Exception):
    pass


def timeout_handler(signum, frame):
    raise TimeoutException


# https://stackoverflow.com/a/10464730
class Monitor():
    def __init__(self, connection_pool):
        self.connection_pool = connection_pool
        self.connection = None

    def __del__(self):
        try:
            self.reset()
        except Exception:
            pass

    def reset(self):
        if self.connection:
            self.connection_pool.release(self.connection)
            self.connection = None

    def monitor(self):
        if self.connection is None:
            self.connection = self.connection_pool.get_connection(
                'monitor', None)
        self.connection.send_command("monitor")
        return self.listen()

    def parse_response(self):
        return self.connection.read_response()

    def listen(self):
        while True:
            yield self.parse_response()

def humanize(name, isResult=False):
    words = name.split('_')
    if isResult:
        words = words[1:]
        words[0] = words[0][0].upper() + words[0][1:]
    else:
        words[0] = words[0][0].upper() + words[0][1:] + 'ing'
    return ' '.join(words)


def add_spinner(_func=None, name='dots'):
    def decorator_add_spinner(func):
        @functools.wraps(func)
        def wrapper_add_spinner(*args, **kwargs):
            human_func_name = humanize(func.__name__)
            human_func_result = humanize(func.__name__, isResult=True)
            flag_skip = False

            with Halo(text=human_func_name, spinner=name, enabled=TERMINAL) as spinner:
                result = func(*args, **kwargs)
                if isinstance(result, tuple):
                    status, output = result
                elif isinstance(result, list):
                    status = result[0]
                    output = result[1]
                elif isinstance(result, bool):
                    status = result
                    output = None
                else:
                    status = False
                    flag_skip = True
                    if spinner.enabled:
                        spinner.fail('{} -  Function return unexpected result: {}'.format(human_func_name, str(result)))
                    else:
                        print('x {} -  Function return unexpected result: {}'.format(human_func_name, str(result)))

                if not flag_skip:
                    text = human_func_result
                    if output is not None and len(output) > 0:
                        text += ': {}'.format(output)

                    if isinstance(status, bool) and status:
                        if spinner.enabled:
                            spinner.succeed(text)
                        else:
                            print("v {}".format(text))
                    elif isinstance(status, bool) and not status:
                        if spinner.enabled:
                            spinner.fail(text)
                        else:
                            print("x {}".format(text))
                    else:
                        if status == 'info':
                            if spinner.enabled:
                                spinner.info(text)
                            else:
                                print("i {}".format(text))
                        else:
                            if spinner.enabled:
                                spinner.warn(text)
                            else:
                                print("!! {}".format(text))
                return status
        return wrapper_add_spinner

    if _func is None:
        return decorator_add_spinner
    else:
        return decorator_add_spinner(_func)

