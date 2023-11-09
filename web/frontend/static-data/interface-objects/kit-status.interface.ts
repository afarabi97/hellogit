import { KitStatusInterface } from '../../src/app/interfaces';

export const MockKitStatusInterface: KitStatusInterface = {
  control_plane_deployed: true,
  general_settings_configured: true,
  kit_settings_configured: true,
  esxi_settings_configured: true,
  ready_to_deploy: true,
  base_kit_deployed: true,
  jobs_running: false,
  deploy_kit_running: false
};
export const MockKitStatusInterfaceAlt: KitStatusInterface = {
  control_plane_deployed: true,
  general_settings_configured: false,
  kit_settings_configured: true,
  esxi_settings_configured: false,
  ready_to_deploy: true,
  base_kit_deployed: true,
  jobs_running: false,
  deploy_kit_running: false
};
