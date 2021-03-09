import { CatalogStatusInterface } from "../interfaces";

/**
 * Class defines the CatalogStatus
 *
 * @export
 * @class CatalogStatusClass
 * @implements {CatalogStatusInterface}
 */
export class CatalogStatusClass implements CatalogStatusInterface {
  application: string;
  appVersion: string;
  status: string;
  deployment_name: string;
  hostname: string;
  node_type: string;

  /**
   * Creates an instance of CatalogStatusClass.
   *
   * @param {CatalogStatusInterface} catalog_status_interface
   * @memberof CatalogStatusClass
   */
  constructor(catalog_status_interface: CatalogStatusInterface) {
    this.application = catalog_status_interface.application;
    this.appVersion = catalog_status_interface.appVersion;
    this.status = catalog_status_interface.status;
    this.deployment_name = catalog_status_interface.deployment_name;
    this.hostname = catalog_status_interface.hostname;
    this.node_type = catalog_status_interface.node_type;
  }
}
