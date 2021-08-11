import { Observable } from 'rxjs';

import { AssociatedPodClass } from '../../classes/associated-pod.class';
import { ConfigMapEditClass } from '../../classes/config-map-edit.class';
import { KubernetesConfigClass } from '../../classes/kubernetes-config.class';
import { ConfigMapSaveInterface } from '../config-map-save.interface';

/**
 * Interface defines the Config Map Service
 *
 * @export
 * @interface ConfigMapServiceInterface
 */
export interface ConfigMapServiceInterface {
  get_config_maps(): Observable<KubernetesConfigClass>;
  edit_config_map(config_map_save: ConfigMapSaveInterface): Observable<ConfigMapEditClass>;
  get_associated_pods(config_map_name: string): Observable<AssociatedPodClass[]>;
}
