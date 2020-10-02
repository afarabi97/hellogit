import { DefaultIPV4SettingsInterface } from '../interfaces';

/**
 * Class defines the default ipv4 settings
 *
 * @export
 * @class DefaultIPV4SettingsClass
 */
export class DefaultIPV4SettingsClass implements DefaultIPV4SettingsInterface {
  address: string;
  alias: string;
  broadcast: string;
  gateway: string;
  interface: string;
  macaddress: string;
  mtu: number;
  netmask: string;
  network: string;
  type: string;

  /**
   * Creates an instance of DefaultIPV4SettingsClass.
   *
   * @param {DefaultIPV4SettingsInterface} defaultIPV4SettingsInterface
   * @memberof DefaultIPV4SettingsClass
   */
  constructor(defaultIPV4SettingsInterface: DefaultIPV4SettingsInterface) {
    this.address = defaultIPV4SettingsInterface.address;
    this.alias = defaultIPV4SettingsInterface.alias;
    this.broadcast = defaultIPV4SettingsInterface.broadcast;
    this.gateway = defaultIPV4SettingsInterface.gateway;
    this.interface = defaultIPV4SettingsInterface.interface;
    this.macaddress = defaultIPV4SettingsInterface.macaddress;
    this.mtu = defaultIPV4SettingsInterface.mtu;
    this.netmask = defaultIPV4SettingsInterface.netmask;
    this.network = defaultIPV4SettingsInterface.network;
    this.type = defaultIPV4SettingsInterface.type;
  }
}
