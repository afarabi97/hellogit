import { StatusInterface } from '../interfaces';

/**
 * Class defines status
 *
 * @export
 * @class StatusClass
 */
export class StatusClass implements StatusInterface {
  appVersion: string;
  application: string;
  deployment_name: string;
  hostname: string;
  node_type?: string;
  status: string;

  /**
   * Creates an instance of StatusClass.
   *
   * @param {StatusInterface} status_interface
   * @memberof StatusClass
   */
  constructor(status_interface: StatusInterface) {
    this.appVersion = status_interface.appVersion;
    this.application = status_interface.application;
    this.deployment_name = status_interface.deployment_name;
    this.hostname = status_interface.hostname;
    this.node_type = status_interface.node_type;
    this.status = status_interface.status;
  }
}
