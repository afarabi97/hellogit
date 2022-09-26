import { UpdateAlertsInterface } from '../../src/app/modules/security-alerts/interfaces';

export const MockUpdateAlertsInterfaceCaptureLoss: UpdateAlertsInterface = {
  count: 768,
  'event.module': 'zeek',
  'event.kind': 'alert',
  'rule.name': 'CaptureLoss::Too_Little_Traffic'
};
export const MockUpdateAlertsInterfaceBadICMPChecksum: UpdateAlertsInterface = {
  count: 6,
  'event.module': 'zeek',
  'event.kind': 'alert',
  'rule.name': 'bad_ICMP_checksum'
};
export const MockUpdateAlertsInterfacePossibleSplitRouting: UpdateAlertsInterface = {
  count: 2,
  'event.module': 'zeek',
  'event.kind': 'alert',
  'rule.name': 'possible_split_routing'
};
export const MockUpdateAlertsInterfaceDataBeforeEstablished: UpdateAlertsInterface = {
  count: 1,
  'event.module': 'zeek',
  'event.kind': 'alert',
  'rule.name': 'data_before_established'
};
export const MockUpdateAlertsInterfaceArray: UpdateAlertsInterface[] = [
  MockUpdateAlertsInterfaceCaptureLoss,
  MockUpdateAlertsInterfaceBadICMPChecksum,
  MockUpdateAlertsInterfacePossibleSplitRouting,
  MockUpdateAlertsInterfaceDataBeforeEstablished
];