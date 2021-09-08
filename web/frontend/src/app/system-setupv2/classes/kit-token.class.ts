import {
  KitTokenInterface
} from '../interfaces/kit-token.interface';

export class KitTokenClass implements KitTokenInterface {
  kit_token_id?: string;
  ipaddress: string;
  token?: string;
  elasticsearch_status?: string;
  kibana_status?: string;
  hostname?: string;

  constructor(kit_token_interface: KitTokenInterface) {
    this.kit_token_id = kit_token_interface.kit_token_id;
    this.ipaddress = kit_token_interface.ipaddress;
    this.token = kit_token_interface.token;
    this.elasticsearch_status = kit_token_interface.elasticsearch_status;
    this.kibana_status = kit_token_interface.kibana_status;
    this.hostname = kit_token_interface.hostname;
  }
}
