#from future import standard_library
#import redfish
#standard_library.install_aliases()

import sys
import requests
import json
from requests.structures import CaseInsensitiveDict
from util.network import retry

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


HEADERS = {
    'OData-Version': '4.0',
    'Content-type': 'application/json',
    'Accept': 'application/json'
}

TOKEN_LOOKUP = {}

def server_info(ip, token):
    h = HEADERS.copy()
    h['x-auth-token'] = token

    host = "https://{}".format(ip)
    url = "{}/redfish/v1".format(host)

    systems = requests.get(url + "/Systems/", headers=h, verify=False)
    system_url = systems.json()['Members'][0]['@odata.id']
    resp = requests.get(host + system_url, headers=h, verify=False)
    system_data = resp.json()
    #print(system_data)
    info = {
        'pxe_mac': get_pxe_mac(ip, token),
        'sku': system_data['SKU'],
        'serial': system_data['SerialNumber'],
        'model': system_data['Model'],
        'memory_gb': system_data['MemorySummary']['TotalSystemMemoryGiB']
    }
    processors_data = requests.get(host + system_data['Processors']['@odata.id'],
        headers=h, verify=False).json()
    processors = []
    vcpus = 0
    cores = 0
    for member in processors_data['Members']:
        processor = requests.get(host + member['@odata.id'],
            headers=h, verify=False).json()
        proc_info = {
            'model': processor['Model'],
            'manufacturer': processor['Manufacturer'],
            'cores': processor['TotalCores'],
            'threads': processor['TotalThreads']
        }
        processors.append(proc_info)
        vcpus += proc_info['threads']
        cores += proc_info['cores']
    info['processors'] = processors
    info['vcpus'] = vcpus
    info['cores'] = vcpus

    # storage
    controllers = requests.get(host + system_data['SimpleStorage']['@odata.id'],
        headers=h, verify=False).json()
    raid_members = [x for x in controllers['Members'] if 'RAID' in x['@odata.id']]
    raid_url = raid_members[0]['@odata.id']
    raid_data = requests.get(host+raid_url, headers=h, verify=False).json()
    capacity_bytes = sum([d['CapacityBytes'] for d in raid_data['Devices'] \
        if d['CapacityBytes'] is not None])
    info['raid'] = {
        'status': raid_data['Status'],
        'terabytes': round(capacity_bytes / (10 ** 12), 2)
    }
    return info


def logout(token):
    h = HEADERS.copy()
    h['x-auth-token'] = token

    session_url = TOKEN_LOOKUP[token]['session_url']
    resp = requests.delete(session_url, headers=h, verify=False)

@retry()
def get_token(ip, username, password):
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
    session_url = data.get('@odata.id')
    data = resp.json()
    TOKEN_LOOKUP[token] = {
        'username': username,
        'password': password,
        'session_url': host + session_url if session_url else None
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

        members = sorted( [x['@odata.id'] for x in interfaces['Members'] ])
        # find the interface that has status Enabled
        for member in members:
            nic_url = "{}{}".format(host, member)
            resp = requests.get(nic_url, headers=h, verify=False)
            nic = resp.json()
            name = nic['@odata.id']
            state = nic['Status']['State']
            if state == 'Enabled':
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
        data = {"ResetType": "On"}
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
        print(power_state)
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
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument("-p", "--pxe", dest="pxe", action='store_true', default=False)
    args = parser.parse_args()
    pxe = args.pxe

    USER_NAME = "root"
    PASSWORD = os.getenv('REDFISH_PWD')
    ips = [
        #'172.16.22.25', # HP DL-160
        #'172.16.22.21', # supermicro
        '172.16.22.41', # R440
        '172.16.22.42', # R440
        '172.16.22.43', # R440
        '172.16.22.44', # R440
        '172.16.22.45', # R440
        '172.16.22.46', # R440
        '172.16.22.47', # R440
        #'172.16.22.47', # R440
    ]
    for ip in ips:
        token = get_token(ip, USER_NAME, PASSWORD)
        print("Getting MAC")
        mac = get_pxe_mac(ip, token)
        print("{} - {}".format(ip, mac))
        if pxe:
            print("Setting boot order")
            result = set_pxe_boot(ip, token)
            print("Restarting server")
            result = restart_server(ip, token)
        logout(token)
    sys.exit(0)


def example2():
    ip = ""
    USER_NAME = "root"
    PASSWORD = ""
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
