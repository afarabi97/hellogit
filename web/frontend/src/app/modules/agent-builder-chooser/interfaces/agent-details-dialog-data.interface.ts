import { AgentInstallerConfigurationClass, AppConfigClass } from '../classes';

/**
 * Interface defines the Agent Details Dialog Data
 *
 * @export
 * @interface AgentDetailsDialogDataInterface
 */
export interface AgentDetailsDialogDataInterface {
  app_configs: AppConfigClass[];
  agent_installer_configuration: AgentInstallerConfigurationClass;
}
