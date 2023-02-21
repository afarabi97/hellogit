import { Observable } from 'rxjs';

import { GenericJobAndKeyClass } from '../../../../classes';
import { JobLogClass } from '../../classes';

/**
 * Interface defines the Job Service
 *
 * @export
 * @interface JobServiceInterface
 */
export interface JobServiceInterface {
  job_logs(job_id: string): Observable<JobLogClass[]>;
  job_delete(job_id: string): Observable<GenericJobAndKeyClass>;
}
