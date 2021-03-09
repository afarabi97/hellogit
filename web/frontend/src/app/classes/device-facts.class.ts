import { DeviceFactsInterface, DisksInterface, InterfacesInterface } from '../interfaces';
import { DefaultIPV4SettingsClass } from './default-ipv4-settings.class';
import { DisksClass } from './disks.class';
import { InterfacesClass } from './interfaces.class';
import { ObjectUtilitiesClass } from './object-utilities.class';

/**
 * Class defines the device facts
 *
 * @export
 * @class DeviceFactsClass
 */
export class DeviceFactsClass implements DeviceFactsInterface {
  cpus_available: number;
  default_ipv4_settings: DefaultIPV4SettingsClass;
  disks: DisksClass[];
  hostname: string;
  interfaces: InterfacesClass[];
  memory_available: number;
  potential_monitor_interfaces: string[];
  product_name: string;

  /**
   * Creates an instance of DeviceFactsClass.
   *
   * @param {DeviceFactsInterface} deviceFactsInterface
   * @memberof DeviceFactsClass
   */
  constructor(deviceFactsInterface: DeviceFactsInterface) {
    this.cpus_available = deviceFactsInterface.cpus_available;
    this.default_ipv4_settings = new DefaultIPV4SettingsClass(deviceFactsInterface.default_ipv4_settings);
    this.hostname = deviceFactsInterface.hostname;
    this.memory_available = deviceFactsInterface.memory_available;
    this.potential_monitor_interfaces = deviceFactsInterface.potential_monitor_interfaces;
    this.product_name = deviceFactsInterface.product_name;
    if (ObjectUtilitiesClass.notUndefNull(deviceFactsInterface.disks)) {
      this.disks = deviceFactsInterface.disks.map((d: DisksInterface) => new DisksClass(d));
    } else {
      this.disks = [];
    }
    if (ObjectUtilitiesClass.notUndefNull(deviceFactsInterface.interfaces)) {
      this.interfaces = deviceFactsInterface.interfaces.map((i: InterfacesInterface) => new InterfacesClass(i));
    } else {
      this.interfaces = [];
    }
  }
}
