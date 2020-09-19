import { NodeInterface } from './node.interface';

/**
 * Interface defines the kit form
 *
 * @export
 * @interface KitFormInterface
 */
export interface KitFormInterface {
  complete: boolean;
  kubernetes_services_cidr: string;
  nodes: NodeInterface[];
}
