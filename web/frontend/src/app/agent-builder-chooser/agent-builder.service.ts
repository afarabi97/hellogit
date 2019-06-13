import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';

export const HTTP_OPTIONS = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

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

  constructor(host: Host){
    this.hostname = host.hostname;
    this.state = host.state;
    this.last_state_change = host.last_state_change;
  }
}

export class WindowsCreds {
  user_name: string;
  password: string;

  constructor(obj: Object){
    this.user_name = obj['user_name'];
    this.password = obj['password']
  }
}

export class IpTargetList {
  _id: string;
  name: string;
  domain_name: string;
  dns_server: string;
  key_controller: string;
  admin_server: string;
  targets: Array<Host> = new Array<Host>();

  constructor(configs: IpTargetList) {
    this.targets = new Array<Host>();
    if (configs){
      this._id = configs._id;
      this.name = configs.name;
      this.domain_name = configs.domain_name;
      this.dns_server = configs.dns_server;
      this.key_controller = configs.key_controller;
      this.admin_server = configs.admin_server;

      if (configs.targets){
        for (let host of configs.targets){
          this.targets.push(new Host(host))
        }
      }
    } else {
      this._id = "";
      this.name = "";
      this.domain_name = "";
      this.dns_server = "";
      this.key_controller = "";
      this.admin_server = "";
    }
  }
}

export class AgentInstallerConfig {
  _id: string;
  config_name: string;  //Name of this configuration
  install_sysmon: boolean;
  install_winlogbeat: boolean;
  install_endgame: boolean;

  winlog_beat_dest_ip: string;
  winlog_beat_dest_port: number;

  endgame_port: number;
  endgame_sensor_name: string;
  endgame_sensor_id: string;  //ID of Endgame agent installer to download from Endgame server
  endgame_password: string;

  endgame_server_ip: string;
  endgame_user_name: string;
  system_arch: string;


  constructor(obj: AgentInstallerConfig){
    this._id = obj._id;
    this.config_name = obj.config_name;
    this.winlog_beat_dest_ip = obj.winlog_beat_dest_ip;
    this.install_sysmon = obj.install_sysmon;
    this.install_winlogbeat = obj.install_winlogbeat;
    this.winlog_beat_dest_port = obj.winlog_beat_dest_port;
    this.install_endgame = obj.install_endgame;
    this.endgame_port = obj.endgame_port;
    this.endgame_sensor_name = obj.endgame_sensor_name;
    this.endgame_password = obj.endgame_password;
    this.endgame_user_name = obj.endgame_user_name;
    this.endgame_server_ip = obj.endgame_server_ip;
    this.endgame_sensor_id = obj.endgame_sensor_id;
    this.system_arch = obj.system_arch;
  }
}


@Injectable({
  providedIn: 'root'
})
export class AgentBuilderService {

  constructor(private http: HttpClient) { }

  private mapHostOrError(host: Object): Host | ErrorMessage {
    if (host["error_message"]){
      return new ErrorMessage(host as ErrorMessage);
    }
    return new Host(host as Host);
  }

  private mapIpTarget(config: Object): IpTargetList {
    return new IpTargetList(config as IpTargetList);
  }

  private mapInstallConfig(config: Object): AgentInstallerConfig {
    return new AgentInstallerConfig(config as AgentInstallerConfig);
  }

  private mapIPTargets(configs: Object): Array<IpTargetList> {
    let ipTarget = new Array<IpTargetList>();
    for (let config of configs as Array<Object>){
      ipTarget.push(this.mapIpTarget(config));
    }
    return ipTarget;
  }

  private mapIPTargetOrError(config: Object): IpTargetList | ErrorMessage {
    if (config["error_message"]){
      return new ErrorMessage(config as ErrorMessage);
    }
    return this.mapIpTarget(config);
  }

  private mapInstallConfigs(configs: Object): Array<AgentInstallerConfig> {
    let installConfigs = new Array<AgentInstallerConfig>();
    for (let config of configs as Array<Object>){
      installConfigs.push(this.mapInstallConfig(config));
    }
    return installConfigs;
  }

  private mapSuccessOrError(something: Object): SuccessMessage | ErrorMessage {
    if (something["error_message"]){
        return new ErrorMessage(something as ErrorMessage);
    }
    return new SuccessMessage(something as SuccessMessage);
}

  getAgentInstaller(payload: Object) : Observable<any> {
    let url = '/api/generate_windows_installer';
    return this.http.post(url, payload, { responseType: 'blob' }).pipe();
  }

  saveConfig(payload) : Observable<Array<AgentInstallerConfig>> {
    let url = '/api/save_agent_installer_config';
    return this.http.post(url, payload).pipe(
      map(data => this.mapInstallConfigs(data as Array<Object>))
    );
  }

  deleteConfig(payload) : Observable<Array<AgentInstallerConfig>> {
    let url = '/api/delete_agent_installer_config/' + payload;
    return this.http.delete(url).pipe(
      map(data => this.mapInstallConfigs(data as Array<Object>))
    );
  }

  getSavedConfigs() : Observable<Array<AgentInstallerConfig>> {
    let url = '/api/get_agent_installer_configs'
    return this.http.get(url).pipe(
      map(data => this.mapInstallConfigs(data as Array<Object>))
    );
  }

  getIpTargetList(): Observable<Array<IpTargetList>> {
    let url = '/api/get_agent_installer_target_lists';
    return this.http.get(url).pipe(
      map(data => this.mapIPTargets(data as Array<Object>))
    );
  }

  saveIpTargetList(payload: IpTargetList): Observable<Array<IpTargetList>> {
    let url = '/api/save_agent_installer_target_list';
    return this.http.post(url, payload).pipe(
      map(data => this.mapIPTargets(data as Array<Object>))
    );
  }

  addHostToIPTargetList(target_config_id: string, host: Object) : Observable<IpTargetList | ErrorMessage> {
    let url = `/api/add_host/${target_config_id}`;

    return this.http.post(url, host, HTTP_OPTIONS).pipe(
      map(data => this.mapIPTargetOrError(data))
    );
  }

  removeHostFromIpTargetList(target_id: string, host: Host): Observable<SuccessMessage | ErrorMessage> {
    let url = `/api/delete_host/${target_id}`;
    return this.http.post(url, host, HTTP_OPTIONS).pipe(
      map(data => this.mapSuccessOrError(data))
    );
  }

  deleteIpTargetList(payload: string): Observable<Array<IpTargetList>> {
    let url = '/api/delete_agent_installer_target_list/' + payload;
    return this.http.delete(url).pipe(
      map(data => this.mapIPTargets(data as Array<Object>))
    );
  }

  installAgents(payload: {'installer_config': AgentInstallerConfig,
                          'target_config': IpTargetList,
                          'windows_domain_creds': WindowsCreds }): Observable<any> {
    let url = '/api/install_agents';
    return this.http.post(url, payload)
  }

  uninstallAgents(payload: {'installer_config': AgentInstallerConfig,
                            'target_config': IpTargetList,
                            'windows_domain_creds': WindowsCreds }): Observable<any> {
    let url = '/api/uninstall_agents';
    return this.http.post(url, payload)
  }

  uninstallAgent(payload: {'installer_config': AgentInstallerConfig,
                           'target_config': IpTargetList,
                           'windows_domain_creds': WindowsCreds },
                           target: Host): Observable<any> {
    let url = '/api/uninstall_agent';
    payload['target'] = target;
    return this.http.post(url, payload)
  }

  reinstallAgent(payload: {'installer_config': AgentInstallerConfig,
                           'target_config': IpTargetList,
                           'windows_domain_creds': WindowsCreds },
                           target: Host){
    let url = '/api/reinstall_agent';
    payload['target'] = target;
    return this.http.post(url, payload)
  }
}
