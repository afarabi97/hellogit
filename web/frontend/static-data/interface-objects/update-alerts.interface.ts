import { UpdateAlertsInterface } from '../../src/app/modules/security-alerts/interfaces';

export const MockUpdateAlertsInterfaceCaptureLoss: UpdateAlertsInterface = {
  count: 768,
  'event.module': 'zeek',
  'event.kind': 'alert',
  'rule.name': 'CaptureLoss::Too_Little_Traffic'
};
export const MockUpdateAlertsInterfaceBadICMPChecksum: UpdateAlertsInterface = {
  count: 6,
  'event.module': 'system',
  'event.kind': 'signal',
  'rule.name': 'bad_ICMP_checksum'
};
export const MockUpdateAlertsInterfacePossibleSplitRouting: UpdateAlertsInterface = {
  count: 2,
  'event.module': 'suricata',
  'event.kind': 'alert',
  'rule.name': 'possible_split_routing'
};
export const MockUpdateAlertsInterfaceDataBeforeEstablished: UpdateAlertsInterface = {
  count: 1,
  'event.module': 'endgame',
  'event.kind': 'alert',
  'rule.name': 'data_before_established'
};
export const MockUpdateAlertsInterfaceDataBeforeEstablishedDays: UpdateAlertsInterface = {
  count: 1,
  'event.module': 'system',
  'event.kind': 'alert',
  'rule.name': 'data_before_established'
};
export const MockUpdateAlertsInterfaceDataBeforeEstablishedMinutesLess60: UpdateAlertsInterface = {
  count: 1,
  'event.module': 'sysmon',
  'event.kind': 'alert',
  'rule.name': 'data_before_established'
};
export const MockUpdateAlertsInterfaceDataBeforeEstablishedMinutesGreater60: UpdateAlertsInterface = {
  count: 1,
  'event.module': 'zeek',
  'event.kind': 'alert',
  'rule.name': 'data_before_established'
};
export const MockUpdateAlertsInterfaceWithArkimeFields: UpdateAlertsInterface = {
  count: 1,
  'event.module': 'zeek',
  'event.kind': 'alert',
  'rule.name': 'data_before_established',
  'source.address': 'source-address',
  '@timestamp': '2022-09-20T05:05:20.098Z'
};
export const MockUpdateAlertsInterfaceArray: UpdateAlertsInterface[] = [
  MockUpdateAlertsInterfaceCaptureLoss,
  MockUpdateAlertsInterfaceBadICMPChecksum,
  MockUpdateAlertsInterfacePossibleSplitRouting,
  MockUpdateAlertsInterfaceDataBeforeEstablished
];
