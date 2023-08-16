import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { ErrorMessageClass, ObjectUtilitiesClass, PostValidationClass, ValidationErrorClass } from '../../classes';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR_DISMISS } from '../../constants/cvah.constants';
import { ApiServiceInterface, EntityConfig } from '../../interfaces';
import { InjectorModule } from '../../modules/utilily-modules/injector.module';
import { MatSnackBarService } from '../mat-snackbar.service';

const SERVICE_CONFIG = new InjectionToken<EntityConfig>('entityConfig');

/**
 * Service used for default functionality and to allow other
 * services to have default methods for error handeling
 *
 * @export
 * @abstract
 * @class ApiService
 * @implements {ApiServiceInterface<T>}
 * @template T
 */
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
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param {string} [operation='operation'] - name of the operation that failed
   * @param {HttpErrorResponse} [httpErrorResponse] - optional value to return as the observable result
   * @returns {Observable<any>}
   * @memberof ApiService
   */
  handleError(operation: string = 'operation', httpErrorResponse?: HttpErrorResponse): Observable<any> {
    if (ObjectUtilitiesClass.notUndefNull(httpErrorResponse)) {
      this.handleErrorConsole(httpErrorResponse);
      if (httpErrorResponse.error && httpErrorResponse.error['error_message']) {
        this.matSnackBarService.displaySnackBar(httpErrorResponse.error['error_message']);

        const error_message: ErrorMessageClass = new ErrorMessageClass(httpErrorResponse.error);

        return throwError(error_message);
      } else if (httpErrorResponse.error && httpErrorResponse.error['post_validation']) {
        this.matSnackBarService.displaySnackBar(httpErrorResponse.error['post_validation']);

        const post_validation_message: PostValidationClass = new PostValidationClass(httpErrorResponse.error);

        return throwError(post_validation_message);
      } else if (httpErrorResponse.error && httpErrorResponse.error['status'] && httpErrorResponse.error['messages']) {
        this.matSnackBarService.displaySnackBar(JSON.stringify(httpErrorResponse.error));

        const validation_error_message: ValidationErrorClass = new ValidationErrorClass(httpErrorResponse.error);

        return throwError(validation_error_message);
      } else if (httpErrorResponse.error && httpErrorResponse.error['message']) {
        this.matSnackBarService.displaySnackBar(httpErrorResponse.error['message']);
      } else{
        this.matSnackBarService.displaySnackBar(`An error has occurred: ${httpErrorResponse.status}-${httpErrorResponse.statusText}`, MAT_SNACKBAR_CONFIGURATION_60000_DUR_DISMISS);
      }
    } else {
      this.matSnackBarService.displaySnackBar(`An error has occurred: ${operation}`, MAT_SNACKBAR_CONFIGURATION_60000_DUR_DISMISS);
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
    if (ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error) &&
        ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error['error_message'])) {
      this.matSnackBarService.displaySnackBar(httpErrorResponse.error['error_message'], MAT_SNACKBAR_CONFIGURATION_60000_DUR_DISMISS);
    } else if (ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error) &&
               ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error['post_validation'])) {
      this.matSnackBarService.displaySnackBar(httpErrorResponse.error['post_validation'], MAT_SNACKBAR_CONFIGURATION_60000_DUR_DISMISS);
    } else if (ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error) &&
               ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error['status']) &&
               ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error['messages'])) {
      this.matSnackBarService.displaySnackBar(JSON.stringify(httpErrorResponse.error), MAT_SNACKBAR_CONFIGURATION_60000_DUR_DISMISS);
    } else if (ObjectUtilitiesClass.notUndefNull(httpErrorResponse.message)) {
      this.matSnackBarService.displaySnackBar(httpErrorResponse.message, MAT_SNACKBAR_CONFIGURATION_60000_DUR_DISMISS);
    } else {
      this.matSnackBarService.displaySnackBar(`An error has occurred: ${operation}`, MAT_SNACKBAR_CONFIGURATION_60000_DUR_DISMISS);
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
      console.error(`An error occurred: ${httpErrorResponse.error.type}`);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong
      let error_message: string = '';
      if (ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error) &&
          ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error['error_message'])) {
        error_message = httpErrorResponse.error['error_message'];
      } else if (ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error) &&
                 ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error['post_validation'])) {
        error_message = httpErrorResponse.error['post_validation'];
      } else if (ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error) &&
                 ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error['status']) &&
                 ObjectUtilitiesClass.notUndefNull(httpErrorResponse.error['messages'])) {
        error_message = JSON.stringify(httpErrorResponse.error);
      } else {
        error_message = httpErrorResponse.error;
      }
      console.error(`Backend returned code ${httpErrorResponse.status}, error: ${error_message}, message: ${httpErrorResponse.message}`);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  }
}
