import { StatusConditionInterface } from '../interfaces';

/**
 * Class defines the Status Condition
 *
 * @export
 * @class StatusConditionClass
 * @implements {StatusConditionInterface}
 */
export class StatusConditionClass implements StatusConditionInterface {
  last_transition_time: string;
  status: string;
  type: string;

  /**
   * Creates an instance of StatusConditionClass.
   *
   * @param {StatusConditionInterface} status_condition_interface
   * @memberof StatusConditionClass
   */
  constructor(status_condition_interface: StatusConditionInterface) {
    this.last_transition_time = status_condition_interface.last_transition_time;
    this.status = status_condition_interface.status;
    this.type = status_condition_interface.type;
  }
}
