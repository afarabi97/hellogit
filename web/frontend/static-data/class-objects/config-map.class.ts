import { ConfigMapClass } from '../../src/app/classes';
import { MockConfigMapInterfaceLocalProvisionerConfig, MockConfigMapInterfaceLogstash } from '../interface-objects';

export const MockConfigMapClassLocalProvisionerConfig: ConfigMapClass = new ConfigMapClass(MockConfigMapInterfaceLocalProvisionerConfig);
export const MockConfigMapClassLogstash: ConfigMapClass = new ConfigMapClass(MockConfigMapInterfaceLogstash);
