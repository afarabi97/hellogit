import { SelectedNodeInterface } from './selected-node.interface';

/**
 * Interface defines the Process From Form Group
 *
 * @export
 * @interface ProcessFromFormGroupInterface
 */
export interface ProcessFromFormGroupInterface {
  selectedProcess: string;
  selectedNodes: SelectedNodeInterface[];
  node_affinity: string;
}
