/**
 * Interface defines the Kit Settings
 *
 * @export
 * @interface KitSettingsInterface
 */
export interface KitSettingsInterface {
  _id: string;
  controller_interface: string;
  kubernetes_services_cidr: string;
  password: string;
  netmask: string;
  gateway: string;
  domain: string;
  upstream_dns: string;
  upstream_ntp: string;
  dhcp_range: string;
  job_id: string;
  job_completed: boolean;
  is_gip?: boolean;
}
