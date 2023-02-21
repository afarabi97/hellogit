import { DescribePodNodeInterface } from '../interfaces';

/**
 * Class defines the Describe Pod Node
 *
 * @export
 * @class DescribePodNodeClass
 * @implements {DescribePodNodeInterface}
 */
export class DescribePodNodeClass implements DescribePodNodeInterface {
  stdout: string;
  stderr: string;

  /**
   * Creates an instance of DescribePodNodeClass.
   *
   * @param {DescribePodNodeInterface} describe_pod_node_interface
   * @memberof DescribePodNodeClass
   */
  constructor(describe_pod_node_interface: DescribePodNodeInterface) {
    this.stderr = describe_pod_node_interface.stderr;
    this.stdout = describe_pod_node_interface.stdout;
  }
}
