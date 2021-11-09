import { AgentInstallerConfigurationClass, IPTargetListClass, WindowsCredentialsClass } from '../classes';

/**
 * Interface defines Agent
 *
 * @export
 * @interface AgentInterface
 */
export interface AgentInterface {
  installer_config: AgentInstallerConfigurationClass;
  target_config: IPTargetListClass;
  windows_domain_creds: WindowsCredentialsClass;
}
