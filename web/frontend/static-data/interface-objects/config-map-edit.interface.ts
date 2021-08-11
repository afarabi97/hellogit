import { ConfigMapEditInterface } from '../../src/app/modules/config-map/interfaces/config-map-edit.interface';
import { MockConfigMapInterfaceLocalProvisionerConfig } from './config-map.interface';

export const MockConfigMapEditInterface: ConfigMapEditInterface = {
  name: MockConfigMapInterfaceLocalProvisionerConfig.metadata.name
};
