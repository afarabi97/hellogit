import { DeviceFactsClass } from '../../src/app/classes';
import { MockDefaultIPV4SettingsSensorClass, MockDefaultIPV4SettingsServerClass } from './default-ipv4-settings.class';
import { MockDisksSDAClass, MockDisksSDBClass } from './disks.class';
import {
    MockInterfacesSensorMainClass,
    MockInterfacesSensorSupplementClass,
    MockInterfacesServerMainClass
} from './interfaces.class';

export const MockDeviceFactsServerClass: DeviceFactsClass = {
    cpus_available: 16,
    default_ipv4_settings: MockDefaultIPV4SettingsServerClass,
    disks: [ MockDisksSDAClass, MockDisksSDBClass ],
    hostname: 'fake-server1.lan',
    interfaces: [ MockInterfacesServerMainClass ],
    memory_available:15.5107421875,
    potential_monitor_interfaces:[],
    product_name: 'VMware Virtual Platform'
};

export const MockDeviceFactsSensorClass: DeviceFactsClass = {
    cpus_available: 16,
    default_ipv4_settings: MockDefaultIPV4SettingsSensorClass,
    disks: [ MockDisksSDAClass, MockDisksSDBClass ],
    hostname: 'fake-sensor1.lan',
    interfaces: [ MockInterfacesSensorMainClass, MockInterfacesSensorSupplementClass ],
    memory_available: 15.509765625,
    potential_monitor_interfaces: [ 'fak224' ],
    product_name: 'VMware Virtual Platform'
};
