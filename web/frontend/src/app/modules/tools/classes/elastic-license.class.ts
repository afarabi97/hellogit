import { ElasticLicenseInterface } from '../interfaces/elastic-license.interface';
import { ElasticLicenseDataClass } from './elastic-license-data.class';

/**
 * Class defines the Elastic License
 *
 * @export
 * @class ElasticLicenseClass
 */
export class ElasticLicenseClass implements ElasticLicenseInterface {
  license: ElasticLicenseDataClass;

  /**
   * Creates an instance of ElasticLicenseClass.
   *
   * @param {ElasticLicenseInterface} elastic_license_interface
   * @memberof ElasticLicenseClass
   */
  constructor(elastic_license_interface: ElasticLicenseInterface) {
    this.license = new ElasticLicenseDataClass(elastic_license_interface.license);
  }
}
