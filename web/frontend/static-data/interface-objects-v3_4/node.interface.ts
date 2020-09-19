import { NodeInterface } from '../../src/app/interfaces';
import { MockDeviceFactsSensorInterface, MockDeviceFactsServerInterface } from './device-facts.interface';

export const MockNodeServerInterface: NodeInterface = {
    deviceFacts: MockDeviceFactsServerInterface,
    hostname: 'fake-server1.lan',
    is_master_server: true,
    ip_address: '10.40.13.92',
    node_type: 'Server'
};

export const MockNodeSensorInterface: NodeInterface = {
    deviceFacts: MockDeviceFactsSensorInterface,
    hostname: 'fake-sensor1.lan',
    is_remote: false,
    ip_address: '10.40.13.94',
    node_type: 'Sensor'
};
