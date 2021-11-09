import { ObjectUtilitiesClass } from '../../../classes';
import { AgentInstallerConfigurationInterface } from '../interfaces';
import { CustomPackageClass } from './custom-package.class';

/**
 * Class defines the Agent Installer Configuration
 *
 * @export
 * @class AgentInstallerConfigurationClass
 * @implements {AgentInstallerConfigurationInterface}
 */
export class AgentInstallerConfigurationClass implements AgentInstallerConfigurationInterface {
  _id: string;
  config_name: string;  //Name of this configuration
  install_endgame: boolean;
  endgame_sensor_id: string;  //ID of Endgame agent installer to download from Endgame server
  endgame_sensor_name: string;
  endgame_server_ip: string;
  endgame_port: string;
  endgame_user_name: string;
  endgame_password: string;
  customPackages?: CustomPackageClass;

  /**
   * Creates an instance of AgentInstallerConfigurationClass.
   *
   * @param {AgentInstallerConfigurationInterface} agent_installer_configuration_interface
   * @memberof AgentInstallerConfigurationClass
   */
  constructor(agent_installer_configuration_interface: AgentInstallerConfigurationInterface){
    this._id = agent_installer_configuration_interface._id;
    this.config_name = agent_installer_configuration_interface.config_name;
    this.install_endgame = agent_installer_configuration_interface.install_endgame;
    this.endgame_sensor_id = agent_installer_configuration_interface.endgame_sensor_id;
    this.endgame_sensor_name = agent_installer_configuration_interface.endgame_sensor_name;
    this.endgame_server_ip = agent_installer_configuration_interface.endgame_server_ip;
    this.endgame_port = agent_installer_configuration_interface.endgame_port;
    this.endgame_user_name = agent_installer_configuration_interface.endgame_user_name;
    this.endgame_password = agent_installer_configuration_interface.endgame_password;
    if (ObjectUtilitiesClass.notUndefNull(agent_installer_configuration_interface.customPackages)) {
      this.customPackages = new CustomPackageClass(agent_installer_configuration_interface.customPackages);
    }
  }
}
