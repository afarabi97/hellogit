import { KitSettingsInterface } from '../interfaces';

/**
 * Class defines the Kit Settings
 *
 * @export
 * @class KitSettingsClass
 * @implements {KitSettingsInterface}
 */
export class KitSettingsClass implements KitSettingsInterface {
  _id: string;
  controller_interface: string;
  kubernetes_services_cidr: string;
  password: string;
  netmask: string;
  gateway: string;
  domain: string;
  upstream_dns: string;
  upstream_ntp: string;
  dhcp_range: string;
  job_id: string;
  job_completed: boolean;
  is_gip?: boolean;

  /**
   * Creates an instance of KitSettingsClass.
   *
   * @param {KitSettingsInterface} kit_settings_interface
   * @memberof KitSettingsClass
   */
  constructor(kit_settings_interface: KitSettingsInterface) {
    this._id = kit_settings_interface._id;
    this.controller_interface = kit_settings_interface.controller_interface;
    this.kubernetes_services_cidr = kit_settings_interface.kubernetes_services_cidr;
    this.password = kit_settings_interface.password;
    this.netmask = kit_settings_interface.netmask;
    this.gateway = kit_settings_interface.gateway;
    this.domain = kit_settings_interface.domain;
    this.upstream_dns = kit_settings_interface.upstream_dns;
    this.upstream_ntp = kit_settings_interface.upstream_ntp;
    this.dhcp_range = kit_settings_interface.dhcp_range;
    this.job_id = kit_settings_interface.job_id;
    this.job_completed = kit_settings_interface.job_completed;
    this.is_gip = kit_settings_interface.is_gip;
  }
}
