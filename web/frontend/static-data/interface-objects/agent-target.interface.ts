import { AgentTargetInterface } from '../../src/app/modules/agent-builder-chooser/interfaces/agent-target.interface';
import { MockAgentInterface } from './agent.interface';
import { MockHostInterface1 } from './host.interface';

export const MockAgentTargetInterface: AgentTargetInterface = {
  ...MockAgentInterface,
  target: MockHostInterface1
};
