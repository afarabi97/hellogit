import { Observable } from 'rxjs';

import { IndexManagementOptionInterface } from '../index-management-option.interface';

/**
 * Interface defines the index management service
 *
 * @export
 * @interface IndexManagementServiceInterface
 */
export interface IndexManagementServiceInterface {
    index_management(index_management_option: IndexManagementOptionInterface): Observable<string>;
    get_closed_indices(): Observable<string[]>;
    get_opened_indices(): Observable<string[]>;
}
