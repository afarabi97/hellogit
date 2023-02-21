/**
 * Interface definbes the General Settings
 *
 * @export
 * @interface GeneralSettingsInterface
 */
export interface GeneralSettingsInterface {
  _id: string;
  controller_interface: string;
  netmask: string;
  gateway: string;
  domain: string;
  job_id: string;
  job_completed: boolean;
  dhcp_range?: string;
}
