import { KitFormInterface, NodeInterface } from '../interfaces';
import { NodeClass } from './node.class';

/**
 * Class defines the kit form
 *
 * @export
 * @class KitFormClass
 */
export class KitFormClass implements KitFormInterface {
  complete: boolean;
  dns_ip?: string;
  kubernetes_services_cidr: string;
  nodes: NodeClass[];
  use_proxy_pool: boolean;

  /**
   * Creates an instance of KitFormClass.
   *
   * @param {KitFormInterface} kitFormInterface
   * @memberof KitFormClass
   */
  constructor(kitFormInterface: KitFormInterface) {
    this.complete = kitFormInterface.complete;
    this.dns_ip = kitFormInterface.dns_ip;
    this.kubernetes_services_cidr = kitFormInterface.kubernetes_services_cidr;
    this.nodes = kitFormInterface.nodes.map((n: NodeInterface) => new NodeClass(n));
    this.use_proxy_pool = kitFormInterface.use_proxy_pool;
  }
}
