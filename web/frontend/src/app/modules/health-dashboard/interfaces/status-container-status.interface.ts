/**
 * Interface defines the Status Container Status
 *
 * @export
 * @interface StatusContainerStatusInterface
 */
export interface StatusContainerStatusInterface {
  container_id: string;
  image: string;
  image_id: string;
  last_state: Object;
  name: string;
  ready: boolean;
  restart_count: number;
  started: boolean;
  state: Object;
}
