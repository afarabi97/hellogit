import { DeviceFactsInterface } from './device-facts.interface';

/**
 * Interface defines the node
 *
 * @export
 * @interface NodeInterface
 */
export interface NodeInterface {
  deployment_name?: string;
  deviceFacts: DeviceFactsInterface;
  hostname: string;
  is_master_server?: boolean;
  is_remote?: boolean;
  ip_address: string;
  node_type: string;
}
