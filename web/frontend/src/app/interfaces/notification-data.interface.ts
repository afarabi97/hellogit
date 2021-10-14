import { StatusInterface } from './status.interface';

/**
 * Interface defines the notification data
 *
 * @export
 * @interface NotificationDataInterface
 */
export interface NotificationDataInterface {
  [ key: string ]: StatusInterface;
}
