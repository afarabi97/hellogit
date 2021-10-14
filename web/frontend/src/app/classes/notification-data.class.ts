import { NotificationDataInterface, StatusInterface } from '../interfaces';
import { StatusClass } from './status.class';

/**
 * Class defines the notification data
 *
 * @export
 * @class NotificationDataClass
 * @implements {NotificationDataInterface}
 */
export class NotificationDataClass implements NotificationDataInterface {
  [ key: string ]: StatusClass;

  /**
   * Creates an instance of NotificationDataClass.
   *
   * @param {NotificationDataInterface} notification_data_interface
   * @memberof NotificationDataClass
   */
  constructor(notification_data_interface: NotificationDataInterface) {
    const interface_keys: string[] = Object.keys(notification_data_interface);

    interface_keys.forEach((k: string) => {
      const status_interface: StatusInterface = notification_data_interface[k];

      this[k] = new StatusClass(status_interface);
    });
  }
}
