/**
 * Interface defines the Elastic License Data
 *
 * @export
 * @interface ElasticLicenseDataInterface
 */
export interface ElasticLicenseDataInterface {
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
}
