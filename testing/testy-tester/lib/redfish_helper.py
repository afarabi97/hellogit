#from future import standard_library
#import redfish
#standard_library.install_aliases()

import sys
import requests
import json
from requests.structures import CaseInsensitiveDict

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


HEADERS = {
    'OData-Version': '4.0',
    'Content-type': 'application/json',
    'Accept': 'application/json'
}

TOKEN_LOOKUP = {}

def get_token(ip, username, password, token=None):
    headers = {
        'OData-Version': '4.0',
        'Content-type': 'application/json',
        'Accept': 'application/json'
    }
    host = "https://{}".format(ip)
    url = "{}/redfish/v1/".format(host)

    resp = requests.get(url, verify=False)
    data = CaseInsensitiveDict(resp.json())
    links = CaseInsensitiveDict(data['links'])
    sessions = links['sessions']
    session_url = sessions.get('@odata.id') or \
                  sessions.get('href')
    session_url = "{}{}".format(host, session_url)
    if session_url[-1] != '/':
        session_url += "/"

    body = {'UserName': username, 'Password': password}
    resp = requests.post(session_url, data=json.dumps(body),
                        headers=HEADERS, verify=False)
    token = resp.headers.get('X-Auth-Token')
    TOKEN_LOOKUP[token] = {
        'username': username,
        'password': password
    }

    if not token:
        raise Exception("Invalid login for redfish.")
    return token

def set_pxe_boot(ip, token):

    h = HEADERS.copy()
    h['x-auth-token'] = token

    host = "https://{}".format(ip)
    url = "{}/redfish/v1".format(host)

    systems = requests.get(url + "/Systems/", headers=h, verify=False)
    system_url = systems.json()['Members'][0]['@odata.id']
    #supermicro needs trailing slashes
    system_url = system_url if system_url[-1] == '/' else system_url + '/'

    resp = requests.get(host + system_url, headers=h, verify=False)
    data = resp.json()

    manufacturer = data['Manufacturer']

    boot = data.get('Boot') or {}
    uefi = 'UefiTargetBootSourceOverride' in boot
    boot_mode = 'UEFI' if uefi else 'BIOS'
    boot_set = False
    error_message = ''

    if manufacturer[0:2] == 'HP':
        h['Cookie'] = "sessionKey={}".format(token)

        boot_order_url = host + "/json/boot_order"
        resp = requests.get(boot_order_url,
            headers=h, verify=False
        )

        boot_devices = resp.json()['boot_devices']
        pxe_port = None
        for data in boot_devices:
            if 'Slot 1 Port 1' in data['device'] and \
                'IPv4' in data['device']:
                pxe_port = data
                break

        if not pxe_port:
            raise Exception("Could not find Slot 1 Port 1 (IPv4) for HP Server")

        payload = {
            "method":"set_one_time_boot",
            "device":"UEFI Target",
            "uefi_device": pxe_port['device'],
            "uefi_device_id": pxe_port['id'],
            "session_key": token
        }

        resp = requests.post(boot_order_url,
            data=json.dumps(payload),
            headers=h, verify=False
        )
        boot_set = resp.status_code == 200
        error_message = resp.text or ''

    else:
        bios_url = system_url
        payload = {
            "Boot": {
                "BootSourceOverrideEnabled": "Once",
                "BootSourceOverrideTarget": "Pxe",
            }
        }
        resp = requests.patch(host + bios_url,
            headers=h, verify=False,
            data=json.dumps(payload))
        boot_set = resp.status_code == 200

    if boot_set:
        print("Boot mode: {}".format(boot_mode))
        return boot_mode
    else:
        print(data.get('Manufacturer'))
        print(resp.__dict__)
        print(boot_mode)
        raise Exception("Error setting boot order for {} : {}".format(ip, error_message))


def get_pxe_mac(ip, token):
    h = HEADERS.copy()
    h['x-auth-token'] = token

    host = "https://{}".format(ip)
    url = "{}/redfish/v1".format(host)
    resp = requests.get(url + '/Systems', headers=h, verify=False)
    data = resp.json()
    members = data['Members']
    system_url = members[0]['@odata.id']
    system_url = host + system_url

    resp = requests.get(system_url, headers=h, verify=False)
    #data = CaseInsensitiveDict(resp.modjson())
    data = resp.json()

    manufacturer = data['Manufacturer']
    if manufacturer == 'Supermicro':
        # stupid supermicro only shows ipmi interface in redfish
        h = {'Content-Type': 'application/x-www-form-urlencoded'}
        creds = TOKEN_LOOKUP[token]
        login_data = 'name={}&pwd={}'.format(creds['username'], creds['password'])
        resp = requests.post(host + '/cgi/login.cgi', headers=h, data=login_data, verify=False)

        cookies = resp.headers['Set-Cookie']
        sid = cookies.split('SID=')[2].split(';')[0]
        h['Cookie'] = "SID={};".format(sid)

        platform_info = "Get_PlatformInfo.XML=(0%2C0)"
        resp = requests.post(host + '/cgi/ipmi.cgi', headers=h,
            data=platform_info, verify=False)

        from xml.etree import ElementTree
        platform_info = ElementTree.fromstring(resp.content)
        interface = platform_info.getchildren()[0]
        pxe_mac = interface.get('MB_MAC_ADDR1')

        return pxe_mac

    elif manufacturer[0:2] == 'HP':
        # HP
        oem = data['Oem']
        hp = oem['Hp']
        links = hp['Links']
        network_adapters = links['NetworkAdapters']
        for adapter in network_adapters:
            net_link = network_adapters['@odata.id']
            net_link = "{}{}".format(host, net_link)
            resp = requests.get(net_link, headers=h, verify=False)
            data = resp.json()
            members = data['Members']

            adapter1 = members[1]
            nic_url = "{}{}".format(host, adapter1['@odata.id'])
            nic = requests.get(nic_url, headers=h, verify=False)
            nic = nic.json()

            pxe_mac = nic['PhysicalPorts'][0]['MacAddress']
            return pxe_mac

    elif 'EthernetInterfaces' in data:
        # Dell
        interfaces_url = data.get('EthernetInterfaces').get('@odata.id')
        interfaces_url = "{}{}".format(host, interfaces_url)
        resp = requests.get(interfaces_url, headers=h, verify=False)
        interfaces = resp.json()

        nic_url = None
        for member in interfaces['Members']:
            member_id = member['@odata.id']
            if 'NIC.Embedded.1-1-1' in member_id:
                nic_url = member_id
                break

        nic_url = "{}{}".format(host, nic_url)
        resp = requests.get(nic_url, headers=h, verify=False)
        nic = resp.json()
        name = nic['@odata.id']
        pxe_mac = nic['MACAddress']
        return pxe_mac

    else:
        raise Exception("Couldn't find MAC for hardware. Please look at redfish implementation to fix.")

def restart_server(ip, token):
    h = HEADERS.copy()
    h['x-auth-token'] = token

    host = "https://{}".format(ip)
    url = "{}/redfish/v1".format(host)

    systems = requests.get(url + "/Systems/", headers=h, verify=False)
    system_url = systems.json()['Members'][0]['@odata.id']
    resp = requests.get(host + system_url, headers=h, verify=False)
    system_data = resp.json()
    power_state = system_data['PowerState']

    actions = system_data['Actions']
    reset_action = actions['#ComputerSystem.Reset']
    reset_options = reset_action['ResetType@Redfish.AllowableValues']
    reset_target = reset_action['target']

    if power_state == 'Off':
        data = '{"ResetType": "On"}'
    elif 'GracefulRestart' in reset_options:
        data = {"ResetType": "GracefulRestart"}
    else:
        data = {"ResetType": "ForceRestart"}

    resp = requests.post(host + reset_target, headers=h, verify=False,
        data=json.dumps(data))

    if resp.status_code in (200, 204):
        return 0
    else:
        print(system_data['Manufacturer'])
        print(resp)
        print(host + reset_target)
        print(data)
        print(reset_options)
        raise Exception("Error restarting {}".format(ip))


def power_off(ip, token):
    h = HEADERS.copy()
    h['x-auth-token'] = token

    host = "https://{}".format(ip)
    url = "{}/redfish/v1".format(host)

    systems = requests.get(url + "/Systems/", headers=h, verify=False)
    system_url = systems.json()['Members'][0]['@odata.id']
    resp = requests.get(host + system_url, headers=h, verify=False)
    system_data = resp.json()
    power_state = system_data['PowerState']

    actions = system_data['Actions']
    reset_action = actions['#ComputerSystem.Reset']
    reset_options = reset_action['ResetType@Redfish.AllowableValues']
    reset_target = reset_action['target']

    if power_state == 'Off':
        data = '{"ResetType": "On"}'
    elif 'GracefulRestart' in reset_options:
        data = {"ResetType": "GracefulRestart"}
    else:
        data = {"ResetType": "ForceRestart"}

    resp = requests.post(host + reset_target, headers=h, verify=False,
        data=json.dumps(data))

    if resp.status_code in (200, 204):
        return 0
    else:
        print(system_data['Manufacturer'])
        print(resp)
        print(host + reset_target)
        print(data)
        print(reset_options)
        raise Exception("Error restarting {}".format(ip))


def power_on(ip, token):
    pass


def connection_manager(ip, username, password):
    import redfish
    from future import standard_library
    standard_library.install_aliases()

    url = "https://{}/redfish/v1/".format(ip)
    remote_mgmt = redfish.connect(url,
                                  username,
                                  password,
                                  verify_cert=False,
                                  enforceSSL=False)

    return remote_mgmt


def example():
    import os

    ip = '172.16.22.21'
    USER_NAME = "root"
    PASSWORD = os.getenv('PASSWORD')

    ip = '172.16.22.21'

    ips = [
        '172.16.22.25', # hp
        '172.16.22.26',
        #'172.16.22.35',
        #'172.16.22.36',

        '172.16.22.21', # supermicro
        '172.16.22.22',
        '172.16.22.23',
        '172.16.22.24',

        '172.16.22.45', # dell
        '172.16.22.44',
        '172.16.22.43',
        '172.16.22.42',
        '172.16.22.41',
    ]

    ips = [
        #'172.16.22.26', #problem server
        #'172.16.22.25', #problem server
        '172.16.22.34',
        #'172.16.22.25',
        #'172.16.22.33',
        #'172.16.22.24',
        #'172.16.22.33',
        #'172.16.22.23',
        #'172.16.22.25', # HP DL-160
        #'172.16.22.21', # supermicro
        #'172.16.22.46', # R440
    ]

    for ip in ips:
        token = get_token(ip, USER_NAME, PASSWORD)
        print("Getting MAC")
        mac = get_pxe_mac(ip, token)
        print("Setting boot order")
        result = set_pxe_boot(ip, token)
        print("Restarting server")
        result = restart_server(ip, token)
        print("{} - {}".format(ip, mac))

    sys.exit(0)


def example2():
    #token = get_token(ip, USER_NAME, PASSWORD)
    remote_mgmt = connection_manager(ip, USER_NAME, PASSWORD)

    network_adapters = remote_mgmt.Systems.systems_dict['1'] \
                .network_adapters_collection \
                .network_adapters_dict

    print( network_adapters['1'].get_mac() )
    print( network_adapters['2'].get_mac() )

    import pdb; pdb.set_trace()

    print("Redfish API version : {} \n".format(remote_mgmt.get_api_version()))
    print("UUID : {} \n".format(remote_mgmt.Root.get_api_UUID()))
    print("System 1 :\n")
    print("Bios version : {}\n".format(
        remote_mgmt.Systems.systems_dict["1"].get_bios_version()))
    print("System 2 :\n")
    print("Serial Number : {}\n".format(
        remote_mgmt.Systems.systems_dict["1"].get_parameter("SerialNumber")))



if __name__ == '__main__':

    example()