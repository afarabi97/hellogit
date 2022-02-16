import { AppInterface } from "../interfaces";

/**
 * Class defines the App
 *
 * @export
 * @class AppClass er
 * @implements {AppInterface}
 */
export class AppClass implements AppInterface {
  application: string;
  deployment_name: string;

  /**
   * Creates an instance of AppClass.
   *
   * @param {AppInterface} app_interface
   * @memberof AppClass
   */
  constructor(app_interface: AppInterface) {
    this.application = app_interface.application;
    this.deployment_name = app_interface.deployment_name;
  }
}
