#!/usr/bin/python

import argparse
import getopt
import os
import os.path
import socket
import sys

import yaml
from jinja2 import DebugUndefined, Environment, FileSystemLoader, Template
import time


def render(tpl_path, context):
    path, filename = os.path.split(tpl_path)
    return Environment(
        loader=FileSystemLoader(path or './')
    ).get_template(filename).render(context)


def process(icdm_dir, icdm_vars):
    reload_cmd_list = []
    for root, directories, filenames in os.walk(icdm_dir):
        for filename in filenames:
            if filename.endswith(".conf"):
                configvars = {}
                with open(os.path.join(root, filename)) as configfile:
                    for line in configfile:
                        name, var = line.partition(":")[::2]
                        configvars[name.strip()] = var.rstrip("\n\r").strip()
                if os.path.isfile(configvars['src']):
                    with open(icdm_vars) as simple:
                        simple = yaml.load(simple)

                    if simple is None:
                        raise Exception('icdm vars is empty')
                    
                    # Try to get hostname
                    if 'HOSTNAME' in os.environ:
                        hostname = os.environ['HOSTNAME']
                    elif len(socket.gethostname()) > 1:
                        hostname = socket.gethostname()
                    else:
                        hostname = "localhost"

                    simple['host'] = hostname

                    with open(configvars['dst'], 'wb') as fh:
                        fh.write(render(configvars['src'], simple))
                    
                    # Set correct perms
                    os.chown(configvars['dst'], 0, 0)
                    os.chmod(configvars['dst'], 0644)
                    
                    # add reload_cmd to list
                    if configvars['reload_cmd']:
                        reload_cmd_list.append(configvars['reload_cmd'])
                    
    # Restart Service is defined
    if len(reload_cmd_list) > 0:
        # Remove duplicates from list
        reload_cmd_list = list(set(reload_cmd_list))
        for cmd in reload_cmd_list:
            os.system(cmd)
            time.sleep(1)

def usage():
    print 'Usage: icdm.py -d <icdm dir> -v <icdm vars>'

if __name__ == "__main__":
    icdm_dir = '/etc/icdm'
    icdm_vars = '/etc/icdm/vars.yml'
    parser = argparse.ArgumentParser()
    parser.add_argument("-d", "--dir", help="icdm dir")
    parser.add_argument("-v", "--vars", help="icdm vars file")
    args = parser.parse_args()

    if args.dir:
        icdm_dir = args.dir
    if args.vars:
        icdm_vars = args.vars

    if not os.path.isdir(icdm_dir):
        raise Exception('icdm dir not found')
    if not os.path.isfile(icdm_vars):
        raise Exception('icdm vars not found')

    process(icdm_dir, icdm_vars)