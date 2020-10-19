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
  kubernetes_services_cidr: string;
  nodes: NodeClass[];

  /**
   * Creates an instance of KitFormClass.
   *
   * @param {KitFormInterface} kitFormInterface
   * @memberof KitFormClass
   */
  constructor(kitFormInterface: KitFormInterface) {
    this.complete = kitFormInterface.complete;
    this.kubernetes_services_cidr = kitFormInterface.kubernetes_services_cidr;
    this.nodes = kitFormInterface.nodes.map((n: NodeInterface) => new NodeClass(n));
  }
}