import { KitFormInterface } from '../../src/app/interfaces';
import { MockNodeServerInterface, MockNodeSensorInterface } from './node.interface';

export const MockKitFormInterface: KitFormInterface = {
    complete: true,
    kubernetes_services_cidr: '10.40.13.96',
    nodes: [ MockNodeServerInterface, MockNodeSensorInterface]
};
