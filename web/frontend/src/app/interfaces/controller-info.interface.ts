import { IPSetFirstLastInterface } from './ip-set-first-last.interface';

/**
 * Interface defines the Controller Info
 *
 * @export
 * @interface ControllerInfoInterface
 */
export interface ControllerInfoInterface {
  ip_address: string;
  gateway: string;
  netmask: string;
  name: string;
  cidrs: string[];
  dhcp_range: string;
  cidr_ranges: Record<string, IPSetFirstLastInterface>;
}
