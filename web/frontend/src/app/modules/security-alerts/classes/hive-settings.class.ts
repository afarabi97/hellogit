import { HiveSettingsInterface } from '../interfaces';

/**
 * Class defines the Hive Settings
 *
 * @export
 * @class HiveSettingsClass
 * @implements {HiveSettingsInterface}
 */
export class HiveSettingsClass implements HiveSettingsInterface {
  admin_api_key: string;
  org_admin_api_key: string;

  /**
   * Creates an instance of HiveSettingsClass.
   *
   * @param {HiveSettingsInterface} hive_settings_interface
   * @memberof HiveSettingsClass
   */
  constructor(hive_settings_interface: HiveSettingsInterface) {
    this.admin_api_key = hive_settings_interface.admin_api_key;
    this.org_admin_api_key = hive_settings_interface.org_admin_api_key;
  }
}
