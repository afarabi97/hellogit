import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { MatSnackbarConfigurationClass, ObjectUtilitiesClass } from '../../classes';
import { ApiServiceInterface, EntityConfig } from '../../interfaces';
import { InjectorModule } from '../../modules/utilily-modules/injector.module';
import { MatSnackBarService } from '../mat-snackbar.service';

const SERVICE_CONFIG = new InjectionToken<EntityConfig>('entityConfig');

@Injectable()
export abstract class ApiService<T> implements ApiServiceInterface<T> {
  // TODO - update with neccessary criteria
  matSnackBarService: MatSnackBarService;
  type: string;
  urlPath: string;
  protected httpClient_: HttpClient;

  /**
   * Creates an instance of ApiService.
   *
   * @param {EntityConfig} entityConfigthe entity name part of the url. Trailing slash is required
   * @memberof ApiService
   */
  constructor(@Inject(SERVICE_CONFIG) protected entityConfig: EntityConfig) {
    this.urlPath = `/api/${entityConfig.entityPart}`;
    this.type = entityConfig.type;
    this.httpClient_ = InjectorModule.rootInjector.get(HttpClient);
    this.matSnackBarService = InjectorModule.rootInjector.get(MatSnackBarService);
  }

  /**
   * Create a entity of type T
   *
   * @param {T} param
   * @returns {Observable<T>}
   * @memberof ApiService
   */
  create(param: T): Observable<T> {
    return this.httpClient_.post<T>(this.urlPath, param)
                           .pipe(tap((_response: T) => this.handleSuccess(ObjectUtilitiesClass.notUndefNull(this.type) ? `${this.type} was successfully created!` : 'Successfully created!')),
                                 catchError((err: any) => this.handleError('create', err)));
  }

  /**
   * Update a entity of type T
   *
   * @param {*} param
   * @returns {Observable<T>}
   * @memberof ApiService
   */
  update(param: any): Observable<T> {
    return this.httpClient_.put<T>(this.urlPath, param)
                           .pipe(tap((_response: T) => this.handleSuccess(ObjectUtilitiesClass.notUndefNull(this.type) ? `${this.type} was successfully updated!` : 'Successfully updated!')),
                                 catchError((err: any) => this.handleError('update', err)));
  }

  /**
   * Delete a entity of type T
   *
   * @param {*} id
   * @returns {Observable<T>}
   * @memberof ApiService
   */
  delete(id: any): Observable<T> {
    const url = `${this.urlPath}/${id}`;

    return this.httpClient_.delete<T>(url, {})
                           .pipe(tap((_response: T) => this.handleSuccess(ObjectUtilitiesClass.notUndefNull(this.type) ? `${this.type} was successfully deleted!` : 'Sucessfully deleted!')),
                                 catchError((err: any) => this.handleError('delete', err)));
  }

  /**
   * Delete all entities of type T
   *
   * @returns {Observable<T>}
   * @memberof ApiService
   */
  deleteAll(): Observable<T> {
    return this.httpClient_.delete<T>(this.urlPath, {})
                           .pipe(tap((_response: T) => this.handleSuccess(ObjectUtilitiesClass.notUndefNull(this.type) ? `${this.type} all successfully deleted!` : 'Sucessfully deleted all!')),
                                 catchError((err: any) => this.handleError('deleteAll', err)));
  }

  /**
   * Return a entity of type T
   *
   * @returns {Observable<T>}
   * @memberof ApiService
   */
  get(): Observable<T> {
    return this.httpClient_.get<T>(this.urlPath)
                           .pipe(catchError((err: any) => this.handleError('get', err)));
  }

  /**
   * Return a entity by Id of type T
   *
   * @param {*} id
   * @returns {Observable<T>}
   * @memberof ApiService
   */
  getById(id: any): Observable<T> {
    const url = `${this.urlPath}id/${id}`;

    return this.httpClient_.get<T>(url)
                           .pipe(catchError((err: any) => this.handleError('getById', err)));
  }

  /**
   * Return a entity by string of type T
   *
   * @param {string} path
   * @returns {Observable<T>}
   * @memberof ApiService
   */
  getByString(path: string): Observable<T> {
    const url = `${this.urlPath}${path}`;

    return this.httpClient_.get<T>(url)
                           .pipe(catchError((error: any) => this.handleError('getByString', error)));
  }

  /**
   * Return all entities of type T
   *
   * @returns {Observable<T[]>}
   * @memberof ApiService
   */
  getAll(): Observable<T[]> {
    const url = `${this.urlPath}getAll`;

    return this.httpClient_.get<T[]>(url)
                           .pipe(catchError((error: any) => this.handleError('getAll', error)));
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param {string} [operation='operation'] - name of the operation that failed
   * @param {HttpErrorResponse} [httpErrorResponse] - optional value to return as the observable result
   * @returns {Observable<any>}
   * @memberof ApiService
   */
  handleError(operation: string = 'operation', httpErrorResponse?: HttpErrorResponse): Observable<any> {
    const matSnackBarConfiguration: MatSnackbarConfigurationClass = {
      timeInMS: 15000,
      actionLabel: 'Dismiss'
    };

    if (ObjectUtilitiesClass.notUndefNull(httpErrorResponse)) {
      this.handleErrorConsole(httpErrorResponse);
      if (httpErrorResponse.error && httpErrorResponse.error['error_message']){
        this.matSnackBarService.displaySnackBar(httpErrorResponse.error['error_message']);
      } else if (httpErrorResponse.error && httpErrorResponse.error['message']){
        this.matSnackBarService.displaySnackBar(httpErrorResponse.error['message']);
      } else{
        this.matSnackBarService.displaySnackBar(`An error has occured: ${httpErrorResponse.status}-${httpErrorResponse.statusText}`, matSnackBarConfiguration);
      }
    } else {
      this.matSnackBarService.displaySnackBar(`An error has occured: ${operation}`, matSnackBarConfiguration);
    }

    return throwError(httpErrorResponse);
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue with new Observable.
   *
   * @param {string} [operation='operation']
   * @param {HttpErrorResponse} httpErrorResponse
   * @returns {Observable<any>}
   * @memberof ApiService
   */
  handleErrorAlt(operation: string = 'operation', httpErrorResponse: HttpErrorResponse): Observable<any> {
    const matSnackBarConfiguration: MatSnackbarConfigurationClass = {
      actionLabel: 'Dismiss'
    };
    if (ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error) &&
        ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error['error_message'])) {
      this.matSnackBarService.displaySnackBar(httpErrorResponse.error['error_message'], matSnackBarConfiguration);
    } else if (ObjectUtilitiesClass.notUndefNull(httpErrorResponse.message)) {
      this.matSnackBarService.displaySnackBar(httpErrorResponse.message, matSnackBarConfiguration);
    } else {
      this.matSnackBarService.displaySnackBar(`An error has occured: ${operation}`, matSnackBarConfiguration);
    }
    this.handleErrorConsole(httpErrorResponse);

    return new Observable();
  }

  /**
   * Handle http error that failed
   * Display error in console and throw new error message
   *
   * @param {HttpErrorResponse} httpErrorResponse
   * @returns {Observable<never>}
   * @memberof ApiService
   */
  handleErrorConsole(httpErrorResponse: HttpErrorResponse): Observable<never> {
    if (httpErrorResponse.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', httpErrorResponse.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(`Backend returned code ${httpErrorResponse.status}, body was: ${httpErrorResponse.error}`);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  }

  /**
   * Handle http operation that succed
   *
   * @param {string} message
   * @memberof ApiService
   */
  handleSuccess(message: string): void {
    this.matSnackBarService.displaySnackBar(message, { timeInMS: 3000 });
  }
}
