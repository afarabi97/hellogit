import { KitStatusInterface } from '../interfaces';

/**
 * Class defines the Kit Status
 *
 * @export
 * @class KitStatusClass
 * @implements {KitStatusInterface}
 */
export class KitStatusClass implements KitStatusInterface {
  esxi_settings_configured: boolean;
  kit_settings_configured: boolean;
  general_settings_configured: boolean;
  control_plane_deployed: boolean;
  base_kit_deployed: boolean;
  ready_to_deploy: boolean;
  jobs_running: boolean;
  deploy_kit_running: boolean;

  /**
   * Creates an instance of KitStatusClass.
   *
   * @param {KitStatusInterface} kit_status_interface
   * @memberof KitStatusClass
   */
  constructor(kit_status_interface: KitStatusInterface) {
    this.esxi_settings_configured = kit_status_interface.esxi_settings_configured;
    this.kit_settings_configured = kit_status_interface.kit_settings_configured;
    this.general_settings_configured = kit_status_interface.general_settings_configured;
    this.control_plane_deployed = kit_status_interface.control_plane_deployed;
    this.base_kit_deployed = kit_status_interface.base_kit_deployed;
    this.ready_to_deploy = kit_status_interface.ready_to_deploy;
    this.jobs_running = kit_status_interface.jobs_running;
    this.deploy_kit_running = kit_status_interface.deploy_kit_running;
  }
}
