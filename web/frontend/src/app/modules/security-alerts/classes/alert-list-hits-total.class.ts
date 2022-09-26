import { AlertListHitsTotalInterface } from '../interfaces';

/**
 * Class defines the Alert List Hits Total
 *
 * @export
 * @class AlertListHitsTotalClass
 * @implements {AlertListHitsTotalInterface}
 */
export class AlertListHitsTotalClass implements AlertListHitsTotalInterface {
  value: number;
  relation: string;

  /**
   * Creates an instance of AlertListHitsTotalClass.
   *
   * @param {AlertListHitsTotalInterface} alert_list_hits_total_interface
   * @memberof AlertListHitsTotalClass
   */
  constructor(alert_list_hits_total_interface: AlertListHitsTotalInterface) {
    this.value = alert_list_hits_total_interface.value;
    this.relation = alert_list_hits_total_interface.relation;
  }
}
