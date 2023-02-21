import { Observable } from 'rxjs';

import { KeyValueClass } from '../../../../classes';
import { HealthDashboardStatusClass } from '../../classes';

/**
 * Interface defines Health Dashboard Status Service
 *
 * @export
 * @interface HealthDashboardStatusServiceInterface
 */
export interface HealthDashboardStatusServiceInterface {
  get_health_dashboard_status(): Observable<HealthDashboardStatusClass[]>;
  get_remote_health_dashboard_status(): Observable<HealthDashboardStatusClass[]>;
  get_health_dashboard_status_kibana_info_remote(ip_address: string): Observable<KeyValueClass[]>;
}
