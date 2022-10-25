import { AlertListHitsInterface } from '../interfaces';

/**
 * Class defines the Alert List Hits
 *
 * @export
 * @class AlertListHitsClass
 * @implements {AlertListHitsInterface}
 */
export class AlertListHitsClass implements AlertListHitsInterface {
  total: {
    value: number;
    relation: string;
  };
  max_score: number;
  hits: Object[];

  /**
   * Creates an instance of AlertListHitsClass.
   *
   * @param {AlertListHitsInterface} alert_list_hits_interface
   * @memberof AlertListHitsClass
   */
  constructor(alert_list_hits_interface: AlertListHitsInterface) {
    this.total = alert_list_hits_interface.total;
    this.max_score = alert_list_hits_interface.max_score;
    this.hits = alert_list_hits_interface.hits;
  }
}
