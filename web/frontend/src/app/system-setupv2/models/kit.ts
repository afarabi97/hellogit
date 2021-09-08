export interface Job {
  _id: string;
  pending: boolean;
  complete: boolean;
  inprogress: boolean;
  error: boolean;
  message: string;
  name: string;
  job_id: string;
  node_id: string;
  description: string;
}

export interface Node {
  _id: string;
  hostname: string;
  node_type: string;
  mac_address: string;
  data_drives: string[];
  boot_drives: string[];
  raid_drives: string[];
  pxe_type: string;
  os_raid: boolean;
  os_raid_root_size: number;
  deployment_type: string;
  jobs: Job[];
  isDeployed: boolean;
  isRemoving: boolean;
  vpn_status: boolean;
}

export interface MIP {
  _id: string;
  hostname: string;
  ip_address: string;
  mac_address: string;
  pxe_type: boolean;
  jobs: Job[];
}

export interface Settings {
  _id: string;
  controller_interface: string;
  kubernetes_services_cidr;
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

export interface GeneralSettings {
  _id: string;
  controller_interface: string;
  netmask: string;
  gateway: string;
  domain: string;
  dhcp_range: string;
  job_id: string;
  job_completed: boolean;
}

export interface MipSettings {
  _id: string;
  password: string;
  user_password: string;
  luks_password: string;
  operator_type: string;
}

export interface KitStatus {
  esxi_settings_configured: boolean;
  kit_settings_configured: boolean;
  general_settings_configured: boolean;
  control_plane_deployed: boolean;
  base_kit_deployed: boolean;
  ready_to_deploy: boolean;
  jobs_running: boolean;
  deploy_kit_running: boolean;
}

export interface VmwareData{
  portgroups: string[];
  datacenters: string[];
  datastores: string[];
  folders: string[];
  clusters: string[];
}

export interface RetryJob{
  job_id: string;
  redis_key: string;
}
