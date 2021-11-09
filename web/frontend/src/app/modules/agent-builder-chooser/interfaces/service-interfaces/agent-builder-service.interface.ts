import { Observable } from 'rxjs';

import { SuccessMessageClass } from '../../../../classes';
import { AgentInstallerConfigurationClass, AppConfigClass, HostClass, IPTargetListClass } from '../../classes';
import { AgentInstallerConfigurationInterface } from '../agent-installer-configuration.interface';
import { AgentTargetInterface } from '../agent-target.interface';
import { AgentInterface } from '../agent.interface';
import { HostInterface } from '../host.interface';

/**
 * Interface defines the agent builder service
 *
 * @export
 * @interface AgentBuilderServiceInterface
 */
export interface AgentBuilderServiceInterface {
  agent_generate(agent: AgentInterface): Observable<Blob>;
  agent_save_config(agent_installer_configuration: AgentInstallerConfigurationInterface): Observable<AgentInstallerConfigurationClass[]>;
  agent_delete_config(agent_configuration_id: string): Observable<AgentInstallerConfigurationClass[]>;
  agent_get_configs(): Observable<AgentInstallerConfigurationClass[]>;
  agent_get_ip_target_list(): Observable<IPTargetListClass[]>;
  agent_save_ip_target_list(ip_target_list: IPTargetListClass): Observable<IPTargetListClass[]>;
  agent_add_host_to_ip_target_list(target_config_id: string, host: HostInterface): Observable<IPTargetListClass>;
  agent_remove_host_from_ip_target_list(target_config_id: string, host: HostClass): Observable<SuccessMessageClass>;
  agent_delete_ip_target_list(ip_target_list_name: string): Observable<IPTargetListClass[]>;
  agents_install(agent: AgentInterface): Observable<SuccessMessageClass>;
  agents_uninstall(agent: AgentInterface): Observable<SuccessMessageClass>;
  agent_uninstall(agent_target: AgentTargetInterface): Observable<SuccessMessageClass>;
  agent_reinstall(agent_target: AgentTargetInterface): Observable<SuccessMessageClass>;
  get_app_configs(): Observable<AppConfigClass[]>;
}
