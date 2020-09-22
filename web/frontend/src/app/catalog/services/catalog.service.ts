import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SnackbarWrapper } from '../../classes/snackbar-wrapper';
import { ApiService, EntityConfig } from '../../services/tfplenum.service';

export const config: EntityConfig = { entityPart: 'catalog/', type: 'Catalog' };

export const HTTP_OPTIONS = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class CatalogService extends ApiService<any> {
  snackbar: SnackbarWrapper;
  chart: any;
  isLoading: boolean;

  /**
   *Creates an instance of CatalogService.
   * @param {HttpClient} http
   * @memberof CatalogService
   */
  constructor() {
    super(config);

    this.isLoading = false;
  }

  /**
   * Return a single entity by Id
   * @param {number} id
   * @returns {Observable<T>}
   */
  getNodes(): Observable<Object> {
    const url = "/api/nodes";
    return this._http.get<Object>(url).pipe(
      catchError(error => this.handleError(url, error))
    );
  }

  getValuesFile(role, process, configsArray ): Observable<Object>{
    const url = '/api/catalog/generate_values';
    const payload = { role: role, process: process, configs: configsArray };
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
    const payload = { role: role, process: process, values: values };
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
    const payload = { role: role, process: process };
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
    const payload = { role: role, process: process, values: values };
      return this._http.post(url, payload, HTTP_OPTIONS).pipe();
  }

  getinstalledapps(hostname): Observable<Object>{
    const url = '/api/catalog/' + hostname + '/apps';
    return this._http.get<Object>(url).pipe(
      catchError(error => this.handleError(url, error))
    );
  }

  get_all_application_statuses(): Observable<Object> {
    const url = '/api/catalog/chart/status_all';
    return this._http.get<Object>(url).pipe(
      catchError(error => this.handleError(url, error))
    );
  }
}
