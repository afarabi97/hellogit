import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface defines api service
 *
 * @export
 * @interface ApiServiceInterface
 * @template T
 */
export interface ApiServiceInterface<T> {
  handleError(operation: string, result?: any): Observable<any>;
  handleErrorAlt(operation: string, result: HttpErrorResponse): Observable<any>;
  handleErrorConsole(error: HttpErrorResponse): Observable<never>;
  handleSuccess(message: string): void;
}
