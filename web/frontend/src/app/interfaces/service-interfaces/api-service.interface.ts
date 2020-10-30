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
  create(param: T): Observable<Object>;
  update(param: T): Observable<T>;
  delete(id: any): Observable<T>;
  deleteAll(): Observable<T>;
  get(id: any): Observable<T>;
  getById(id: any): Observable<T>;
  getByString(path: string): Observable<T>;
  getAll(): Observable<T[]>;
  handleError(operation: string, result?: any): Observable<any>;
  handleErrorAlt(operation: string, result: HttpErrorResponse): Observable<any>;
  handleErrorConsole(error: HttpErrorResponse): Observable<never>;
  handleSuccess(message: string): void;
}
