import { NotificationClass } from '../../../classes';

/**
 * Interface defines the notification button
 *
 * @export
 * @interface NotificationButtonInterface
 */
export interface NotificationButtonInterface {
  name: string;
  selected: boolean;
  title: string;
  role: string;
  notifications: NotificationClass[];
  icon: string;
}
