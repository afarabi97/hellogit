

/**
 * interface for Notification
 *
 * @export
 * @class Notification
 */
export class Notification {
  role: string;
  message: string;
  status: string;
  exception: string;
  timestamp?: Date;
  displayTime?: Date;
  action?: String;
  application: string;
  _id?: string;
}

