import { NodeInterface } from '../interfaces';
import { DeviceFactsClass } from './device-facts.class';
import { StatusClass } from './status.class';

/**
 * Class defines the node
 *
 * @export
 * @class NodeClass
 */
export class NodeClass implements NodeInterface {
  deployment_name?: string;
  deviceFacts: DeviceFactsClass;
  hostname: string;
  is_master_server?: boolean;
  is_remote?: boolean;
  management_ip_address: string;
  node_type: string;
  status?: StatusClass;

  /**
   * Creates an instance of NodeClass.
   *
   * @param {NodeInterface} nodeInterface
   * @memberof NodeClass
   */
  constructor(nodeInterface: NodeInterface) {
    this.deployment_name = nodeInterface.deployment_name;
    this.deviceFacts = new DeviceFactsClass(nodeInterface.deviceFacts);
    this.hostname = nodeInterface.hostname;
    this.is_master_server = nodeInterface.is_master_server;
    this.is_remote = nodeInterface.is_remote;
    this.management_ip_address = nodeInterface.management_ip_address;
    this.node_type = nodeInterface.node_type;
  }
}
