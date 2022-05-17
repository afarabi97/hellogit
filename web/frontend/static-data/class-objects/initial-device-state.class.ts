import { InitialDeviceStateClass } from '../../src/app/modules/tools/classes/initial-device-state.class';
import { MockInitialDeviceStateInterfaceSensor1, MockInitialDeviceStateInterfaceSensor2 } from '../interface-objects';

export const MockInitialDeviceStateClassSensor1: InitialDeviceStateClass = new InitialDeviceStateClass(MockInitialDeviceStateInterfaceSensor1);
export const MockInitialDeviceStateClassSensor2: InitialDeviceStateClass = new InitialDeviceStateClass(MockInitialDeviceStateInterfaceSensor2);
export const MockInitialDeviceStateClassArray: InitialDeviceStateClass[] = [
  MockInitialDeviceStateClassSensor1,
  MockInitialDeviceStateClassSensor2
];
