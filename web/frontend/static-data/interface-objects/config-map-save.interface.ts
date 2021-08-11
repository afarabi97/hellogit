import { ConfigMapSaveInterface } from '../../src/app/modules/config-map/interfaces/config-map-save.interface';
import { MockKubernetesConfigInterface } from './kubernetes-config.interface';
import { MockAssociatedPodInterfaceArray } from './associated-pod.interface';

export const MockConfigMapSaveInterface: ConfigMapSaveInterface = {
  configMap: MockKubernetesConfigInterface.items[0],
  associatedPods: MockAssociatedPodInterfaceArray
};
