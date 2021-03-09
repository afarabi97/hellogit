import { Observable } from 'rxjs';

import { CatalogStatusClass } from '../../classes/catalog-status.class';
import { JobClass } from '../../classes/job.class';

/**
 * Interface defines the PolicyManagementService
 *
 * @export
 * @interface PolicyManagementServiceInterface
 */
export interface PolicyManagementServiceInterface {
  check_catalog_status(application: string): Observable<CatalogStatusClass[]>;
  get_jobs(): Observable<JobClass[]>;
}
