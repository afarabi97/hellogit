import { KubernetesConfigInterface } from '../../src/app/modules/config-map/interfaces/kubernetes-config.interface';
import { MockConfigMapInterfaceLocalProvisionerConfig, MockConfigMapInterfaceLogstash } from './config-map.interface';

export const MockKubernetesConfigInterface: KubernetesConfigInterface = {
    api_version: 'v1',
    items: [
        MockConfigMapInterfaceLocalProvisionerConfig,
        MockConfigMapInterfaceLogstash
    ],
    kind: 'ConfigMapList',
    metadata: {
      resource_version: '191886',
      self_link: null,
      _continue: null
    }
};
