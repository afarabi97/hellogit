import { PodStatusResourceInterface } from './pod-status-resource.interface';
import { PodStatusStatusInterface } from './pod-status-status.interface';

/**
 * Interface defines the Pod Status
 *
 * @export
 * @interface PodStatusInterface
 */
export interface PodStatusInterface  {
  namespace: string;
  name: string;
  node_name: string;
  status_brief: string;
  restart_count: number;
  states: string[];
  resources: PodStatusResourceInterface[];
  status: PodStatusStatusInterface;
}
