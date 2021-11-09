import { HostInterface } from '../../src/app/modules/agent-builder-chooser/interfaces';

export const MockHostInterface1: HostInterface = {
  hostname: 'DESKTOP-1',
  state: 'Error',
  last_state_change: '2019-10-28 16:27:15',
  target_config_id: '5db3291789372679049120vb'
};
export const MockHostInterface2: HostInterface = {
  hostname: 'DESKTOP-2',
  state: 'Uninstalled',
  last_state_change: '2019-10-28 11:27:15',
  target_config_id: '5db3291789372679049120vb'
};
export const MockHostInterface3: HostInterface = {
  hostname: 'DESKTOP-3',
  state: 'Installed',
  last_state_change: '2019-10-28 12:27:15',
  target_config_id: '5db32912343726790498601b'
};
export const MockHostInterface4: HostInterface = {
  hostname: 'DESKTOP-4',
  state: 'Installed',
  last_state_change: '2019-10-28 18:27:15',
  target_config_id: '5db32912343726790498601b'
};
export const MockHostInterfacesArray1: HostInterface[] = [
  MockHostInterface1,
  MockHostInterface2
];
export const MockHostInterfacesArray2: HostInterface[] = [
  MockHostInterface3,
  MockHostInterface4
];
