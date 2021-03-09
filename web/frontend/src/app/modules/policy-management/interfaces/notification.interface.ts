/**
 * Interface defines the NotificationInterface
 *
 * @export
 * @interface NotificationInterface
 */
export interface NotificationInterface {
  role: string;
  message_type: string;
  action: string;
  application: string;
  timestamp: string;
  exception: string;
  message: string;
  status: string;
}
