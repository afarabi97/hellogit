import { KitFormInterface } from '../../src/app/interfaces';
import { MockNodeServerInterface, MockNodeSensorInterface } from './node.interface';

export const MockKitFormInterface: KitFormInterface = {
    complete: true,
    dns_ip: null,
    kubernetes_services_cidr: '10.40.13.96',
    nodes: [ MockNodeServerInterface, MockNodeSensorInterface],
    use_proxy_pool: false
};
