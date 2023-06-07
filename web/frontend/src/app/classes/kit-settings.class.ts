import { KitSettingsInterface } from '../interfaces';
import { ObjectUtilitiesClass } from './object-utilities.class';

/**
 * Class defines the Kit Settings
 *
 * @export
 * @class KitSettingsClass
 * @implements {KitSettingsInterface}
 */
export class KitSettingsClass implements KitSettingsInterface {
  _id: string;
  kubernetes_services_cidr: string;
  password: string;
  upstream_dns: string;
  upstream_ntp: string;
  job_id: string;
  job_completed: boolean;
  is_gip?: boolean;
  controller_interface?: string;
  netmask?: string;
  gateway?: string;
  domain?: string;
  dhcp_range?: string;

  /**
   * Creates an instance of KitSettingsClass.
   *
   * @param {KitSettingsInterface} kit_settings_interface
   * @memberof KitSettingsClass
   */
  constructor(kit_settings_interface: KitSettingsInterface) {
    this._id = kit_settings_interface._id;
    this.kubernetes_services_cidr = kit_settings_interface.kubernetes_services_cidr;
    this.password = kit_settings_interface.password;
    this.upstream_dns = kit_settings_interface.upstream_dns;
    this.upstream_ntp = kit_settings_interface.upstream_ntp;
    this.job_id = kit_settings_interface.job_id;
    this.job_completed = kit_settings_interface.job_completed;
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(kit_settings_interface.is_gip)) {
      this.is_gip = kit_settings_interface.is_gip;
    }
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(kit_settings_interface.controller_interface)) {
      this.controller_interface = kit_settings_interface.controller_interface;
    }
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(kit_settings_interface.netmask)) {
      this.netmask = kit_settings_interface.netmask;
    }
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(kit_settings_interface.gateway)) {
      this.gateway = kit_settings_interface.gateway;
    }
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(kit_settings_interface.domain)) {
      this.domain = kit_settings_interface.domain;
    }
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(kit_settings_interface.dhcp_range)) {
      this.dhcp_range = kit_settings_interface.dhcp_range;
    }
  }
}
