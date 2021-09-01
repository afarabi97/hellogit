import { HealthDashboardStatusInterface } from '../interfaces/health-dashboard-status.interface'

export class HealthDashboardStatusClass implements HealthDashboardStatusInterface {
  elasticsearch_status: string;
  kibana_status: string;
  ipaddress?: string;
  token?: string;
  kit_token_id?: string;
  hostname?: string;


  constructor(dashboard_status: HealthDashboardStatusClass) {
    this.ipaddress = dashboard_status.ipaddress
    this.kibana_status = dashboard_status.kibana_status
    this.elasticsearch_status = dashboard_status.elasticsearch_status
    this.token = dashboard_status.token
    this.kit_token_id = dashboard_status.kit_token_id
    this.hostname = dashboard_status.hostname
  }
}
