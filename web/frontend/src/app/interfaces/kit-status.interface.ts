/**
 * Interface defines the Kit Status
 *
 * @export
 * @interface KitStatusInterface
 */
export interface KitStatusInterface {
  esxi_settings_configured: boolean;
  kit_settings_configured: boolean;
  general_settings_configured: boolean;
  control_plane_deployed: boolean;
  base_kit_deployed: boolean;
  ready_to_deploy: boolean;
  jobs_running: boolean;
  deploy_kit_running: boolean;
}
