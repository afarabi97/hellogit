import { ObjectUtilitiesClass } from '../../../classes';
import { HostInterface, IPTargetListInterface } from '../interfaces';
import { HostClass } from './host.class';
import { NTLMClass } from './ntlm.class';
import { SMBClass } from './smb.class';

/**
 * Class defines the IP Target List
 *
 * @export
 * @class IPTargetListClass
 * @implements {IPTargetListInterface}
 */
export class IPTargetListClass implements IPTargetListInterface {
  _id?: string;
  name: string;
  protocol: string;
  ntlm: NTLMClass;
  smb: SMBClass;
  targets?: HostClass[];

  /**
   * Creates an instance of IpTargetList.
   *
   * @param {IPTargetListInterface} ip_target_list_interface
   * @memberof IpTargetList
   */
  constructor(ip_target_list_interface: IPTargetListInterface) {
    if (ObjectUtilitiesClass.notUndefNull(ip_target_list_interface)) {
      this._id = ip_target_list_interface._id;
      this.name = ip_target_list_interface.name;
      this.protocol = ip_target_list_interface.protocol;
      this.ntlm = new NTLMClass(ip_target_list_interface.ntlm);
      this.smb = new SMBClass(ip_target_list_interface.smb);
      if (ObjectUtilitiesClass.notUndefNull(ip_target_list_interface.targets)) {
        this.targets = ip_target_list_interface.targets.map((h: HostInterface) => new HostClass(h, ip_target_list_interface._id));
      }
    } else {
      this._id = '';
      this.name = '';
      this.protocol = '';
      this.ntlm = new NTLMClass(null);
      this.smb = new SMBClass(null);
      this.targets = [];
    }
  }
}
