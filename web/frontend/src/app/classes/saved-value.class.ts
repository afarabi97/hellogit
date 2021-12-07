import { SavedValueInterface } from '../interfaces';

/**
 * Class defines the Saved Value
 *
 * @export
 * @class SavedValueClass
 * @implements {SavedValueInterface}
 */
export class SavedValueClass implements SavedValueInterface {
  application: string;
  deployment_name: string;
  values: Object;
  _id: string;

  /**
   * Creates an instance of SavedValueClass.
   *
   * @param {SavedValueInterface} saved_value_interface
   * @memberof SavedValueClass
   */
  constructor(saved_value_interface: SavedValueInterface) {
    this.application = saved_value_interface.application;
    this.deployment_name = saved_value_interface.deployment_name;
    this.values = saved_value_interface.values;
    this._id = saved_value_interface._id;
  }
}
