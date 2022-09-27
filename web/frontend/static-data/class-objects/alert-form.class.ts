import { AlertFormClass } from '../../src/app/modules/security-alerts/classes';
import {
  MockAlertFormInterfaceDays,
  MockAlertFormInterfaceMinutesGreater60,
  MockAlertFormInterfaceMinutesLess60
} from '../interface-objects';

export const MockAlertFormClassDays: AlertFormClass = new AlertFormClass(MockAlertFormInterfaceDays);
export const MockAlertFormClassMinutesLess60: AlertFormClass = new AlertFormClass(MockAlertFormInterfaceMinutesLess60);
export const MockAlertFormClassMinutesGreater60: AlertFormClass = new AlertFormClass(MockAlertFormInterfaceMinutesGreater60);
