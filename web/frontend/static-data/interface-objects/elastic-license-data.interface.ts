import { ElasticLicenseDataInterface } from '../../src/app/modules/tools/interfaces/elastic-license-data.interface';

export const MockElasticLicenseDataInterface: ElasticLicenseDataInterface = {
  expiry_date: new Date('2022-05-11T15:56:45.090Z'),
  expiry_date_in_millis: 1654876605090,
  issue_date: new Date('2022-05-11T15:56:45.090Z'),
  issue_date_in_millis: 1652284605090,
  issued_to: 'tfplenum',
  issuer: 'elasticsearch',
  max_nodes: 1000,
  start_date_in_millis: -1,
  status: 'active',
  type: 'trial',
  uid: 'ea7fd418-fe28-4b56-aae0-e25cda35bba5'
};
