import { ObjectUtilitiesClass } from '../../../classes';
import { AppConfigInterface, ElementSpecInterface, AppConfigContentInterface } from '../interfaces';
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
  hasEditableConfig?: boolean;
  configLocation?: string;

  /**
   * Creates an instance of AppConfigClass.
   *
   * @param {AppConfigInterface} app_config_interface
   * @memberof AppConfigClass
   */
  constructor(app_config_interface: AppConfigInterface) {
    this.name = app_config_interface.name;

    if (ObjectUtilitiesClass.notUndefNull(app_config_interface.hasEditableConfig)) {
      this.hasEditableConfig = app_config_interface.hasEditableConfig
    }

    if (ObjectUtilitiesClass.notUndefNull(app_config_interface.configLocation)) {
      this.configLocation = app_config_interface.configLocation
    }

    if (ObjectUtilitiesClass.notUndefNull(app_config_interface.form)) {
      this.form = app_config_interface.form.map((es: ElementSpecInterface) => new ElementSpecClass(es));
    } else {
      this.form = [];
    }
  }

}


/**
 * Class defines the App Config
 *
 * @export
 * @class AppConfigClass
 * @implements {AppConfigContentInterface}
 */
 export class AppConfigContentClass implements AppConfigContentInterface {
  filename: string;
  content: string;

  /**
   * Creates an instance of AppConfigClass.
   *
   * @param {AppConfigContentInterface} app_config_interface
   * @memberof AppConfigClass
   */
  constructor(config: AppConfigContentInterface) {
    this.filename = config.filename;
    this.content = config.content;
  }
}
