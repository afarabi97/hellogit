import { NodeInterface } from './node.interface';

/**
 * Interface defines the kit form
 *
 * @export
 * @interface KitFormInterface
 */
export interface KitFormInterface {
  complete: boolean;
  dns_ip?: string;
  kubernetes_services_cidr: string;
  nodes: NodeInterface[];
  use_proxy_pool: boolean;
}
