import { KitTokenInterface } from '../interfaces';

/**
 * Class defines the Kit Token
 *
 * @export
 * @class KitTokenClass
 * @implements {KitTokenInterface}
 */
export class KitTokenClass implements KitTokenInterface {
  kit_token_id?: string;
  ipaddress: string;
  token?: string;
  elasticsearch_status?: string;
  kibana_status?: string;
  hostname?: string;

  /**
   * Creates an instance of KitTokenClass.
   *
   * @param {KitTokenInterface} kit_token_interface
   * @memberof KitTokenClass
   */
  constructor(kit_token_interface: KitTokenInterface) {
    this.kit_token_id = kit_token_interface.kit_token_id;
    this.ipaddress = kit_token_interface.ipaddress;
    this.token = kit_token_interface.token;
    this.elasticsearch_status = kit_token_interface.elasticsearch_status;
    this.kibana_status = kit_token_interface.kibana_status;
    this.hostname = kit_token_interface.hostname;
  }
}
