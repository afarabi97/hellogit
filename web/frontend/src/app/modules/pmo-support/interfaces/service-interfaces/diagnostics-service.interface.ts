import { HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GenericJobAndKeyClass } from '../../../../classes';

/**
 * Interface defines the Diagnostics Serviced
 *
 * @export
 * @interface DiagnosticsServiceInterface
 */
export interface DiagnosticsServiceInterface {
  diagnostics(): Observable<GenericJobAndKeyClass>;
  download_diagnostics(job_id: string): Observable<HttpEvent<Blob>>;
}
