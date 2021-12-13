import { HostInterface } from './host.interface';
import { NTLMInterface } from './ntlm.interface';
import { SMBInterface } from './smb.interface';

/**
 * Interface defines the IP Target List
 *
 * @export
 * @interface IPTargetListInterface
 */
export interface IPTargetListInterface {
  _id?: string;
  name: string;
  protocol: string;
  ntlm: NTLMInterface;
  smb: SMBInterface;
  targets?: HostInterface[];
}
