import { ConfigMapEditInterface } from '../interfaces/config-map-edit.interface';

/**
 * Class defines the Config Map Edit
 *
 * @export
 * @class ConfigMapEditClass
 * @implements {ConfigMapEditInterface}
 */
export class ConfigMapEditClass implements ConfigMapEditInterface {
  name: string;

  /**
   * Creates an instance of ConfigMapEditClass.
   *
   * @param {ConfigMapEditInterface} config_map_edit_interface
   * @memberof ConfigMapEditClass
   */
  constructor(config_map_edit_interface: ConfigMapEditInterface) {
    this.name = config_map_edit_interface.name;
  }
}
