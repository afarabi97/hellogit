import { InitialDeviceStateInterface } from '../../src/app/modules/tools/interfaces/initial-device-states.interface';
import { MockIfaceStateInterfaceArray } from './iface-state.interface';

export const MockInitialDeviceStateInterfaceSensor1: InitialDeviceStateInterface = {
  node: 'fake-sensor1.fake',
  interfaces: MockIfaceStateInterfaceArray
};
export const MockInitialDeviceStateInterfaceSensor2: InitialDeviceStateInterface = {
  node: 'fake-sensor2.fake',
  interfaces: MockIfaceStateInterfaceArray
};
export const MockInitialDeviceStateInterfaceArray: InitialDeviceStateInterface[] = [
  MockInitialDeviceStateInterfaceSensor1,
  MockInitialDeviceStateInterfaceSensor2
];
