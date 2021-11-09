import { CustomPackageInterface } from './custom-package.interface';

/**
 * Interface defines the Agent Installer Configuration
 *
 * @export
 * @interface AgentInstallerConfigurationInterface
 */
export interface AgentInstallerConfigurationInterface {
  _id: string;
  config_name: string;  //Name of this configuration
  install_endgame: boolean;
  endgame_sensor_id: string;  //ID of Endgame agent installer to download from Endgame server
  endgame_sensor_name: string;
  endgame_server_ip: string;
  endgame_port: string;
  endgame_user_name: string;
  endgame_password: string;
  customPackages?: CustomPackageInterface;
}
