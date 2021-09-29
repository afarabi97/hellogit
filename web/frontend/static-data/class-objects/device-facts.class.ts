import { DeviceFactsClass } from '../../src/app/classes';
import { MockDeviceFactsSensorInterface, MockDeviceFactsServerInterface } from '../interface-objects';

export const MockDeviceFactsServerClass: DeviceFactsClass = new DeviceFactsClass(MockDeviceFactsServerInterface);
export const MockDeviceFactsSensorClass: DeviceFactsClass = new DeviceFactsClass(MockDeviceFactsSensorInterface);
