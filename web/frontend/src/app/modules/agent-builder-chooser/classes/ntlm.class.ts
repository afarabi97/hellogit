import { ObjectUtilitiesClass } from '../../../classes/object-utilities.class';
import { NTLMInterface } from '../interfaces';

/**
 * Class defines the NTLM
 *
 * @export
 * @class NTLMClass
 * @implements {NTLMInterface}
 */
export class NTLMClass implements NTLMInterface {
  domain_name: string;
  is_ssl: boolean;
  port: string;

  /**
   * Creates an instance of NTLMClass.
   *
   * @param {NTLMInterface} ntlm_interface
   * @memberof NTLMClass
   */
  constructor(ntlm_interface: NTLMInterface) {
    if (ObjectUtilitiesClass.notUndefNull(ntlm_interface)) {
      this.is_ssl = ntlm_interface.is_ssl;
      this.port = ntlm_interface.port;
      this.domain_name = ntlm_interface.domain_name;
    } else {
      this.is_ssl = false;
      this.port = '';
      this.domain_name = '';
    }
  }
}
