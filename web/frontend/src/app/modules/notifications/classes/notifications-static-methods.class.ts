import { NotificationClass } from '../../../classes';
import { NotificationButtonInterface } from '../interface/notification-button.interface';

export class NotificationStaticMethodsClass {

  /**
   * Used for adding a notification to the notifications array within corresponding
   * notifications button
   *
   * @static
   * @param {NotificationClass} notification
   * @param {NotificationButtonInterface[]} notification_button_list
   * @param {boolean} [from_websocket=false]
   * @memberof NotificationStaticMethodsClass
   */
  static add_notification_to_button_list(notification: NotificationClass, notification_button_list: NotificationButtonInterface[], from_websocket: boolean = false): void {
    notification_button_list.forEach((nb: NotificationButtonInterface) => {
      this.set_notification_display_time(notification);
      if ((nb.role === notification.role) || (nb.role === 'all')) {
        if (from_websocket) {
          nb.notifications.unshift(notification);
        } else {
          nb.notifications.push(notification);
        }
      }
    });
  }

  /**
   * Creates a display time that is used to show how old the notification is
   *
   * @static
   * @param {NotificationClass} notification
   * @return {NotificationClass}
   * @memberof NotificationStaticMethodsClass
   */
  static set_notification_display_time(notification: NotificationClass): NotificationClass {
    const date: Date = new Date();
    const time_now: Date = new Date(date.toUTCString());
    const d1: Date = new Date(time_now.toISOString());
    const d2: Date = new Date(notification.timestamp + 'Z');
    const timeDifference: number = d1.getTime() - d2.getTime();
    const seconds: number = (timeDifference) / 1000;

    if (seconds < 60) {
      notification.displayTime = 'Now';
    } else if (seconds >= 60 && seconds < 3600) {
      notification.displayTime = Math.floor(seconds / 60) + ' minute(s) ago';
    } else if (seconds >= 3600 && seconds < 86400) {
      notification.displayTime = Math.floor(seconds / 3600) + ' hour(s) ago';
    } else if (seconds >= 86400 && seconds < 604800) {
      notification.displayTime = Math.floor(seconds / 86400) + ' day(s) ago';
    } else if (seconds >= 604800) {
      notification.displayTime = Math.floor(seconds / 604800) + ' week(s) ago';
    } else {
      notification.displayTime = '??';
    }

    return notification;
  }
}
