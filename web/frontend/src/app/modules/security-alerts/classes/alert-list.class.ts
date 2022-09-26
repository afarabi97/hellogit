import { AlertListInterface } from '../interfaces';
import { AlertListHitsClass } from './alert-list-hits.class';

/**
 * Class defines the Alert List
 *
 * @export
 * @class AlertListClass
 * @implements {AlertListInterface}
 */
export class AlertListClass implements AlertListInterface {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: AlertListHitsClass;

  /**
   * Creates an instance of AlertListClass.
   *
   * @param {AlertListInterface} alert_list_interface
   * @memberof AlertListClass
   */
  constructor(alert_list_interface: AlertListInterface) {
    this.took = alert_list_interface.took;
    this.timed_out = alert_list_interface.timed_out;
    this._shards = alert_list_interface._shards;
    this.hits = new AlertListHitsClass(alert_list_interface.hits);
  }
}
