import { KitFormInterface, NodeInterface } from '../interfaces';
import { NodeClass } from './node.class';
import { ObjectUtilitiesClass } from './object-utilities.class';

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
   * @param {KitFormInterface} kit_form_interface
   * @memberof KitFormClass
   */
  constructor(kit_form_interface: KitFormInterface) {
    this.complete = kit_form_interface.complete;
    this.kubernetes_services_cidr = kit_form_interface.kubernetes_services_cidr;
    if (ObjectUtilitiesClass.notUndefNull(kit_form_interface.nodes)) {
      this.nodes = kit_form_interface.nodes.map((n: NodeInterface) => new NodeClass(n));
    } else {
      this.nodes = [];
    }
  }
}
