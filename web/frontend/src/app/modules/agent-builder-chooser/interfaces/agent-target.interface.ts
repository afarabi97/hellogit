import { HostClass } from '../classes';
import { AgentInterface } from './agent.interface';

/**
 * Interface defines the agent target
 *
 * @export
 * @interface AgentTargetInterface
 * @extends {AgentInterface}
 */
export interface AgentTargetInterface extends AgentInterface {
  target: HostClass;
}
