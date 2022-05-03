import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import {
  AppClass,
  ChartClass,
  ChartInfoClass,
  GenericJobAndKeyClass,
  NodeClass,
  ObjectUtilitiesClass,
  SavedValueClass,
  StatusClass,
} from '../classes';
import { HTTP_OPTIONS } from '../constants/cvah.constants';
import {
  AppInterface,
  CatalogHelmActionInterface,
  CatalogServiceInterface,
  ChartInfoInterface,
  ChartInterface,
  EntityConfig,
  GenerateFileInterface,
  GenericJobAndKeyInterface,
  NodeInterface,
  SavedValueInterface,
  StatusInterface
} from '../interfaces';
import { ApiService } from './abstract/api.service';

const entityConfig: EntityConfig = { entityPart: '', type: 'CatalogService' };

/**
 * Service used for catalog related rest calls
 *
 * @export
 * @class CatalogService
 * @extends {ApiService<any>}
 * @implements {CatalogServiceInterface}
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogService extends ApiService<any> implements CatalogServiceInterface {

  /**
   * Creates an instance of CatalogService.
   *
   * @memberof CatalogService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET kit nodes
   *
   * @returns {Observable<NodeClass[]>}
   * @memberof KitService
   */
  get_catalog_nodes(): Observable<NodeClass[]> {
    return this.httpClient_.get<NodeInterface[]>(environment.CATALOG_SERVICE_NODES)
      .pipe(map((response: NodeInterface[]) => response.map((n: NodeInterface) => new NodeClass(n))),
            catchError((error: HttpErrorResponse) => this.handleError('get catalog nodes', error)));
  }

  /**
   * REST call to GET chart info
   *
   * @param {string} path_value
   * @returns {Observable<ChartInfoClass>}
   * @memberof CatalogService
   */
  get_chart_info(path_value: string): Observable<ChartInfoClass> {
    const url = `${environment.CATALOG_SERVICE_BASE}chart/${path_value}/info`;

    return this.httpClient_.get<ChartInfoInterface>(url)
      .pipe(map((response: ChartInfoInterface) => new ChartInfoClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('get chart info', error)));
  }

  /**
   * REST call to GET chart status
   *
   * @param {string} path_value
   * @returns {Observable<StatusClass[]>}
   * @memberof CatalogService
   */
  get_chart_statuses(path_value: string): Observable<StatusClass[]> {
    const url = `${environment.CATALOG_SERVICE_BASE}chart/${path_value}/status`;

    return this.httpClient_.get<StatusInterface[]>(url)
      .pipe(map((response: StatusInterface[]) => response.map((s: StatusInterface) => new StatusClass(s))),
            catchError((error: HttpErrorResponse) => this.handleError('get statuses', error)));
  }

  /**
   * REST call to GET saved values
   *
   * @param {string} path_value
   * @returns {Observable<SavedValueClass[]>}
   * @memberof CatalogService
   */
  get_saved_values(path_value: string): Observable<SavedValueClass[]> {
    const url = `${environment.CATALOG_SERVICE_BASE}${path_value}/saved-values`;

    return this.httpClient_.get<SavedValueInterface[]>(url)
      .pipe(map((response: SavedValueInterface[]) => response.map((s: SavedValueInterface) => new SavedValueClass(s))),
            catchError((error: HttpErrorResponse) => this.handleError('get saved values', error)));
  }

  /**
   * REST call to GET installed apps
   *
   * @param {string} path_value
   * @returns {Observable<AppClass[]>}
   * @memberof CatalogService
   */
  get_installed_apps(path_value: string): Observable<AppClass[]> {
    const url = `${environment.CATALOG_SERVICE_BASE}${path_value}/apps`;

    return this.httpClient_.get<AppInterface[]>(url)
      .pipe(map((response: AppInterface[]) => response.map((a: AppInterface) => new AppClass(a))),
            catchError((error: HttpErrorResponse) => this.handleError('get installed apps', error)));
  }

  /**
   * REST call to GET all application statuses
   *
   * @returns {Observable<ChartClass[]>}
   * @memberof CatalogService
   */
  get_all_application_statuses(): Observable<ChartClass[]> {
    return this.httpClient_.get<ChartInterface[]>(environment.CATALOG_SERVICE_CHARTS_STATUS)
      .pipe(map((response: ChartInterface[]) => response.map((c: ChartInterface) => new ChartClass(c))),
            catchError((error: HttpErrorResponse) => this.handleError('get all application statuses', error)));
  }

  /**
   * REST call to POST generate values file
   *
   * @param {GenerateFileInterface} generate_file
   * @returns {Observable<Object>}
   * @memberof CatalogService
   */
  generate_values_file(generate_file: GenerateFileInterface): Observable<Object[]> {
    return this.httpClient_.post<Object[]>(environment.CATALOG_SERVICE_GENERATE_VALUES, generate_file, HTTP_OPTIONS)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('generate values file', error)));
  }

  /**
   * REST call to POST catalog install
   *
   * @param {CatalogHelmActionInterface} catalog_helm_action
   * @returns {Observable<GenericJobAndKeyClass>}
   * @memberof CatalogService
   */
  catalog_install(catalog_helm_action: CatalogHelmActionInterface): Observable<GenericJobAndKeyClass> {
    return this.httpClient_.post<GenericJobAndKeyInterface>(environment.CATALOG_SERVICE_INSTALL, catalog_helm_action, HTTP_OPTIONS)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('catalog install', error)));
  }

  /**
   * REST call to POST catalog reinstall
   *
   * @param {CatalogHelmActionInterface} catalog_helm_action
   * @returns {Observable<GenericJobAndKeyClass>}
   * @memberof CatalogService
   */
  catalog_reinstall(catalog_helm_action: CatalogHelmActionInterface): Observable<GenericJobAndKeyClass> {
    return this.httpClient_.post<GenericJobAndKeyInterface>(environment.CATALOG_SERVICE_REINSTALL, catalog_helm_action, HTTP_OPTIONS)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('catalog reinstall', error)));
  }

  /**
   * REST call to POST catalog uninstall
   *
   * @param {CatalogHelmActionInterface} catalog_helm_action
   * @returns {Observable<GenericJobAndKeyClass>}
   * @memberof CatalogService
   */
  catalog_uninstall(catalog_helm_action: CatalogHelmActionInterface): Observable<GenericJobAndKeyClass> {
    return this.httpClient_.post<GenericJobAndKeyInterface>(environment.CATALOG_SERVICE_UNINSTALL, catalog_helm_action, HTTP_OPTIONS)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('catalog uninstall', error)));
  }

  /**
   * REST call to GET configured ifaces
   *
   * @param {string} sensor_hostname
   * @return {*}  {Observable<string[]>}
   * @memberof CatalogService
   */
  get_configured_ifaces(sensor_hostname: string): Observable<string[]> {
    const url = `${environment.CATALOG_SERVICE_GET_CONFIGURED_IFACES}${sensor_hostname}`;
    return this.httpClient_.get<string[]>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('retrieving configured ifaces', error)));
  }
}
