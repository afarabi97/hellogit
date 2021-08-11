import { ConfigMapInterface } from '../../../interfaces';
import { KubernetesConfigMetadataInterface } from './kubernetes-config-metadata.interface';

/**
 * Interface defines the Kubernetes Config
 *
 * @export
 * @interface KubernetesConfigInterface
 */
export interface KubernetesConfigInterface {
  api_version: string;
  kind: string;
  items: ConfigMapInterface[];
  metadata: KubernetesConfigMetadataInterface;
}
