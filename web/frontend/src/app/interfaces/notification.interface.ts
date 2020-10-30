import { NotificationStatusEnum } from '../enums';

/**
 * Interface defines the notification
 *
 * @export
 * @interface NotificationInterface
 */
export interface NotificationInterface {
  _id: string;
  timestamp: string;
  role: string;
  message: string;
  status: NotificationStatusEnum;
  exception: string;
  action?: string;
  application?: string;
}
