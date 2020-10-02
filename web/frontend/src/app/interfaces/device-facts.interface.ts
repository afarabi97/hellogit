import { DefaultIPV4SettingsInterface } from './default-ipv4-settings.interface';
import { DisksInterface } from './disks.interface';
import { InterfacesInterface } from './interfaces.interface';

/**
 * Interface defines the device facts
 *
 * @export
 * @interface DeviceFactsInterface
 */
export interface DeviceFactsInterface {
  cpus_available: number;
  default_ipv4_settings: DefaultIPV4SettingsInterface;
  disks: DisksInterface[];
  hostname: string;
  interfaces: InterfacesInterface[];
  memory_available: number;
  potential_monitor_interfaces: string[];
  product_name: string;
}
