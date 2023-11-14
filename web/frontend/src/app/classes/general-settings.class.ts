import { GeneralSettingsInterface } from '../interfaces';

/**
 * Class defines the General Settings
 *
 * @export
 * @class GeneralSettingsClass
 * @implements {GeneralSettingsInterface}
 */
export class GeneralSettingsClass implements GeneralSettingsInterface {
  _id?: string;
  controller_interface: string;
  netmask: string;
  gateway: string;
  domain: string;
  job_id?: string;
  job_completed?: boolean;
  dhcp_range?: string;

  /**
   * Creates an instance of GeneralSettingsClass.
   *
   * @param {GeneralSettingsInterface} general_settings_Interface
   * @memberof GeneralSettingsClass
   */
  constructor(general_settings_Interface: GeneralSettingsInterface) {
    this._id = general_settings_Interface._id;
    this.controller_interface = general_settings_Interface.controller_interface;
    this.netmask = general_settings_Interface.netmask;
    this.gateway = general_settings_Interface.gateway;
    this.domain = general_settings_Interface.domain;
    this.job_id = general_settings_Interface.job_id;
    this.job_completed = general_settings_Interface.job_completed;
    this.dhcp_range = general_settings_Interface.dhcp_range;
  }
}
