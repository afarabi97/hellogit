import { AppConfigClass } from '../classes';
import { AppNameAppConfigPairInterface } from './app-name-app-config-pair.interface';

/**
 * Interface defines the Agent Installer Dialog Data
 *
 * @export
 * @interface AgentInstallerDialogDataInterface
 */
export interface AgentInstallerDialogDataInterface {
  app_configs: AppConfigClass[];
  app_names: string[];
  app_name_app_config_pair: AppNameAppConfigPairInterface;
}
