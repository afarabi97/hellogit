import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { GenericJobAndKeyClass, SuccessMessageClass } from '../../../classes';
import { EntityConfig, GenericJobAndKeyInterface, SuccessMessageInterface } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { ElasticLicenseClass } from '../classes/elastic-license.class';
import { InitialDeviceStateClass } from '../classes/initial-device-state.class';
import { NetworkDeviceStateClass } from '../classes/network-device-state.class';
import { ElasticLicenseInterface } from '../interfaces/elastic-license.interface';
import { InitialDeviceStateInterface } from '../interfaces/initial-device-states.interface';
import { KitPasswordInterface } from '../interfaces/kit-password.interface';
import { NetworkDeviceStateInterface } from '../interfaces/network-device-state.interface';
import { RepoSettingsSnapshotInterface } from '../interfaces/repo-settings-snapshot.interface';
import { ToolsServiceInterface } from '../interfaces/service-interfaces/tools-service.interface';
import { RepoSettingsSnapshotClass } from '../classes/repo-settings-snapshot.class';

const entityConfig: EntityConfig = { entityPart: '', type: 'ToolsService' };


/**
 * Service used for various tool related rest calls
 *
 * @export
 * @class ToolsService
 * @extends {ApiService<any>}
 * @implements {ToolsServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class ToolsService extends ApiService<any> implements ToolsServiceInterface {

  /**
   * Creates an instance of ToolsService.
   *
   * @memberof ToolsService
   */
  constructor() {
    super(entityConfig);
  }

   /**
    * REST call to POST change kit password
    *
    * @param {KitPasswordInterface} kit_password
    * @return {Observable<SuccessMessageClass>}
    * @memberof ToolsService
    */
   change_kit_password(kit_password: KitPasswordInterface): Observable<SuccessMessageClass> {
    return this.httpClient_.post<SuccessMessageInterface>(environment.TOOLS_SERVICE_CHANGE_KIT_PASSWORD, kit_password)
      .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('change kit passowrd', error)));
  }

  /**
   * REST call to PUT change remote network device state
   *
   * @param {string} hostname
   * @param {string} device
   * @param {string} state
   * @return {Observable<NetworkDeviceStateClass>}
   * @memberof ToolsService
   */
  change_remote_network_device_state(hostname: string, device: string, state: string): Observable<NetworkDeviceStateClass> {
    const url: string = `/api/tools/${hostname}/set-interface-state/${device}/${state}`;

    return this.httpClient_.put<NetworkDeviceStateInterface>(url, {})
      .pipe(map((response: NetworkDeviceStateInterface) => new NetworkDeviceStateClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('change remote network device state', error)));
  }

  /**
   * REST call to GET initial device states
   *
   * @return {Observable<InitialDeviceStateClass[]>}
   * @memberof ToolsService
   */
  get_initial_device_states(): Observable<InitialDeviceStateClass[]> {
    return this.httpClient_.get<InitialDeviceStateInterface[]>(environment.TOOLS_SERVICE_MONITORING_INTERFACE)
      .pipe(map((response: InitialDeviceStateInterface[]) => response.map((initial_device_state: InitialDeviceStateInterface) => new InitialDeviceStateClass(initial_device_state))),
            catchError((error: HttpErrorResponse) => this.handleError('get initial device states', error)));
  }

  /**
   * REST call to POST repo settings snapshot
   *
   * @param {RepoSettingsSnapshotInterface} repo_settings_snapshot
   * @return {Observable<GenericJobAndKeyClass>}
   * @memberof ToolsService
   */
  repo_settings_snapshot(repo_settings_snapshot: RepoSettingsSnapshotInterface): Observable<GenericJobAndKeyClass> {
    return this.httpClient_.post<GenericJobAndKeyInterface>(environment.MINIO_REPOSITORY_SETTINGS_URL, repo_settings_snapshot)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('repo settings snapshot', error)));
  }

  get_repo_settings_snapshot(): Observable<RepoSettingsSnapshotInterface> {
    return this.httpClient_.get<RepoSettingsSnapshotInterface>(environment.MINIO_REPOSITORY_SETTINGS_URL)
      .pipe(map((response: RepoSettingsSnapshotInterface) => new RepoSettingsSnapshotClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('get repo settings snapshot', error)));
  }

  /**
   * REST call to POST upload documentation
   *
   * @param {FormData} form_data
   * @return {Observable<SuccessMessageClass>}
   * @memberof ToolsService
   */
  upload_documentation(form_data: FormData): Observable<SuccessMessageClass> {
    return this.httpClient_.post<SuccessMessageInterface>(environment.TOOLS_SERVICE_UPLOAD_DOCUMENTATION, form_data)
      .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('upload documentation', error)));
  }

  /**
   * REST call to GET elastic license
   *
   * @return {Observable<ElasticLicenseClass>}
   * @memberof ToolsService
   */
  get_elastic_license(): Observable<ElasticLicenseClass> {
    return this.httpClient_.get<ElasticLicenseInterface>(environment.TOOLS_SERVICE_ES_LICENSE)
      .pipe(map((response: ElasticLicenseInterface) => new ElasticLicenseClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('get elastic license', error)));
  }

  /**
   * REST call to PUT upload elastic license
   *
   * @param {Object} license_data
   * @return {Observable<SuccessMessageClass>}
   * @memberof ToolsService
   */
  upload_elastic_license(license_data: Object): Observable<SuccessMessageClass> {
    return this.httpClient_.put<SuccessMessageInterface>(environment.TOOLS_SERVICE_ES_LICENSE, license_data)
      .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('upload elastic license', error)));
  }
}
