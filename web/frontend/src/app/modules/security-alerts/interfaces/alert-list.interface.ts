import { AlertListHitsInterface } from './alert-list-hits.interface';

/**
 * Interface defines the Alert List
 *
 * @export
 * @interface AlertListInterface
 */
export interface AlertListInterface {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: AlertListHitsInterface;
}
