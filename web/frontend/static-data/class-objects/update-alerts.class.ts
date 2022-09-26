import { UpdateAlertsClass } from '../../src/app/modules/security-alerts/classes';
import {
  MockUpdateAlertsInterfaceCaptureLoss,
  MockUpdateAlertsInterfaceBadICMPChecksum,
  MockUpdateAlertsInterfacePossibleSplitRouting,
  MockUpdateAlertsInterfaceDataBeforeEstablished
} from '../interface-objects';

export const MockUpdateAlertsClassCaptureLoss: UpdateAlertsClass = new UpdateAlertsClass(MockUpdateAlertsInterfaceCaptureLoss);
export const MockUpdateAlertsClassBadICMPChecksum: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfaceBadICMPChecksum);
export const MockUpdateAlertsClassPossibleSplitRouting: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfacePossibleSplitRouting);
export const MockUpdateAlertsClassDataBeforeEstablished: UpdateAlertsClass =  new UpdateAlertsClass(MockUpdateAlertsInterfaceDataBeforeEstablished);
export const MockUpdateAlertsClassArray: UpdateAlertsClass[] = [
  MockUpdateAlertsClassCaptureLoss,
  MockUpdateAlertsClassBadICMPChecksum,
  MockUpdateAlertsClassPossibleSplitRouting,
  MockUpdateAlertsClassDataBeforeEstablished
];
