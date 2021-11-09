import { AgentInstallerConfigurationClass } from '../../src/app/modules/agent-builder-chooser/classes';
import {
    MockAgentInstallerConfigurationInterface1,
    MockAgentInstallerConfigurationInterface2,
    MockAgentInstallerConfigurationInterface3,
    MockAgentInstallerConfigurationInterface4
} from '../interface-objects';

export const MockAgentInstallerConfigurationClass1: AgentInstallerConfigurationClass = new AgentInstallerConfigurationClass(MockAgentInstallerConfigurationInterface1);
export const MockAgentInstallerConfigurationClass2: AgentInstallerConfigurationClass = new AgentInstallerConfigurationClass(MockAgentInstallerConfigurationInterface2);
export const MockAgentInstallerConfigurationClass3: AgentInstallerConfigurationClass = new AgentInstallerConfigurationClass(MockAgentInstallerConfigurationInterface3);
export const MockAgentInstallerConfigurationClass4: AgentInstallerConfigurationClass = new AgentInstallerConfigurationClass(MockAgentInstallerConfigurationInterface4);
export const MockAgentInstallerConfigurationClassesArray: AgentInstallerConfigurationClass[] = [
  MockAgentInstallerConfigurationClass1,
  MockAgentInstallerConfigurationClass2,
  MockAgentInstallerConfigurationClass3,
  MockAgentInstallerConfigurationClass4
];
