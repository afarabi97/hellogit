import { ConfigMapInterface } from '../../../interfaces';
import { AssociatedPodInterface } from './associated-pod.interface';

/**
 * Interface defines the Config Map Save
 *
 * @export
 * @interface ConfigMapSaveInterface
 */
export interface ConfigMapSaveInterface {
  configMap: ConfigMapInterface;
  associatedPods: AssociatedPodInterface[];
}
