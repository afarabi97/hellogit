import { ObjectUtilitiesClass } from '../../../classes';
import { AppConfigInterface, ElementSpecInterface } from '../interfaces';
import { ElementSpecClass } from './element-spec.class';

/**
 * Class defines the App Config
 *
 * @export
 * @class AppConfigClass
 * @implements {AppConfigInterface}
 */
export class AppConfigClass implements AppConfigInterface {
  name: string;
  form?: ElementSpecClass[];

  /**
   * Creates an instance of AppConfigClass.
   *
   * @param {AppConfigInterface} app_config_interface
   * @memberof AppConfigClass
   */
  constructor(app_config_interface: AppConfigInterface) {
    this.name = app_config_interface.name;
    if (ObjectUtilitiesClass.notUndefNull(app_config_interface.form)) {
      this.form = app_config_interface.form.map((es: ElementSpecInterface) => new ElementSpecClass(es));
    } else {
      this.form = [];
    }
  }
}
