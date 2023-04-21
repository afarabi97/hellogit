import { DeviceFactsInterface } from './device-facts.interface';
import { JobInterface } from './job.interface';

/**
 * Interface defines the node
 *
 * @export
 * @interface NodeInterface
 */
export interface NodeInterface {
  _id?: string;
  deployment_name?: string;
  deployment_type: string;
  deviceFacts: DeviceFactsInterface;
  hostname: string;
  ip_address: string;
  is_remote?: boolean;
  jobs?: JobInterface[];
  mac_address: string;
  node_type: string;
  raid0_override: boolean;
  virtual_cpu: number;
  virtual_data: number;
  virtual_mem: number;
  virtual_os: number;
  vpn_status: string | null;
}
