import { ElasticLicenseDataInterface } from '../interfaces/elastic-license-data.interface';

/**
 * Class defines the Elastic License Data
 *
 * @export
 * @class ElasticLicenseDataClass
 */
 export class ElasticLicenseDataClass implements ElasticLicenseDataInterface {
  status: string;
  uid: string;
  type: string;
  issue_date: Date;
  issue_date_in_millis: number;
  expiry_date: Date;
  expiry_date_in_millis: number;
  max_nodes: number;
  issued_to: string;
  issuer: string;
  start_date_in_millis: number;

  /**
   * Creates an instance of ElasticLicenseDataClass.
   *
   * @param {ElasticLicenseDataInterface} elastic_license_data_interface
   * @memberof ElasticLicenseDataClass
   */
  constructor(elastic_license_data_interface: ElasticLicenseDataInterface) {
    this.status = elastic_license_data_interface.status;
    this.uid = elastic_license_data_interface.uid;
    this.type = elastic_license_data_interface.type;
    this.issue_date = elastic_license_data_interface.issue_date;
    this.issue_date_in_millis = elastic_license_data_interface.issue_date_in_millis;
    this.expiry_date = elastic_license_data_interface.expiry_date;
    this.expiry_date_in_millis = elastic_license_data_interface.expiry_date_in_millis;
    this.max_nodes = elastic_license_data_interface.max_nodes;
    this.issued_to = elastic_license_data_interface.issued_to;
    this.issuer = elastic_license_data_interface.issuer;
    this.start_date_in_millis = elastic_license_data_interface.start_date_in_millis;
  }
}
