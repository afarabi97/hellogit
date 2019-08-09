import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { SnackbarWrapper } from '../../classes/snackbar-wrapper';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { EntityConfig, ApiService } from '../../services/tfplenum.service';

export const config: EntityConfig = { entityPart: 'catalog/', type: 'Catalog' };

export const HTTP_OPTIONS = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class CatalogService extends ApiService<any> {
  public snackbar: SnackbarWrapper;
  public chart: any;
  public isLoading: boolean = false;

  /**
   *Creates an instance of CatalogService.
   * @param {HttpClient} http
   * @memberof CatalogService
   */
  constructor() {
    super(config);
  }

  /**
   * Return a single entity by Id
   * @param {number} id
   * @returns {Observable<T>}
   */
  public getNodes(): Observable<Object> {
    const url = "/api/nodes";
    return this._http.get<Object>(url).pipe(
      catchError(error => this.handleError(url, error))
    );
  }

  getValuesFile(role, process, configsArray ): Observable<Object>{
    const url = '/api/catalog/generate_values';
    let payload = { role: role, process: process, configs: configsArray };
      return this._http.post(url, payload, HTTP_OPTIONS).pipe();
  }

  /**
   * installs chart on node
   *
   * @param {*} role
   * @param {*} process
   * @param {*} configs
   * @returns {Observable<Object>}
   * @memberof CatalogService
   */
  installHelm(role, process, values): Observable<Object>{
    const url = '/api/catalog/install';
    let payload = { role: role, process: process, values: values };
      return this._http.post(url, payload, HTTP_OPTIONS).pipe();
  }

  /**
   * delete chart on node
   *
   * @param {*} role
   * @param {*} process
   * @param {*} configs
   * @returns {Observable<Object>}
   * @memberof CatalogService
   */
  deleteHelm(role, process): Observable<Object>{
    const url = '/api/catalog/delete';
    let payload = { role: role, process: process };
      return this._http.post(url, payload, HTTP_OPTIONS).pipe();
  }

  /**
   * reinstalls chart on node
   *
   * @param {*} role
   * @param {*} process
   * @param {*} configs
   * @returns {Observable<Object>}
   * @memberof CatalogService
   */
  reinstallHelm(role, process, values): Observable<Object>{
    const url = '/api/catalog/reinstall';
    let payload = { role: role, process: process, values: values };
      return this._http.post(url, payload, HTTP_OPTIONS).pipe();
  }
}