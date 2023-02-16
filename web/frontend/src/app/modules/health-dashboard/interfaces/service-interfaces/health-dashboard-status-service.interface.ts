import { Observable } from 'rxjs';

import { KeyValueClass, KitTokenClass } from '../../../../classes';

/**
 * Interface defines Health Dashboard Status Service
 *
 * @export
 * @interface HealthDashboardStatusServiceInterface
 */
export interface HealthDashboardStatusServiceInterface {
  get_health_dashboard_status(): Observable<KitTokenClass[]>;
  get_remote_health_dashboard_status(): Observable<KitTokenClass[]>;
  get_health_dashboard_status_kibana_info_remote(ip_address: string): Observable<KeyValueClass[]>;
}
