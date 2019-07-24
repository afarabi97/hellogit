import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InjectorModule } from '../utilily-modules/injector.module';
import { catchError, map, tap } from 'rxjs/operators';
import { SnackbarWrapper } from '../classes/snackbar-wrapper';

export interface EntityConfig {
    /**
     * {string} Entity name part of the url. Trailing slash is required
     */
    entityPart: string;
    type?: string
}
export const SERVICE_CONFIG = new InjectionToken<EntityConfig>('entityConfig');

export interface IApiService<T> {
    create(param: T);
    delete(id: number): Observable<T>;
    get(id: number): Observable<T>;
    getAll(): Observable<T>;
    update(id: number, param: T): Observable<T>;
}

@Injectable()
export abstract class ApiService<T> implements IApiService<T> {
    snackbar: SnackbarWrapper;
    type: string
    urlPath: string;
    protected _http: HttpClient;

    /**
     *
     * @param {EntityConfig} config the entity name part of the url. Trailing slash is required
     */
    constructor(@Inject(SERVICE_CONFIG) protected config: EntityConfig) {
        this.urlPath = '/api/' + config.entityPart;
        this.type = config.type
        this._http = InjectorModule.rootInjector.get(HttpClient);
        this.snackbar = InjectorModule.rootInjector.get(SnackbarWrapper);
    }

    /**
     * Create a new entity of type T
     * @param {T} param new entity to create
     * @returns {Observable<Object>}
     */
    public create(param: T) {
        return this._http.post<T>(this.urlPath, param).pipe(
            tap(update => this.handleSuccess(this.type + ' was successfully created!')),
            catchError(error => this.handleError("create", error))
        );
    }


    /**
     * Delete a single entity
     * @param {number} id of entity to delete
     * @returns {Observable<number>}
     */
    public delete(id: any): Observable<T> {
        const url = this.urlPath + '/' + id;
        return this._http.delete<T>(url, {}).pipe(
            tap(update => this.handleSuccess(this.type ? this.type + ' was successfully deleted!' : ' Sucessfully deleted!')),
            catchError(error => this.handleError(url, error))
        );
    }

    /**
     * Delete a all entity
     * @param {number} id of entity to delete
     * @returns {Observable<number>}
     */
    public deleteAll(): Observable<T> {
      const url = this.urlPath;
      return this._http.delete<T>(url, {}).pipe(
          tap(update => this.handleSuccess(this.type ? this.type + ' was successfully deleted!' : ' Sucessfully deleted!')),
          catchError(error => this.handleError(url, error))
      );
  }

    /**
     * Return all entities of type T
     * @returns {Observable<T[]>}
     */
    public getAll(): Observable<T> {
        const url = this.urlPath + 'getAll'
        return this._http.get<T>(url).pipe(
          catchError(error => this.handleError(url, error))
        );
    }

    /**
     * Return a single entity by Id
     * @param {number} id
     * @returns {Observable<T>}
     */
    public getById(id: number): Observable<T> {
        const url = this.urlPath + 'id/' + id;
        return this._http.get<T>(url).pipe(
          catchError(error => this.handleError(url, error))
        );
    }

        /**
     * Return a single entity by Id
     * @param {number} id
     * @returns {Observable<T>}
     */
    public getByString(path: string): Observable<T> {
      const url = this.urlPath + path;
      return this._http.get<T>(url).pipe(
        catchError(error => this.handleError(url, error))
      );
  }

    /**
     * Return a single entity by Id
     * @param {number} id
     * @returns {Observable<T>}
     */
    public get(): Observable<T> {
        const url = this.urlPath;
        return this._http.get<T>(url).pipe(
          catchError(error => this.handleError(url, error))
        );
    }

    /**
     * Update a signle entity
     *
     * @param {number} id
     * @param {*} param
     * @returns {Observable<T>}
     * @memberof ApiService
     */
    public update(id: number, param: any): Observable<T> {
        return this._http.put<T>(this.urlPath, param).pipe(
            tap(update => this.handleSuccess(this.type ? this.type + ' was sucessfully updated!' : 'Successfully updated!')),
            catchError(error => this.handleError("update", error))
        );
    }

    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    public handleError(operation = 'operation', result?: any) {
      this.snackbar.showSnackBar('An error has occured: ' + result.status + '-' + result.statusText, 15000, 'Dismiss');
      return of(result);
    }

    public handleSuccess(message: string) {
        this.snackbar.showSnackBar(message, 3000);
    }

}
