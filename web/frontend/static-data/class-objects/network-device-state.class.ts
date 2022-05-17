import { NetworkDeviceStateClass } from '../../src/app/modules/tools/classes/network-device-state.class';
import { MockNetworkDeviceStateInterfaceUp, MockNetworkDeviceStateInterfaceDown } from '../interface-objects';

export const MockNetworkDeviceStateClassUp: NetworkDeviceStateClass = new NetworkDeviceStateClass(MockNetworkDeviceStateInterfaceUp);
export const MockNetworkDeviceStateClassDown: NetworkDeviceStateClass = new NetworkDeviceStateClass(MockNetworkDeviceStateInterfaceDown);
