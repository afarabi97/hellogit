import { AgentInterface } from '../../src/app/modules/agent-builder-chooser/interfaces';
import { MockAgentInstallerConfigurationInterface1 } from './agent-installer-configuration.interface';
import { MockIPTargetListInterface1 } from './ip-target-list.interface';
import { MockWindowsCredentialsInterface } from './windows-credentials.interface';

export const MockAgentInterface: AgentInterface = {
  installer_config: MockAgentInstallerConfigurationInterface1,
  target_config: MockIPTargetListInterface1,
  windows_domain_creds: MockWindowsCredentialsInterface
};
