import { Observable } from 'rxjs';
import { SuccessMessageClass } from '../../../../classes';

import { IndexManagementOptionInterface } from '../index-management-option.interface';

/**
 * Interface defines the index management service
 *
 * @export
 * @interface IndexManagementServiceInterface
 */
export interface IndexManagementServiceInterface {
    index_management(index_management_option: IndexManagementOptionInterface): Observable<SuccessMessageClass>;
    get_closed_indices(): Observable<string[]>;
    minio_check(): Observable<SuccessMessageClass>;
    get_all_indices(): Observable<string[]>;
}
