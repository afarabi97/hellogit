import { WinlogbeatConfigurationInterface } from '../interfaces/winlogbeat-configuration.interface';

/**
 * Class defines the Winlogbeat Configuration
 *
 * @export
 * @class WinlogbeatConfigurationClass
 * @implements {WinlogbeatConfigurationInterface}
 */
export class WinlogbeatConfigurationClass implements WinlogbeatConfigurationInterface {
  username: string;
  password: string;
  windows_host: string;
  winrm_port: number;
  winrm_scheme: string;
  winrm_transport: string;

  /**
   * Creates an instance of WinlogbeatConfigurationClass.
   *
   * @param {WinlogbeatConfigurationInterface} winlogbeat_configuration_interface
   * @memberof WinlogbeatConfigurationClass
   */
  constructor(winlogbeat_configuration_interface: WinlogbeatConfigurationInterface) {
    this.username = winlogbeat_configuration_interface.username;
    this.password = winlogbeat_configuration_interface.password;
    this.windows_host = winlogbeat_configuration_interface.windows_host;
    this.winrm_port = winlogbeat_configuration_interface.winrm_port;
    this.winrm_scheme = winlogbeat_configuration_interface.winrm_scheme;
    this.winrm_transport = winlogbeat_configuration_interface.winrm_transport;
  }
}
