import { DeviceFactsInterface } from './device-facts.interface';
import { JobInterface } from './job.interface';
import { StatusInterface } from './status.interface';

/**
 * Interface defines the Selected Node
 *
 * @export
 * @interface SelectedNodeInterface
 */
export interface SelectedNodeInterface {
  deployment_name: string;
  deployment_type: string;
  deviceFacts: DeviceFactsInterface;
  hostname: string;
  ip_address: string;
  jobs: JobInterface[];
  mac_address: string;
  node_type: string;
  raid0_override: boolean;
  status?: StatusInterface;
  virtual_cpu: number;
  virtual_data: number;
  virtual_mem: number;
  virtual_os: number;
  vpn_status: string;
  _id: string;
}
