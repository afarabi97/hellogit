import { ModifyRemoveReturnInterface } from '../../src/app/modules/security-alerts/interfaces';

export const MockModifyRemoveReturnInterface: ModifyRemoveReturnInterface = {
  batches: 1,
  deleted: 0,
  failures: [],
  noops: 0,
  requests_per_second: -1,
  retries: {bulk: 0, search: 0},
  throttled_millis: 0,
  throttled_until_millis: 0,
  timed_out: false,
  took: 311,
  total: 1,
  updated: 1,
  version_conflicts: 0
};
