import { KitTokenInterface } from '../../src/app/interfaces';

export const MockKitTokenInterface: KitTokenInterface = {
  kibana_status: 'green',
  elasticsearch_status: 'green',
  token: 'afafadsfdasf34234dsfgasdfadsf',
  ipaddress: '10.10.10.10',
  kit_token_id: '656sdf656dfdf4545dfd',
  hostname: 'controller.lan'
};
export const MockKitTokenInterfaceAlt: KitTokenInterface = {
  kibana_status: 'yellow',
  elasticsearch_status: 'green',
  token: null,
  ipaddress: '10.10.10.10',
  kit_token_id: '656sdf656dfdf4545dfd',
  hostname: 'controller.lan'
};
