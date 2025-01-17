import { KitFormClass } from '../../src/app/classes';
import { MockNodeServerClass, MockNodeSensorClass  } from './node.class';

export const MockKitFormClass: KitFormClass = {
    complete: true,
    kubernetes_services_cidr: '10.40.13.96',
    nodes: [ MockNodeServerClass, MockNodeSensorClass]
};
