import { NotificationInterface } from '../interfaces';
import { NotificationDataClass } from './notification-data.class';
import { ObjectUtilitiesClass } from './object-utilities.class';

/**
 * Class defines the notification
 *
 * @export
 * @class NotificationClass
 * @implements {NotificationInterface}
 */
export class NotificationClass implements NotificationInterface {
  _id?: string;
  role: string;
  message: string;
  status: string;
  exception: string;
  timestamp?: Date;
  displayTime?: string;
  action?: string;
  application: string;
  data?: NotificationDataClass;

  /**
   * Creates an instance of NotificationClass.
   *
   * @param {NotificationInterface} notification_interface
   * @memberof NotificationClass
   */
  constructor(notification_interface: NotificationInterface) {
    this._id = notification_interface._id;
    this.role = notification_interface.role;
    this.message = notification_interface.message;
    this.status = notification_interface.status;
    this.exception = notification_interface.exception;
    this.timestamp = notification_interface.timestamp;
    this.displayTime = notification_interface.displayTime;
    this.action = notification_interface.action;
    this.application = notification_interface.application;
    if (ObjectUtilitiesClass.notUndefNull(notification_interface.data)) {
      this.data = new NotificationDataClass(notification_interface.data);
    }
  }
}
