import { NotificationDataInterface } from './notification-data.interface';

/**
 * Interface defines the notification
 *
 * @export
 * @interface NotificationInterface
 */
export interface NotificationInterface {
  _id?: string;
  role: string;
  message: string;
  status: string;
  exception: string;
  timestamp?: Date;
  displayTime?: string;
  action?: string;
  application: string;
  data?: NotificationDataInterface;
}
