"""
This script communicates with an Endgame server to add a new Windows sensor. The script then downloads the zip file 
containing the Endgame sensor software.
If the file download is successful, the program prints the API key required to install the Endgame agent, and the name
of the installer downloaded.
"""
__author__ = 'Warren Couvillion'

import argparse
import sys
from uuid import uuid4
import requests
from pprint import PrettyPrinter 

parser = argparse.ArgumentParser(description = "Add an Endgame sensor and download its agent software. " 
                                               "Prints the 'api_key' required to install the sensor and "
                                               "the name of the installer downloaded.")
parser.add_argument('-s', '--server', help='<Required> Endgame server', required=True)
parser.add_argument('-u', '--username', required=True, help='<Required> Endgame server user name')
parser.add_argument('-p', '--password', required=True, help='<Required> Endgame server password')
parser.add_argument('-t', '--transceiver', 
                    help='<Required>IP addresses of Endgame Server. This will probably be the PFSense firewall IP:port', 
                    required=True)
parser.add_argument('-n', '--name', required=True, help='Name of sensor configuration')
parser.add_argument('-i', '--id', help='Unique ID of sensor (for downloading existing sensor)')
parser.add_argument('-d', '--dissolvable', action='store_true', 
                    help='Construct dissolvable sensor (default is persistent sensor)')
parser.add_argument('-v', '--vdi', action='store_false', help='VDI Compatibility')
parser.add_argument('-b', '--basename', default='SensorInstaller', 
                      help='Basename of the installer. The name of the sensor will be appended. '
                       'Defaults to "SensorInstaller"')
try:
  args=parser.parse_args()
except:
  exit(1)

requests.packages.urllib3.disable_warnings( requests.packages.urllib3.exceptions.InsecureRequestWarning )
session = requests.Session()
session.verify = False

#Get authorization token from server, i.e., log in.
url = 'https://{}/api/v1/auth/login'.format(args.server)
content_header = { 'Content-Type': 'application/json' }
resp = session.post(url, json = { 'username': args.username, 'password': args.password }, 
                     headers = content_header)
auth_token = resp.json()['metadata']['token']

"""
Merge dictionaries into a single dictionary
:param d1:    First dictionary to merge
:param args:  Other dictionaries to merge.
:return: A dictionary containing all the key-value pairs of all the dictionaries passed in as parameters.
"""
def merge_dicts(d1, *args):
    merged = d1.copy();
    for d in args:
        merged.update(d)
    return merged

"""
Check the response of a requests library call. If it's okay, perform an action
and return the return value of the action.
If the response was not okay, print the response JSON to stderr and exit the 
script, returning the response value.
:param resp: Response to check.
:param action: Action to take if response was good.
:return: Return value of the action.
"""
def checkResponse(resp, action):
  if(resp.ok):
    return action(resp)
  else:
    PrettyPrinter(stream=sys.stderr).pprint(resp.json())
    sys.exit(resp)

auth_header = { "Authorization": "JWT {}".format(auth_token) }
session.headers = merge_dicts(content_header, auth_header)

 #Get data about current sensor configuration
url = 'https://{}/api/v1/deployment-profiles'.format(args.server)
resp = session.get(url)
sensor_data = resp.json()['data'][0]

if not args.id:
  """
  Add or delete and set entries in an Installation configurtion dictionary so that
  persistence of the sensor is set properly. 
  :param config:      Dictionary to be configured. Will be modified.
  :param persistence: Boolean, true for persistent, false for dissolvable
  :return: Reference the newly configured dictionary.
  """
  def setPersistence(config, persistence):
    config['install_persistent'] = persistence
    if not persistence:
      config.pop('service_display_name', None)
      config.pop('service_name', None)
    else:
      config['service_display_name'] = 'EndpointSensor'
      config['service_name'] = 'esensor'
    return config

  #Configure a payload describing a sensor with the desired parameters set on the command line.
  payload = {
    'name': args.name,
    'api_key': sensor_data['api_key'],
    'base_image': not args.vdi,
    'config': {
      'Mitigation': sensor_data['config']['Mitigation'],
      'Installation': setPersistence(sensor_data['config']['Installation'], not args.dissolvable),
      'Kernel': sensor_data['config']['Kernel']
    },
    'policy': sensor_data['policy'],
    'receiver': 'https://{}'.format(args.transceiver),
    'sensor_directory': sensor_data['sensor_directory'],
    'sensor_version': sensor_data['sensor_version']
  }

  #Create the sensor and get its ID, required for downloading its software.
  url = 'https://{}/api/v1/deployment-profiles'.format(args.server)
  resp = session.post(url, json=payload) 
  installer_id = checkResponse(resp, lambda r : r.json()['data']['success'])
else:
  installer_id = args.id



#Download the Windows sensor software and save it to a file.
url = 'https://{}/api/v1/windows/installer/{}'.format(args.server, installer_id)
resp = session.get(url)
def saveInstaller(resp):
  installer_name = '-'.join('{}-{}.zip'.format(args.basename, args.name).split())
  with open(installer_name, 'wb') as f:
    f.write(resp.content)
  print(sensor_data['api_key'])
  print(installer_name)
checkResponse(resp, saveInstaller)
