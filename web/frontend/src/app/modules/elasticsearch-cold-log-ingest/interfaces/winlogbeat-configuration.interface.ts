/**
 * Interface defines the Winlogbeat Configuration
 *
 * @export
 * @interface WinlogbeatConfigurationInterface
 */
export interface WinlogbeatConfigurationInterface {
  username: string;
  password: string;
  windows_host: string;
  winrm_port: number;
  winrm_scheme: string;
  winrm_transport: string;
}
