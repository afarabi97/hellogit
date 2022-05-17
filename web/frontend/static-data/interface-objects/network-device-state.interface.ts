import { NetworkDeviceStateInterface } from '../../src/app/modules/tools/interfaces/network-device-state.interface';

export const MockNetworkDeviceStateInterfaceUp: NetworkDeviceStateInterface = {
  node: 'fake-sensor3.fake',
  device: 'ens224',
  state: 'up',
  link_up: true
};
export const MockNetworkDeviceStateInterfaceDown: NetworkDeviceStateInterface = {
  node: 'fake-sensor3.fake',
  device: 'ens224',
  state: 'down',
  link_up: false
};
