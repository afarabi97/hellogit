import { KubernetesConfigClass } from '../../src/app/modules/config-map/classes/kubernetes-config.class';
import { MockKubernetesConfigInterface } from '../interface-objects';

export const MockKubernetesConfigClass: KubernetesConfigClass = new KubernetesConfigClass(MockKubernetesConfigInterface);
