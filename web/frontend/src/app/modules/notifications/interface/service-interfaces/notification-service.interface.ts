import { Observable } from 'rxjs';
import { NotificationClass } from '../../../../classes';

/**
 * Interface dfines the notification service
 *
 * @export
 * @interface NotificationServiceInterface
 */
export interface NotificationServiceInterface {
  get_notifications(offset: number, role: string): Observable<NotificationClass[]>;
  delete_notification(id: any): Observable<void>;
  delete_all_notifications(): Observable<void>;
}
