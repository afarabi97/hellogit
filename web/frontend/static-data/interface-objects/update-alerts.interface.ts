import { UpdateAlertsInterface } from '../../src/app/modules/security-alerts/interfaces';
import {
  MockAlertFormInterfaceDays,
  MockAlertFormInterfaceMinutesGreater60,
  MockAlertFormInterfaceMinutesLess60
} from './alert-form.interface';
import { MockPortalLinkFakeInterface, MockPortalLinkInterface } from './portal-link.interface';

export const MockUpdateAlertsInterfaceCaptureLoss: UpdateAlertsInterface = {
  count: 768,
  'event.module': 'zeek',
  'event.kind': 'alert',
  'rule.name': 'CaptureLoss::Too_Little_Traffic',
  form: MockAlertFormInterfaceDays,
  links: [
    MockPortalLinkInterface,
    MockPortalLinkFakeInterface
  ]
};
export const MockUpdateAlertsInterfaceBadICMPChecksum: UpdateAlertsInterface = {
  count: 6,
  'event.module': 'zeek',
  'event.kind': 'alert',
  'rule.name': 'bad_ICMP_checksum',
  form: MockAlertFormInterfaceDays,
  links: [
    MockPortalLinkInterface,
    MockPortalLinkFakeInterface
  ]
};
export const MockUpdateAlertsInterfacePossibleSplitRouting: UpdateAlertsInterface = {
  count: 2,
  'event.module': 'zeek',
  'event.kind': 'alert',
  'rule.name': 'possible_split_routing',
  form: MockAlertFormInterfaceDays,
  links: [
    MockPortalLinkInterface,
    MockPortalLinkFakeInterface
  ]
};
export const MockUpdateAlertsInterfaceDataBeforeEstablished: UpdateAlertsInterface = {
  count: 1,
  'event.module': 'zeek',
  'event.kind': 'alert',
  'rule.name': 'data_before_established',
  form: MockAlertFormInterfaceDays,
  links: [
    MockPortalLinkInterface,
    MockPortalLinkFakeInterface
  ]
};
export const MockUpdateAlertsInterfaceDataBeforeEstablishedDays: UpdateAlertsInterface = {
  count: 1,
  'event.module': 'zeek',
  'event.kind': 'alert',
  'rule.name': 'data_before_established',
  form: MockAlertFormInterfaceDays,
  links: [
    MockPortalLinkInterface,
    MockPortalLinkFakeInterface
  ]
};
export const MockUpdateAlertsInterfaceDataBeforeEstablishedMinutesLess60: UpdateAlertsInterface = {
  count: 1,
  'event.module': 'zeek',
  'event.kind': 'alert',
  'rule.name': 'data_before_established',
  form: MockAlertFormInterfaceMinutesLess60,
  links: [
    MockPortalLinkInterface,
    MockPortalLinkFakeInterface
  ]
};
export const MockUpdateAlertsInterfaceDataBeforeEstablishedMinutesGreater60: UpdateAlertsInterface = {
  count: 1,
  'event.module': 'zeek',
  'event.kind': 'alert',
  'rule.name': 'data_before_established',
  form: MockAlertFormInterfaceMinutesGreater60,
  links: [
    MockPortalLinkInterface,
    MockPortalLinkFakeInterface
  ]
};
export const MockUpdateAlertsInterfaceArray: UpdateAlertsInterface[] = [
  MockUpdateAlertsInterfaceCaptureLoss,
  MockUpdateAlertsInterfaceBadICMPChecksum,
  MockUpdateAlertsInterfacePossibleSplitRouting,
  MockUpdateAlertsInterfaceDataBeforeEstablished
];
