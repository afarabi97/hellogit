import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { StatusClass } from '../classes';
import { HTTP_OPTIONS } from '../constants/cvah.constants';
import { EntityConfig } from '../interfaces';
import { ApiService } from '../services/abstract/api.service';

export class ErrorMessage {
  error_message: string;

  constructor(error: ErrorMessage){
    this.error_message = error.error_message;
  }
}

export class SuccessMessage {
  success_message: string;

  constructor(msg: SuccessMessage){
    this.success_message = msg.success_message;
  }
}

export class Host {
  hostname: string;
  state: string;
  last_state_change: string;
  target_config_id: string;

  constructor(host: Host, config_id: string){
    this.hostname = host.hostname;
    this.state = host.state;
    this.last_state_change = host.last_state_change;
    this.target_config_id = config_id;
  }
}

export class WindowsCreds {
  user_name: string;
  password: string;

  constructor(obj: Object){
    this.user_name = obj['user_name'];
    this.password = obj['password'];
  }
}

export class Kerberos {
  domain_name: string;
  key_controller: string;
  admin_server: string;
  port: string;

  constructor(configs: Kerberos) {
    if (configs){
      this.domain_name = configs.domain_name;
      this.key_controller = configs.key_controller;
      this.admin_server = configs.admin_server;
      this.port = configs.port;
    } else {
      this.domain_name = '';
      this.key_controller = '';
      this.admin_server = '';
      this.port = '';
    }
  }
}

export class Ntlm {
  domain_name: string;
  is_ssl: boolean;
  port: string;

  constructor(ntlm: Ntlm) {
    if (ntlm){
      this.is_ssl = ntlm.is_ssl;
      this.port = ntlm.port;
      this.domain_name = ntlm.domain_name;
    } else {
      this.is_ssl = false;
      this.port = '';
      this.domain_name = '';
    }
  }
}

export class SMB {
  domain_name: string;
  port: string;

  constructor(smb: SMB) {
    if (smb){
      this.port = smb.port;
      this.domain_name = smb.domain_name;
    } else {
      this.port = '';
      this.domain_name = '';
    }
  }
}

export class IpTargetList {
  _id: string;
  name: string;
  protocol: string;
  ntlm: Ntlm;
  kerberos: Kerberos;
  smb: SMB;
  targets: Host[] = [];

  constructor(configs: IpTargetList) {
    this.targets = [];
    if (configs){
      this._id = configs._id;
      this.name = configs.name;
      this.protocol = configs.protocol;
      this.ntlm = new Ntlm(configs.ntlm);
      this.kerberos = new Kerberos(configs.kerberos);
      this.smb = new SMB(configs.smb);

      if (configs.targets){
        for (const host of configs.targets){
          this.targets.push(new Host(host, this._id));
        }
      }
    } else {
      this._id = '';
      this.name = '';
      this.protocol = '';
      this.ntlm = new Ntlm(null);
      this.kerberos = new Kerberos(null);
      this.smb = new SMB(null);
    }
  }
}

export class AgentInstallerConfig {
  _id: string;
  config_name: string;  //Name of this configuration

  install_endgame: boolean;

  endgame_port: number;
  endgame_sensor_name: string;
  endgame_sensor_id: string;  //ID of Endgame agent installer to download from Endgame server
  endgame_password: string;

  endgame_server_ip: string;
  endgame_user_name: string;

  customPackages: Array<{
    name: {[key: string]: any};
  }>;

  constructor(obj: AgentInstallerConfig){
    this._id = obj._id;
    this.config_name = obj.config_name;
    this.install_endgame = obj.install_endgame;
    this.endgame_port = obj.endgame_port;
    this.endgame_sensor_name = obj.endgame_sensor_name;
    this.endgame_password = obj.endgame_password;
    this.endgame_user_name = obj.endgame_user_name;
    this.endgame_server_ip = obj.endgame_server_ip;
    this.endgame_sensor_id = obj.endgame_sensor_id;
    this.customPackages = obj.customPackages;
  }
}

export interface AppConfig {
  name: string;
  form: FormSpec;
}

export type FormSpec = Array<ElementSpec>;

export interface ElementSpec {
  name: string;
  type: string;
  description?: string;
  default_value?: string;
  required?: boolean;
  regexp?: string;
  error_message?: string;
  label?: string;
  placeholder?: string;
}

const entityConfig: EntityConfig = { entityPart: '', type: 'AgentBuilderService' };

@Injectable({
  providedIn: 'root'
})
export class AgentBuilderService extends ApiService<any> {

  constructor() {
    super(entityConfig);
  }

  getAgentInstaller(payload: Object) : Observable<any> {
    const url = '/api/agent/generate';
    return this.httpClient_.post(url, payload, { responseType: 'blob' }).pipe();
  }

  saveConfig(payload) : Observable<Array<AgentInstallerConfig>> {
    const url = '/api/agent/config';
    return this.httpClient_.post(url, payload).pipe(
      map(data => this.mapInstallConfigs(data as Array<Object>))
    );
  }

  deleteConfig(payload) : Observable<Array<AgentInstallerConfig>> {
    const url = `/api/agent/config/${payload}`;
    return this.httpClient_.delete(url).pipe(
      map(data => this.mapInstallConfigs(data as Array<Object>))
    );
  }

  getSavedConfigs() : Observable<Array<AgentInstallerConfig>> {
    const url = '/api/agent/config';
    return this.httpClient_.get(url).pipe(
      map(data => this.mapInstallConfigs(data as Array<Object>))
    );
  }

  getIpTargetList(): Observable<Array<IpTargetList>> {
    const url = '/api/agent/targets';
    return this.httpClient_.get(url).pipe(
      map(data => this.mapIPTargets(data as Array<Object>))
    );
  }

  saveIpTargetList(payload: IpTargetList): Observable<Array<IpTargetList>> {
    const url = '/api/agent/targets';
    return this.httpClient_.post(url, payload).pipe(
      map(data => this.mapIPTargets(data as Array<Object>))
    );
  }

  addHostToIPTargetList(target_config_id: string, host: Object) : Observable<IpTargetList | ErrorMessage> {
    const url = `/api/agent/host/${target_config_id}`;

    return this.httpClient_.post(url, host, HTTP_OPTIONS).pipe(
      map(data => this.mapIPTargetOrError(data))
    );
  }

  removeHostFromIpTargetList(target_id: string, host: Host): Observable<SuccessMessage | ErrorMessage> {
    const url = `/api/agent/host/${host.hostname}/${target_id}`;
    return this.httpClient_.delete(url).pipe(
      map(data => this.mapSuccessOrError(data))
    );
  }

  deleteIpTargetList(payload: string): Observable<Array<IpTargetList>> {
    const url = `/api/agent/targets/${payload}`;
    return this.httpClient_.delete(url).pipe(
      map(data => this.mapIPTargets(data as Array<Object>))
    );
  }

  installAgents(payload: {'installer_config': AgentInstallerConfig;
                          'target_config': IpTargetList;
                          'windows_domain_creds': WindowsCreds; }): Observable<any> {
    const url = '/api/agent/install';
    return this.httpClient_.post(url, payload);
  }

  uninstallAgents(payload: {'installer_config': AgentInstallerConfig;
                            'target_config': IpTargetList;
                            'windows_domain_creds': WindowsCreds; }): Observable<any> {
    const url = '/api/agent/uninstall';
    return this.httpClient_.post(url, payload);
  }

  uninstallAgent(payload: {'installer_config': AgentInstallerConfig;
                           'target_config': IpTargetList;
                           'windows_domain_creds': WindowsCreds; },
                           target: Host): Observable<any> {
    const url = '/api/agent/uninstall';
    payload['target'] = target;
    return this.httpClient_.post(url, payload);
  }

  reinstallAgent(payload: {'installer_config': AgentInstallerConfig;
                           'target_config': IpTargetList;
                           'windows_domain_creds': WindowsCreds; },
                           target: Host){
    const url = '/api/agent/reinstall';
    payload['target'] = target;
    return this.httpClient_.post(url, payload);
  }

  checkLogStashInstalled(): Observable<StatusClass[]> {
    const url = '/api/catalog/chart/logstash/status';
    return this.httpClient_.get<StatusClass[]>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('get check logstash installed', error)));
  }

  getAppConfigs(): Observable<Array<AppConfig>> {
    const url = `/api/agent/configs`;
    return this.httpClient_.get<Array<AppConfig>>(url);
  }

  private mapIpTarget(config: Object): IpTargetList {
    return new IpTargetList(config as IpTargetList);
  }

  private mapInstallConfig(config: Object): AgentInstallerConfig {
    return new AgentInstallerConfig(config as AgentInstallerConfig);
  }

  private mapIPTargets(configs: Object): Array<IpTargetList> {
    const ipTarget = new Array<IpTargetList>();
    for (const config of configs as Array<Object>){
      ipTarget.push(this.mapIpTarget(config));
    }
    return ipTarget;
  }

  private mapIPTargetOrError(config: Object): IpTargetList | ErrorMessage {
    if (config['error_message']){
      return new ErrorMessage(config as ErrorMessage);
    }
    return this.mapIpTarget(config);
  }

  private mapInstallConfigs(configs: Object): Array<AgentInstallerConfig> {
    const installConfigs = new Array<AgentInstallerConfig>();
    for (const config of configs as Array<Object>){
      installConfigs.push(this.mapInstallConfig(config));
    }
    return installConfigs;
  }

  private mapSuccessOrError(something: Object): SuccessMessage | ErrorMessage {
    if (something['error_message']){
        return new ErrorMessage(something as ErrorMessage);
    }
    return new SuccessMessage(something as SuccessMessage);
  }
}
