import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { NodeClass, StatusClass } from '../../classes';
import { SnackbarWrapper } from '../../classes/snackbar-wrapper';
import { HTTP_OPTIONS } from '../../constants/cvah.constants';
import { EntityConfig } from '../../interfaces';
import { ApiService } from '../../services/abstract/api.service';

const entityConfig: EntityConfig = { entityPart: 'catalog/', type: 'Catalog' };

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
    super(entityConfig);

    this.isLoading = false;
  }

  /**
   * Return a single entity by Id
   * @param {number} id
   * @returns {Observable<NodeClass[]>}
   */
  getNodes(): Observable<NodeClass[]> {
    const url = "/api/kit/nodes";
    return this.httpClient_.get<Object>(url).pipe(
      catchError(error => this.handleError(url, error))
    );
  }

  getValuesFile(role, process, configsArray ): Observable<Object>{
    const url = '/api/catalog/generate_values';
    const payload = { role: role, process: process, configs: configsArray };
      return this.httpClient_.post(url, payload, HTTP_OPTIONS).pipe();
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
      return this.httpClient_.post(url, payload, HTTP_OPTIONS).pipe();
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
    const url = '/api/catalog/uninstall';
    const payload = { role: role, process: process };
      return this.httpClient_.post(url, payload, HTTP_OPTIONS).pipe();
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
      return this.httpClient_.post(url, payload, HTTP_OPTIONS).pipe();
  }

  getinstalledapps(hostname): Observable<Object>{
    const url = `/api/catalog/${hostname}/apps`;
    return this.httpClient_.get<Object>(url).pipe(
      catchError(error => this.handleError(url, error))
    );
  }

  get_all_application_statuses(): Observable<Object> {
    const url = '/api/catalog/charts/status';
    return this.httpClient_.get<Object>(url).pipe(
      catchError(error => this.handleError(url, error))
    );
  }

  checkLogStashInstalled(): Observable<StatusClass[]> {
    return this.httpClient_.get<StatusClass[]>(environment.CATALOG_SERVICE_CHECK_LOGSTASH_INSTALLED)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('get check logstash installed', error)));
  }
}
