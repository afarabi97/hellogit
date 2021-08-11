import { ConfigMapClass } from '../../../classes';
import { ConfigMapInterface } from '../../../interfaces';
import { KubernetesConfigInterface } from '../interfaces/kubernetes-config.interface';
import { KubernetesConfigMetadataClass } from './kubernetes-config-metadata.class';

/**
 * Class defines the Kubernetes Config
 *
 * @export
 * @class KubernetesConfigClass
 * @implements {KubernetesConfigInterface}
 */
export class KubernetesConfigClass implements KubernetesConfigInterface {
  api_version: string;
  kind: string;
  items: ConfigMapClass[];
  metadata: KubernetesConfigMetadataClass;

  /**
   * Creates an instance of KubernetesConfigClass.
   *
   * @param {KubernetesConfigInterface} kubernetes_config_interface
   * @memberof KubernetesConfigClass
   */
  constructor(kubernetes_config_interface: KubernetesConfigInterface) {
    this.api_version = kubernetes_config_interface.api_version;
    this.kind = kubernetes_config_interface.kind;
    this.items = kubernetes_config_interface.items.map((i: ConfigMapInterface) => new ConfigMapClass(i));
    this.metadata = new KubernetesConfigMetadataClass(kubernetes_config_interface.metadata);
  }
}
