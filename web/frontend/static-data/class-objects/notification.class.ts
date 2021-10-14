import { NotificationClass } from '../../src/app/classes';
import {
  MockNotificationInterface_NotInArray,
  MockNotificationInterface_ZeekDeployed,
  MockNotificationInterface_ZeekInstallComplete,
  MockNotificationInterface_ZeekPendingInstall
} from '../interface-objects';

export const MockNotificationClass_NotInArray: NotificationClass = new NotificationClass(MockNotificationInterface_NotInArray);
export const MockNotificationClass_ZeekPendingInstall: NotificationClass = new NotificationClass(MockNotificationInterface_ZeekPendingInstall);
export const MockNotificationClass_ZeekDeployed: NotificationClass = new NotificationClass(MockNotificationInterface_ZeekDeployed);
export const MockNotificationClass_ZeekInstallComplete: NotificationClass = new NotificationClass(MockNotificationInterface_ZeekInstallComplete);
export const MockNotificationClassArray: NotificationClass[] = [
  MockNotificationClass_ZeekPendingInstall,
  MockNotificationClass_ZeekDeployed,
  MockNotificationClass_ZeekInstallComplete
];
