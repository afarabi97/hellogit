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
import re

parser = argparse.ArgumentParser(description = "Add an Endgame sensor and download its agent software. "
                                               "Prints the 'api_key' required to install the sensor and "
                                               "the name of the installer downloaded.")
parser.add_argument('-s', '--server', help='<Required> Endgame server', required=True)
parser.add_argument('-u', '--username', required=True, help='<Required> Endgame server user name')
parser.add_argument('-p', '--password', required=True, help='<Required> Endgame server password')
parser.add_argument('-i', '--id', required=True, help='Unique ID of sensor (for downloading existing sensor)')
parser.add_argument('-d', '--dissolvable', action='store_true',
                    help='Construct dissolvable sensor (default is persistent sensor)')
parser.add_argument('-v', '--vdi', action='store_false', help='VDI Compatibility')

try:
  args=parser.parse_args()
except:
  exit(1)

requests.packages.urllib3.disable_warnings( requests.packages.urllib3.exceptions.InsecureRequestWarning )
session = requests.Session()
session.verify = False

def checkResponse(resp, action):
  """
  Check the response of a requests library call. If it's okay, perform an action
  and return the return value of the action.
  If the response was not okay, print the response JSON to stderr and exit the
  script, returning the response value.
  :param resp: Response to check.
  :param action: Action to take if response was good.
  :return: Return value of the action.
  """
  if(resp.ok):
    return action(resp)
  else:
    PrettyPrinter(stream=sys.stderr).pprint(resp.json())
    sys.exit(resp)


#Get authorization token from server, i.e., log in.
url = 'https://{}/api/v1/auth/login'.format(args.server)
content_header = { 'Content-Type': 'application/json' }
resp = session.post(url, json = { 'username': args.username, 'password': args.password },
                     headers = content_header)
auth_token = checkResponse(resp, lambda r: r.json()['metadata']['token'])

def merge_dicts(d1, *args):
  """
  Merge dictionaries into a single dictionary
  :param d1:    First dictionary to merge
  :param args:  Other dictionaries to merge.
  :return: A dictionary containing all the key-value pairs of all the dictionaries passed in as parameters.
  """
  merged = d1.copy();
  for d in args:
    merged.update(d)
  return merged

auth_header = { "Authorization": "JWT {}".format(auth_token) }
session.headers = merge_dicts(content_header, auth_header)

 #Get data about current sensor configuration
url = 'https://{}/api/v1/deployment-profiles'.format(args.server)
resp = session.get(url)
sensor_data = checkResponse(resp, lambda r : r.json()['data'][0])

installer_id = args.id

#Download the Windows sensor software and save it to a file.
url = 'https://{}/api/v1/windows/installer/{}'.format(args.server, installer_id)
resp = session.get(url)

def saveInstaller(resp):
  """
  Save the installer downloaded from the server. Name the file based on command line arguments.
  :param resp: Response returned by request for the installer from the Endgame server
  """
  cd = resp.headers.get('Content-Disposition')
  installer_name = re.search('"(.*)"', cd).group(1)
  with open(installer_name, 'wb') as f:
    f.write(resp.content)
  print(sensor_data['api_key'])
  print(installer_name)

checkResponse(resp, saveInstaller)
