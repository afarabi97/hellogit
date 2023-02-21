import { StatusContainerStatusInterface } from '../interfaces';

/**
 * Class defines the Status Container Status
 *
 * @export
 * @class StatusContainerStatusClass
 * @implements {StatusContainerStatusInterface}
 */
export class StatusContainerStatusClass implements StatusContainerStatusInterface {
  container_id: string;
  image: string;
  image_id: string;
  last_state: Object;
  name: string;
  ready: boolean;
  restart_count: number;
  started: boolean;
  state: Object;

  /**
   * Creates an instance of StatusContainerStatusClass.
   *
   * @param {StatusContainerStatusInterface} status_container_status_interface
   * @memberof StatusContainerStatusClass
   */
  constructor(status_container_status_interface: StatusContainerStatusInterface) {
    this.container_id = status_container_status_interface.container_id;
    this.image = status_container_status_interface.image;
    this.image_id = status_container_status_interface.image_id;
    this.last_state = status_container_status_interface.last_state;
    this.name = status_container_status_interface.name;
    this.ready = status_container_status_interface.ready;
    this.restart_count = status_container_status_interface.restart_count;
    this.started = status_container_status_interface.started;
    this.state = status_container_status_interface.state;
  }
}
