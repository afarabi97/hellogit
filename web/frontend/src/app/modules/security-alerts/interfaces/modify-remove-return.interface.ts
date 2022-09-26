/**
 * Interface defines the Modify Remove Return
 *
 * @export
 * @interface ModifyRemoveReturnInterface
 */
export interface ModifyRemoveReturnInterface {
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
}
