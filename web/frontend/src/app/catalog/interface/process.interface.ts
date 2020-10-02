import { NodeClass } from '../../classes';

/**
 * Interface defines the process
 *
 * @export
 * @interface ProcessInterface
 */
export interface ProcessInterface {
  process: string;
  name: string;
  children: NodeClass[];
}
