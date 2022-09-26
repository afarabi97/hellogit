import { ModifyRemoveReturnInterface } from '../interfaces';

/**
 * Class defines the Modify Remove Return
 *
 * @export
 * @class ModifyRemoveReturnClass
 * @implements {ModifyRemoveReturnInterface}
 */
export class ModifyRemoveReturnClass implements ModifyRemoveReturnInterface {
  batches: number;
  deleted: number;
  failures: string[];
  noops: number;
  requests_per_second: number;
  retries: {
    bulk: number;
    search: number;
  };
  throttled_millis: number;
  throttled_until_millis: number;
  timed_out: boolean;
  took: number;
  total: number;
  updated: number;
  version_conflicts: number;

  /**
   * Creates an instance of ModifyRemoveReturnClass.
   *
   * @param {ModifyRemoveReturnInterface} modify_remove_return_interface
   * @memberof ModifyRemoveReturnClass
   */
  constructor(modify_remove_return_interface: ModifyRemoveReturnInterface) {
    this.batches = modify_remove_return_interface.batches;
    this.deleted = modify_remove_return_interface.deleted;
    this.failures = modify_remove_return_interface.failures;
    this.noops = modify_remove_return_interface.noops;
    this.requests_per_second = modify_remove_return_interface.requests_per_second;
    this.retries = modify_remove_return_interface.retries;
    this.throttled_millis = modify_remove_return_interface.throttled_millis;
    this.throttled_until_millis = modify_remove_return_interface.throttled_until_millis;
    this.timed_out = modify_remove_return_interface.timed_out;
    this.took = modify_remove_return_interface.took;
    this.total = modify_remove_return_interface.total;
    this.updated = modify_remove_return_interface.updated;
    this.version_conflicts = modify_remove_return_interface.version_conflicts;
  }
}
