import { DefaultIPV4SettingsInterface } from '../../src/app/interfaces';

export const MockDefaultIPV4SettingsServerInterface: DefaultIPV4SettingsInterface = {
    address: '10.40.13.92',
    alias: 'fak192',
    broadcast: '10.40.13.255',
    gateway: '10.40.13.1',
    interface: 'fak192',
    macaddress: '00:0a:29:19:85:cd',
    mtu: 1500,
    netmask: '255.255.255.0',
    network: '10.40.13.0',
    type: 'ether'
};

export const MockDefaultIPV4SettingsSensorInterface: DefaultIPV4SettingsInterface = {
    address: '10.40.13.94',
    alias: 'fak192',
    broadcast: '10.40.13.255',
    gateway: '10.40.13.1',
    interface: 'fak192',
    macaddress: '00:0a:29:90:85:5e',
    mtu: 1500,
    netmask: '255.255.255.0',
    network: '10.40.13.0',
    type: 'ether'
};
