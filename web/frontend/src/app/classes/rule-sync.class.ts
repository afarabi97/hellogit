import { RuleSyncInterface } from "../interfaces";

/**
 * Class defines the rule sync
 *
 * @export
 * @class RuleSyncClass
 */
export class RuleSyncClass implements RuleSyncInterface {
  job_id: string;
  redis_key: string;

  /**
   * Creates an instance of RuleSyncClass.
   *
   * @param {RuleSyncInterface} rule_sync_interface
   * @memberof RuleSyncClass
   */
  constructor(rule_sync_interface: RuleSyncInterface) {
    this.job_id = rule_sync_interface.job_id;
    this.redis_key = rule_sync_interface.redis_key;
  }
}
