import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { GenericJobAndKeyClass } from '../../../classes';
import { HTTP_OPTIONS } from '../../../constants/cvah.constants';
import { EntityConfig, GenericJobAndKeyInterface } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { FilebeatModuleClass } from '../classes/filebeat-module.class';
import { WinlogbeatConfigurationClass } from '../classes/winlogbeat-configuration.class';
import { FilebeatModuleInterface } from '../interfaces/filebeat-module.interface';
import { ColdLogIngestServiceInterface } from '../interfaces/services/cold-log-ingest-service.interface';
import { WinlogbeatConfigurationInterface } from '../interfaces/winlogbeat-configuration.interface';

const entityConfig: EntityConfig = { entityPart: '', type: 'ColdLogIngestService' };

/**
 * Service used for handeling cold log ingest and winlogbeat rest calls
 *
 * @export
 * @class ColdLogIngestService
 * @extends {ApiService<any>}
 * @implements {ColdLogIngestServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class ColdLogIngestService extends ApiService<any> implements ColdLogIngestServiceInterface {

  /**
   * Creates an instance of ColdLogIngestService.
   *
   * @memberof ColdLogIngestService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to POST cold log file
   *
   * @param {File} cold_log_file
   * @param {Object} cold_log_form
   * @returns {Observable<GenericJobAndKeyClass>}
   * @memberof ColdLogIngestService
   */
  post_cold_log_file(cold_log_file: File, cold_log_form: Object): Observable<GenericJobAndKeyClass> {
    const form_data: FormData = new FormData();
    form_data.append('upload_file', cold_log_file, cold_log_file.name);
    form_data.append('cold_log_form', JSON.stringify(cold_log_form));

    return this.httpClient_.post<GenericJobAndKeyInterface>(environment.COLD_LOG_INGEST_SERVICE_POST_COLD_LOG_FILE, form_data)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('post file', error)));
  }

  /**
   * REST call to GET winlogbeat configuration
   *
   * @returns {Observable<WinlogbeatConfigurationClass>}
   * @memberof ColdLogIngestService
   */
  get_winlogbeat_configuration(): Observable<WinlogbeatConfigurationClass> {
    return this.httpClient_.get<WinlogbeatConfigurationInterface>(environment.COLD_LOG_INGEST_SERVICE_GET_WINLOGBEAT_CONFIGURATION)
      .pipe(map((response: WinlogbeatConfigurationInterface) => new WinlogbeatConfigurationClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('get winlogbeat configuration', error)));
  }

  /**
   * REST call to POST winlogbeat
   *
   * @param {WinlogbeatConfigurationInterface} winlogbeat_setup_form
   * @returns {Observable<GenericJobAndKeyClass>}
   * @memberof ColdLogIngestService
   */
  post_winlogbeat(winlogbeat_setup_form: WinlogbeatConfigurationInterface): Observable<GenericJobAndKeyClass> {
    return this.httpClient_.post<GenericJobAndKeyInterface>(environment.COLD_LOG_INGEST_SERVICE_POST_WINLOGBEAT, winlogbeat_setup_form, HTTP_OPTIONS)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('post file', error)));
  }

  /**
   * REST call to GET module info
   *
   * @returns {Observable<FilebeatModuleClass[]>}
   * @memberof ColdLogIngestService
   */
  get_module_info(): Observable<FilebeatModuleClass[]> {
    return this.httpClient_.get<FilebeatModuleInterface[]>(environment.COLD_LOG_INGEST_SERVICE_GET_MODULE_INFO)
      .pipe(map((response: FilebeatModuleInterface[]) => response.map((fm: FilebeatModuleInterface) => new FilebeatModuleClass(fm))),
            catchError((error: HttpErrorResponse) => this.handleError('get module info', error)));
  }

}
