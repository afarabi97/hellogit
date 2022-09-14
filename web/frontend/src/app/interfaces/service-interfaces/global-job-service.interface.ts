import { Observable } from 'rxjs';

import { GenericJobAndKeyClass } from '../../classes';

/**
 * Interface defines the Global Job Service
 *
 * @export
 * @interface GlobalJobServiceInterface
 */
export interface GlobalJobServiceInterface {
  job_retry(job_id: string): Observable<GenericJobAndKeyClass>;
}
