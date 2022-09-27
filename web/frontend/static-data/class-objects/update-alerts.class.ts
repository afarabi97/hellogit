import { UpdateAlertsClass } from '../../src/app/modules/security-alerts/classes';
import {
  MockUpdateAlertsInterfaceBadICMPChecksum,
  MockUpdateAlertsInterfaceCaptureLoss,
  MockUpdateAlertsInterfaceDataBeforeEstablished,
  MockUpdateAlertsInterfaceDataBeforeEstablishedDays,
  MockUpdateAlertsInterfaceDataBeforeEstablishedMinutesGreater60,
  MockUpdateAlertsInterfaceDataBeforeEstablishedMinutesLess60,
  MockUpdateAlertsInterfacePossibleSplitRouting
} from '../interface-objects';

export const MockUpdateAlertsClassCaptureLoss: UpdateAlertsClass = new UpdateAlertsClass(MockUpdateAlertsInterfaceCaptureLoss);
export const MockUpdateAlertsClassBadICMPChecksum: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfaceBadICMPChecksum);
export const MockUpdateAlertsClassPossibleSplitRouting: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfacePossibleSplitRouting);
export const MockUpdateAlertsClassDataBeforeEstablished: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfaceDataBeforeEstablished);
export const MockUpdateAlertsClassDataBeforeEstablishedDays: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfaceDataBeforeEstablishedDays);
export const MockUpdateAlertsClassDataBeforeEstablishedMinutesLess60: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfaceDataBeforeEstablishedMinutesLess60);
export const MockUpdateAlertsClassDataBeforeEstablishedMinutesGreater60: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfaceDataBeforeEstablishedMinutesGreater60);
export const MockUpdateAlertsClassArray: UpdateAlertsClass[] = [
  MockUpdateAlertsClassCaptureLoss,
  MockUpdateAlertsClassBadICMPChecksum,
  MockUpdateAlertsClassPossibleSplitRouting,
  MockUpdateAlertsClassDataBeforeEstablished
];
