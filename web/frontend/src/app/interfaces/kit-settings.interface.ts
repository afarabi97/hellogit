/**
 * Interface defines the Kit Settings
 *
 * @export
 * @interface KitSettingsInterface
 */
export interface KitSettingsInterface {
  _id: string;
  kubernetes_services_cidr: string;
  password: string;
  upstream_dns: string;
  upstream_ntp: string;
  job_id: string;
  job_completed: boolean;
  is_gip?: boolean;
  controller_interface?: string;
  netmask?: string;
  gateway?: string;
  domain?: string;
  dhcp_range?: string;
}
