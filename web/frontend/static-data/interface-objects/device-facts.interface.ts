import { DeviceFactsInterface } from '../../src/app/interfaces';
import {
  MockDefaultIPV4SettingsSensorInterface,
  MockDefaultIPV4SettingsServerInterface
} from './default-ipv4-settings.interface';
import { MockDisksSDAInterface, MockDisksSDBInterface } from './disks.interface';
import {
  MockInterfacesSensorMainInterface,
  MockInterfacesSensorSupplementInterface,
  MockInterfacesServerMainInterface
} from './interfaces.interface';

export const MockDeviceFactsServerInterface: DeviceFactsInterface = {
  cpus_available: 16,
  default_ipv4_settings: MockDefaultIPV4SettingsServerInterface,
  disks: [
    MockDisksSDAInterface,
    MockDisksSDBInterface
  ],
  hostname: 'fake-server1.lan',
  interfaces: [
    MockInterfacesServerMainInterface
  ],
  management_ip: '10.40.31.65',
  memory_available: 15.5107421875,
  memory_gb: 7.625,
  memory_mb: 7808,
  potential_monitor_interfaces:[],
  product_name: 'VMware Virtual Platform'
};

export const MockDeviceFactsSensorInterface: DeviceFactsInterface = {
  cpus_available: 16,
  default_ipv4_settings: MockDefaultIPV4SettingsSensorInterface,
  disks: [
    MockDisksSDAInterface,
    MockDisksSDBInterface
  ],
  hostname: 'fake-sensor1.lan',
  interfaces: [
    MockInterfacesSensorMainInterface,
    MockInterfacesSensorSupplementInterface
  ],
  management_ip: '10.40.31.65',
  memory_available: 15.509765625,
  memory_gb: 7.625,
  memory_mb: 7808,
  potential_monitor_interfaces: [ 'fak224' ],
  product_name: 'VMware Virtual Platform'
};
