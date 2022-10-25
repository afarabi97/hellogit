import { UpdateAlertsClass } from '../../src/app/modules/security-alerts/classes';
import {
  MockAlertFormInterfaceDays,
  MockAlertFormInterfaceMinutesGreater60,
  MockAlertFormInterfaceMinutesLess60,
  MockPortalLinkFakeInterface,
  MockPortalLinkInterface,
  MockUpdateAlertsInterfaceBadICMPChecksum,
  MockUpdateAlertsInterfaceCaptureLoss,
  MockUpdateAlertsInterfaceDataBeforeEstablished,
  MockUpdateAlertsInterfaceDataBeforeEstablishedDays,
  MockUpdateAlertsInterfaceDataBeforeEstablishedMinutesGreater60,
  MockUpdateAlertsInterfaceDataBeforeEstablishedMinutesLess60,
  MockUpdateAlertsInterfacePossibleSplitRouting,
  MockUpdateAlertsInterfaceWithArkimeFields
} from '../interface-objects';

export const MockUpdateAlertsClassCaptureLoss: UpdateAlertsClass = new UpdateAlertsClass(MockUpdateAlertsInterfaceCaptureLoss);
MockUpdateAlertsClassCaptureLoss.form = MockAlertFormInterfaceDays;
MockUpdateAlertsClassCaptureLoss.links = [
  MockPortalLinkInterface,
  MockPortalLinkFakeInterface
];
export const MockUpdateAlertsClassBadICMPChecksum: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfaceBadICMPChecksum);
MockUpdateAlertsClassBadICMPChecksum.form = MockAlertFormInterfaceDays;
MockUpdateAlertsClassBadICMPChecksum.links = [
  MockPortalLinkInterface,
  MockPortalLinkFakeInterface
];
export const MockUpdateAlertsClassPossibleSplitRouting: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfacePossibleSplitRouting);
MockUpdateAlertsClassPossibleSplitRouting.form = MockAlertFormInterfaceDays;
MockUpdateAlertsClassPossibleSplitRouting.links = [
  MockPortalLinkInterface,
  MockPortalLinkFakeInterface
];
export const MockUpdateAlertsClassDataBeforeEstablished: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfaceDataBeforeEstablished);
MockUpdateAlertsClassDataBeforeEstablished.form = MockAlertFormInterfaceDays;
MockUpdateAlertsClassDataBeforeEstablished.links = [
  MockPortalLinkInterface,
  MockPortalLinkFakeInterface
];
export const MockUpdateAlertsClassDataBeforeEstablishedDays: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfaceDataBeforeEstablishedDays);
MockUpdateAlertsClassDataBeforeEstablishedDays.form = MockAlertFormInterfaceDays;
MockUpdateAlertsClassDataBeforeEstablishedDays.links = [
  MockPortalLinkInterface,
  MockPortalLinkFakeInterface
];
export const MockUpdateAlertsClassDataBeforeEstablishedMinutesLess60: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfaceDataBeforeEstablishedMinutesLess60);
MockUpdateAlertsClassDataBeforeEstablishedMinutesLess60.form = MockAlertFormInterfaceMinutesLess60;
MockUpdateAlertsClassDataBeforeEstablishedMinutesLess60.links = [
  MockPortalLinkInterface,
  MockPortalLinkFakeInterface
];
export const MockUpdateAlertsClassDataBeforeEstablishedMinutesGreater60: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfaceDataBeforeEstablishedMinutesGreater60);
MockUpdateAlertsClassDataBeforeEstablishedMinutesGreater60.form = MockAlertFormInterfaceMinutesGreater60;
MockUpdateAlertsClassDataBeforeEstablishedMinutesGreater60.links = [
  MockPortalLinkInterface,
  MockPortalLinkFakeInterface
];
export const MockUpdateAlertsClassWithArkimeFields: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfaceWithArkimeFields);
MockUpdateAlertsClassWithArkimeFields.form = MockAlertFormInterfaceMinutesGreater60;
MockUpdateAlertsClassWithArkimeFields.links = [
  MockPortalLinkInterface,
  MockPortalLinkFakeInterface
];
export const MockUpdateAlertsClassArray: UpdateAlertsClass[] = [
  MockUpdateAlertsClassCaptureLoss,
  MockUpdateAlertsClassBadICMPChecksum,
  MockUpdateAlertsClassPossibleSplitRouting,
  MockUpdateAlertsClassDataBeforeEstablished
];
