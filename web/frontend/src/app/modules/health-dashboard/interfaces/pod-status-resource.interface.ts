/**
 * Interface defines the Pod Status Resource
 *
 * @export
 * @interface PodStatusResourceInterface
 */
export interface PodStatusResourceInterface {
  name: string;
  resources: {
    limits: Object;
    requests: Object;
  };
}
