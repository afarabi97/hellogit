import { NotificationStatusEnum } from '../enums';
import { NotificationInterface } from '../interfaces';

/**
 * Class defines the notification
 *
 * @export
 * @class NotificationClass
 * @implements {NotificationInterface}
 */
export class NotificationClass implements NotificationInterface {
  _id: string;
  timestamp: string;
  role: string;
  message: string;
  status: NotificationStatusEnum;
  exception: string;
  action?: string;
  application?: string;

  /**
   * Creates an instance of NotificationClass.
   *
   * @param {NotificationInterface} notificationInterface
   * @memberof NotificationClass
   */
  constructor(notificationInterface: NotificationInterface) {
    this._id = notificationInterface._id;
    this.timestamp = notificationInterface.timestamp;
    this.role = notificationInterface.role;
    this.message = notificationInterface.message;
    this.status = NotificationStatusEnum[notificationInterface.status];
    this.exception = notificationInterface.exception;
    this.action = notificationInterface.action;
    this.application = notificationInterface.application;
  }
}
