import { MipSettingsInterface } from '../interfaces';

/**
 * Class defines the Mip Settings
 *
 * @export
 * @class MipSettingsClass
 * @implements {MipSettingsInterface}
 */
export class MipSettingsClass implements MipSettingsInterface {
  _id: string;
  password: string;
  user_password: string;
  luks_password: string;

  /**
   * Creates an instance of MipSettingsClass.
   *
   * @param {MipSettingsInterface} mip_settings_interface
   * @memberof MipSettingsClass
   */
  constructor(mip_settings_interface: MipSettingsInterface) {
    this._id = mip_settings_interface._id;
    this.password = mip_settings_interface.password;
    this.user_password = mip_settings_interface.user_password;
    this.luks_password = mip_settings_interface.luks_password;
  }
}
