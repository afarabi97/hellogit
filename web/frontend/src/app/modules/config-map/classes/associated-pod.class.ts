import { AssociatedPodInterface } from '../interfaces/associated-pod.interface';

/**
 * Class defines the associated pod
 *
 * @export
 * @class AssociatedPodClass
 * @implements {AssociatedPodInterface}
 */
export class AssociatedPodClass implements AssociatedPodInterface {
  podName: string;
  namespace: string;

  /**
   * Creates an instance of AssociatedPodClass.
   *
   * @param {AssociatedPodInterface} associated_pod_interface
   * @memberof AssociatedPodClass
   */
  constructor(associated_pod_interface: AssociatedPodInterface) {
    this.podName = associated_pod_interface.podName;
    this.namespace = associated_pod_interface.namespace;
  }
}
