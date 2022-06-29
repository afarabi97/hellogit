import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { SuccessMessageClass } from '../../../classes';
import { HTTP_OPTIONS } from '../../../constants/cvah.constants';
import { EntityConfig, SuccessMessageInterface } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { AgentInstallerConfigurationClass, AppConfigClass, AppConfigContentClass, HostClass, IPTargetListClass } from '../classes';
import {
  AgentBuilderServiceInterface,
  AgentInstallerConfigurationInterface,
  AgentInterface,
  AgentTargetInterface,
  AppConfigContentInterface,
  AppConfigInterface,
  HostInterface,
  IPTargetListInterface
} from '../interfaces';

const entityConfig: EntityConfig = { entityPart: '', type: 'AgentBuilderService' };

/**
 * Service used for making agent related api calls
 *
 * @export
 * @class AgentBuilderService
 * @extends {ApiService<any>}
 */
@Injectable({
  providedIn: null
})
export class AgentBuilderService extends ApiService<any> implements AgentBuilderServiceInterface {

  /**
   * Creates an instance of AgentBuilderService.
   *
   * @memberof AgentBuilderService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to POST agent generate
   *
   * @param {AgentInterface} agent
   * @returns {Observable<Blob>}
   * @memberof AgentBuilderService
   */
  agent_generate(agent: AgentInterface): Observable<Blob> {
    return this.httpClient_.post(environment.AGENT_BUILDER_SERVICE_AGENT_GENERATE, agent, { responseType: 'blob' })
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('post/get agent generate', error)));
  }

  /**
   * REST call to POST agent save config
   *
   * @param {AgentInstallerConfigurationClass} agent_installer_configuration
   * @returns {Observable<AgentInstallerConfigurationClass[]>}
   * @memberof AgentBuilderService
   */
  agent_save_config(agent_installer_configuration: AgentInstallerConfigurationClass): Observable<AgentInstallerConfigurationClass[]> {
    return this.httpClient_.post<AgentInstallerConfigurationInterface[]>(environment.AGENT_BUILDER_SERVICE_AGENT_CONFIG, agent_installer_configuration)
      .pipe(map((response: AgentInstallerConfigurationInterface[]) => response.map((aic: AgentInstallerConfigurationInterface) => new AgentInstallerConfigurationClass(aic))),
            catchError((error: HttpErrorResponse) => this.handleError('agent save config', error)));
  }

  /**
   * REST call to DELETE agent delete config
   *
   * @param {string} agent_configuration_id
   * @returns {Observable<AgentInstallerConfigurationClass[]>}
   * @memberof AgentBuilderService
   */
  agent_delete_config(agent_configuration_id: string): Observable<AgentInstallerConfigurationClass[]> {
    const url = `${environment.AGENT_BUILDER_SERVICE_AGENT_CONFIG}/${agent_configuration_id}`;

    return this.httpClient_.delete<AgentInstallerConfigurationInterface[]>(url)
      .pipe(map((response: AgentInstallerConfigurationInterface[]) => response.map((aic: AgentInstallerConfigurationInterface) => new AgentInstallerConfigurationClass(aic))),
            catchError((error: HttpErrorResponse) => this.handleError('agent delete config', error)));
  }

  /**
   * REST call to GET agent configs
   *
   * @returns {Observable<AgentInstallerConfigurationClass[]>}
   * @memberof AgentBuilderService
   */
  agent_get_configs(): Observable<AgentInstallerConfigurationClass[]> {
    return this.httpClient_.get<AgentInstallerConfigurationInterface[]>(environment.AGENT_BUILDER_SERVICE_AGENT_CONFIG)
      .pipe(map((response: AgentInstallerConfigurationInterface[]) => response.map((aic: AgentInstallerConfigurationInterface) => new AgentInstallerConfigurationClass(aic))),
            catchError((error: HttpErrorResponse) => this.handleError('agent get configs', error)));
  }

  /**
   * REST call to GET agent get ip target list
   *
   * @returns {Observable<IPTargetListClass[]>}
   * @memberof AgentBuilderService
   */
  agent_get_ip_target_list(): Observable<IPTargetListClass[]> {
    return this.httpClient_.get<IPTargetListInterface[]>(environment.AGENT_BUILDER_SERVICE_AGENT_TARGETS)
      .pipe(map((response: IPTargetListInterface[]) => response.map((iptl: IPTargetListInterface) => new IPTargetListClass(iptl))),
            catchError((error: HttpErrorResponse) => this.handleError('agent get ip target list', error)));
  }

  /**
   * REST call to POST agent save ip target list
   *
   * @param {IPTargetListClass} ip_target_list
   * @returns {Observable<IPTargetListClass[]>}
   * @memberof AgentBuilderService
   */
  agent_save_ip_target_list(ip_target_list: IPTargetListClass): Observable<IPTargetListClass[]> {
    return this.httpClient_.post<IPTargetListInterface[]>(environment.AGENT_BUILDER_SERVICE_AGENT_TARGETS, ip_target_list)
      .pipe(map((response: IPTargetListInterface[]) => response.map((iptl: IPTargetListInterface) => new IPTargetListClass(iptl))),
            catchError((error: HttpErrorResponse) => this.handleError('agent save ip taget list', error)));
  }

  /**
   * REST call to POST agent add ip target list
   *
   * @param {string} target_config_id
   * @param {HostInterface} host
   * @returns {Observable<IPTargetListClass>}
   * @memberof AgentBuilderService
   */
  agent_add_host_to_ip_target_list(target_config_id: string, host: HostInterface): Observable<IPTargetListClass> {
    const url = `${environment.AGENT_BUILDER_SERVICE_AGENT_HOST}${target_config_id}`;

    return this.httpClient_.post<IPTargetListInterface>(url, host, HTTP_OPTIONS)
      .pipe(map((response: IPTargetListInterface) => new IPTargetListClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('agent add host to ip target list', error)));
  }

  /**
   * REST call to DELETE agent remove ip target list
   *
   * @param {string} target_config_id
   * @param {HostClass} host
   * @returns {Observable<SuccessMessageClass>}
   * @memberof AgentBuilderService
   */
  agent_remove_host_from_ip_target_list(target_config_id: string, host: HostClass): Observable<SuccessMessageClass> {
    const url = `${environment.AGENT_BUILDER_SERVICE_AGENT_HOST}${host.hostname}/${target_config_id}`;

    return this.httpClient_.delete<SuccessMessageInterface>(url)
      .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('agent remove host from ip target list', error)));
  }

  /**
   * REST call to DELETE agent delete ip target list
   *
   * @param {string} ip_target_list_name
   * @returns {Observable<IPTargetListClass[]>}
   * @memberof AgentBuilderService
   */
  agent_delete_ip_target_list(ip_target_list_name: string): Observable<IPTargetListClass[]> {
    const url = `${environment.AGENT_BUILDER_SERVICE_AGENT_TARGETS}/${ip_target_list_name}`;

    return this.httpClient_.delete<IPTargetListInterface[]>(url)
      .pipe(map((response: IPTargetListInterface[]) => response.map((iptl: IPTargetListInterface) => new IPTargetListClass(iptl))),
            catchError((error: HttpErrorResponse) => this.handleError('agent delete ip target list', error)));
  }

  /**
   * REST call to POST agents install
   *
   * @param {AgentInterface} agent
   * @returns {Observable<SuccessMessageClass>}
   * @memberof AgentBuilderService
   */
  agents_install(agent: AgentInterface): Observable<SuccessMessageClass> {
    return this.httpClient_.post<SuccessMessageInterface>(environment.AGENT_BUILDER_SERVICE_AGENTS_INSTALL, agent)
      .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('agents install', error)));
  }

  /**
   * REST call to POST agents uninstall
   *
   * @param {AgentInterface} agent
   * @returns {Observable<SuccessMessageClass>}
   * @memberof AgentBuilderService
   */
  agents_uninstall(agent: AgentInterface): Observable<SuccessMessageClass> {
    return this.httpClient_.post<SuccessMessageInterface>(environment.AGENT_BUILDER_SERVICE_AGENTS_UNINSTALL, agent)
      .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('agents uninstall', error)));
  }

  /**
   * REST call to POST agent uninstall
   *
   * @param {AgentTargetInterface} agent_target
   * @returns {Observable<SuccessMessageClass>}
   * @memberof AgentBuilderService
   */
  agent_uninstall(agent_target: AgentTargetInterface): Observable<SuccessMessageClass> {
    return this.httpClient_.post<SuccessMessageInterface>(environment.AGENT_BUILDER_SERVICE_AGENTS_UNINSTALL, agent_target)
      .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('agent uninstall', error)));
  }

  /**
   * REST call to POST agent reinstall
   *
   * @param {AgentTargetInterface} agent_target
   * @returns {Observable<SuccessMessageClass>}
   * @memberof AgentBuilderService
   */
  agent_reinstall(agent_target: AgentTargetInterface): Observable<SuccessMessageClass> {
    return this.httpClient_.post<SuccessMessageInterface>(environment.AGENT_BUILDER_SERVICE_AGENT_REINSTALL, agent_target)
      .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('agent reinstall', error)));
  }

  /**
   * REST call to GET app configs
   *
   * @returns {Observable<AppConfigClass[]>}
   * @memberof AgentBuilderService
   */
  get_app_configs(): Observable<AppConfigClass[]> {
    return this.httpClient_.get<AppConfigInterface[]>(environment.AGENT_BUILDER_SERVICE_AGENT_CONFIGS)
      .pipe(map((response: AppConfigInterface[]) => response.map((ac: AppConfigInterface) => new AppConfigClass(ac))),
            catchError((error: HttpErrorResponse) => this.handleError('get app configs', error)));
  }

  /**
   * REST call to get app config content
   *
   * @param config_type
   * @returns
   */
  get_config_content(config_name: string, config_type: string): Observable<any> {
    return this.httpClient_.get<AppConfigContentInterface>(environment.AGENT_BUILDER_SERVICE_AGENT_CONFIG_CONTENT + `${config_name}/${config_type}`)
              .pipe(map((response: AppConfigContentInterface) => new AppConfigContentClass(response)),
                catchError((error: HttpErrorResponse) => this.handleError('get app configs', error)));
  }

  post_config_content(config_name: string, config_type: string, config_content: string): Observable<any> {
    return this.httpClient_.post<SuccessMessageInterface>(environment.AGENT_BUILDER_SERVICE_AGENT_CONFIG_CONTENT + `${config_name}/${config_type}`, config_content)
              .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
                catchError((error: HttpErrorResponse) => this.handleError('get app configs', error)));
  }
}
