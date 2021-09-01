import { Observable } from 'rxjs';
import { HealthDashboardStatusClass } from '../../classes/health-dashboard-status.class';

export interface HealthDashboardStatusServiceInterface {
  get_health_dashboard_status(): Observable<Array<HealthDashboardStatusClass>>;
  get_remote_health_dashboard_status(): Observable<Array<HealthDashboardStatusClass>>;
  get_health_dashboard_kibana_info(ipaddress: string): Observable<Object>;
}
