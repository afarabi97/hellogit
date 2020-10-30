import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { EntityConfig } from '../../interfaces';
import { ApiService } from '../../services/abstract/api.service';

const entityConfig: EntityConfig = { entityPart: '', type: 'ToolsService' };

/**
 * Service used for various toll related rest calls
 *
 * @export
 * @class ToolsService
 * @extends {ApiService<any>}
 */
@Injectable({
  providedIn: 'root'
})
export class ToolsService extends ApiService<any> {
  /**TODO - Add object structures, return types, method types interfaces, service interface */

  /**
   * Creates an instance of ToolsService.
   *
   * @memberof ToolsService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call POST kit clock change
   *
   * @param {Object} timeObj
   * @returns
   * @memberof ToolsService
   */
  changeKitClock(timeObj: Object) {
    return this.httpClient_.post(environment.TOOLS_SERVICE_CHANGE_KIT_CLOCK, timeObj)
                           .pipe(catchError((err: any) => this.handleError('change_kit_clock', err)));
  }

  /**
   * REST call to POST kit password
   *
   * @param {Object} passwordForm
   * @param {Array<Object>} amendedPasswords
   * @returns
   * @memberof ToolsService
   */
  changeKitPassword(passwordForm: Object, amendedPasswords: Array<Object>) {
    const payload = {passwordForm: passwordForm, amendedPasswords: amendedPasswords};

    return this.httpClient_.post(environment.TOOLS_SERVICE_CHANGE_KIT_PASSWORD, payload)
                           .pipe(catchError((err: any) => this.handleError('change_kit_password', err)));
  }

  /**
   * REST call to POST an upload document
   *
   * @param {File} space_file
   * @param {string} space_name
   * @returns {Observable<Object>}
   * @memberof ToolsService
   */
  uploadDocumentation(space_file: File, space_name: string): Observable<Object> {
    const formData = new FormData();
    formData.append('upload_file', space_file, space_file.name);
    formData.append('space_name', space_name);

    return this.httpClient_.post(environment.TOOLS_SERVICE_UPLOAD_DOCUMENTATION, formData)
                           .pipe(catchError((err: any) => this.handleError('update_documentation', err)));
  }

  /**
   * REST call to GET spaces
   *
   * @returns {Observable<string[]>}
   * @memberof ToolsService
   */
  getSpaces(): Observable<string[]>{
    return this.httpClient_.get<string[]>(environment.TOOLS_SERVICE_GET_SPACES, {})
                           .pipe(catchError((err: any) => this.handleError('get_spaces', err)));
  }

  /**
   * REST call to POST change state of network device
   *
   * @param {string} node
   * @param {string} device
   * @param {string} state
   * @returns {Observable<Object>}
   * @memberof ToolsService
   */
  changStateofRemoteNetworkDevice(node: string, device: string, state: string): Observable<Object> {
    const url = `/api/${node}/set_interface_state/${device}/${state}`;

    return this.httpClient_.post(url, {})
                           .pipe(catchError((err: any) => this.handleError(`${node}/set_interface_state/${device}/${state}`, err)));
  }

  /**
   * REST call to GET monitoring interface
   *
   * @returns {Observable<Object>}
   * @memberof ToolsService
   */
  getMonitoringInterfaces(): Observable<Object> {
    return this.httpClient_.get(environment.TOOLS_SERVICE_MONITORING_INTERFACE)
                           .pipe(catchError((err: any) => this.handleError('monitoring_interfaces', err)));
  }

  /**
   * REST call to POST configure repository
   *
   * @param {Object} repositorySettings
   * @returns {Observable<Object>}
   * @memberof ToolsService
   */
  configureRepository(repositorySettings: Object): Observable<Object> {
    return this.httpClient_.post(environment.TOOLS_SERVICE_CONFIGURE_REPOSITORY, repositorySettings)
                           .pipe(catchError((err: any) => this.handleErrorConsole(err)));
  }
}
