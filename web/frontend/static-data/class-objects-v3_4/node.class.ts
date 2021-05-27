import { NodeClass } from '../../src/app/classes';
import { MockDeviceFactsSensorClass, MockDeviceFactsServerClass } from './device-facts.class';

export const MockNodeServerClass: NodeClass = {
    deviceFacts: MockDeviceFactsServerClass,
    hostname: 'fake-server1.lan',
    ip_address: '10.40.13.92',
    node_type: 'Server'
};

export const MockNodeSensorClass: NodeClass = {
    deviceFacts: MockDeviceFactsSensorClass,
    hostname: 'fake-sensor1.lan',
    is_remote: false,
    ip_address: '10.40.13.94',
    node_type: 'Sensor'
};
