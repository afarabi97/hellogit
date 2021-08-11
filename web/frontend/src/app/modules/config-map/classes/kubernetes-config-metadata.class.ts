import { KubernetesConfigMetadataInterface } from '../interfaces/kubernetes-config-metadata.interface';

/**
 * Class defines the Kubernetes Config Metadata
 *
 * @export
 * @class KubernetesConfigMetadataClass
 * @implements {KubernetesConfigMetadataInterface}
 */
export class KubernetesConfigMetadataClass implements KubernetesConfigMetadataInterface {
  resource_version: string;
  self_link?: string;
  _continue?: string;

  /**
   * Creates an instance of KubernetesConfigMetadataClass.
   *
   * @param {KubernetesConfigMetadataInterface} kubernetes_config_metadata
   * @memberof KubernetesConfigMetadataClass
   */
  constructor(kubernetes_config_metadata: KubernetesConfigMetadataInterface) {
    this.resource_version = kubernetes_config_metadata.resource_version;
    this.self_link = kubernetes_config_metadata.self_link;
    this._continue = kubernetes_config_metadata._continue;
  }
}
