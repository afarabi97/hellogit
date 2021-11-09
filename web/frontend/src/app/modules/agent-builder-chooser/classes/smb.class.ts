import { ObjectUtilitiesClass } from '../../../classes/object-utilities.class';
import { SMBInterface } from '../interfaces';

/**
 * Class defines the SMB
 *
 * @export
 * @class SMBClass
 * @implements {SMBInterface}
 */
export class SMBClass implements SMBInterface {
  domain_name: string;
  port: string;

  /**
   * Creates an instance of SMBClass.
   *
   * @param {SMBInterface} smb_interface
   * @memberof SMBClass
   */
  constructor(smb_interface: SMBInterface) {
    if (ObjectUtilitiesClass.notUndefNull(smb_interface)) {
      this.port = smb_interface.port;
      this.domain_name = smb_interface.domain_name;
    } else {
      this.port = '';
      this.domain_name = '';
    }
  }
}
