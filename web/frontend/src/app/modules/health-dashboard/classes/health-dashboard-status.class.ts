import { HealthDashboardStatusInterface } from '../interfaces/health-dashboard-status.interface';

/**
 * Class defines the Health Dashboard Status
 *
 * @export
 * @class HealthDashboardStatusClass
 * @implements {HealthDashboardStatusInterface}
 */
export class HealthDashboardStatusClass implements HealthDashboardStatusInterface {
  elasticsearch_status: string;
  kibana_status: string;
  ipaddress?: string;
  token?: string;
  kit_token_id?: string;
  hostname?: string;


  /**
   * Creates an instance of HealthDashboardStatusClass.
   *
   * @param {HealthDashboardStatusInterface} health_dashboard_status_interface
   * @memberof HealthDashboardStatusClass
   */
  constructor(health_dashboard_status_interface: HealthDashboardStatusInterface) {
    this.ipaddress = health_dashboard_status_interface.ipaddress;
    this.kibana_status = health_dashboard_status_interface.kibana_status;
    this.elasticsearch_status = health_dashboard_status_interface.elasticsearch_status;
    this.token = health_dashboard_status_interface.token;
    this.kit_token_id = health_dashboard_status_interface.kit_token_id;
    this.hostname = health_dashboard_status_interface.hostname;
  }
}
