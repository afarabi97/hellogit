import { Observable } from 'rxjs';

import { BackgroundJobClass, GenericJobAndKeyClass } from '../../classes';

/**
 * Interface defines the Global Job Service
 *
 * @export
 * @interface GlobalJobServiceInterface
 */
export interface GlobalJobServiceInterface {
  job_get(job_id: string): Observable<BackgroundJobClass>;
  job_retry(job_id: string): Observable<GenericJobAndKeyClass>;
}
