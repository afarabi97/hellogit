import { NotificationButtonInterface } from './notification-button.interface';

/**
 * Interface defines the Notification Dialog Data
 *
 * @export
 * @interface NotificationDialogDataInterface
 */
export interface NotificationDialogDataInterface {
  title: string;
  button_list: NotificationButtonInterface[];
}
