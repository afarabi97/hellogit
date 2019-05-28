import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgentBuilderService {

  constructor(private http: HttpClient) { }

  getAgentInstaller(payload: Object) : Observable<any> {
    let url = '/api/generate_windows_installer';
    return this.http.post(url, payload, { responseType: 'blob' }).pipe();
  }

  saveConfig(payload) : Observable<any> {
    let url = '/api/save_agent_installer_config';
    return this.http.post(url, payload);
  }

  deleteConfig(payload) : Observable<any> {
    let url = '/api/delete_agent_installer_config/' + payload;
    return this.http.delete(url);
  }

  getSavedConfigs() : Observable<any> {
    let url = '/api/get_agent_installer_configs'
    return this.http.get(url);
  }

  getIpTargetList() : Observable<any> {
    let url = '/api/get_agent_installer_target_lists';
    return this.http.get(url);
  }

  saveIpTargetList(payload: IpTargetList): Observable<any> {
    let url = '/api/save_agent_installer_target_list';
    console.log('Service, saving:', payload);
    return this.http.post(url, payload)
  }

  deleteIpTargetList(payload: string): Observable<any> {
    let url = '/api/delete_agent_installer_target_list/' + payload;
    return this.http.delete(url);
  }
}

export class IpTargetList {
  name: string = "";
  targets: Array<string> = new Array<string>();
}

export interface AgentInstallerConfig {
  config_name: string;  //Name of this configuration
  pfsense_ip: string;   //PFSense Firewall IP address

  install_sysmon: boolean;  

  install_winlogbeat: boolean;
  winlogbeat_port: number;
  winlogbeat_arch: string;

  install_endgame: boolean;
  endgame_port: number;
  endgame_sensor_name: string;
  endgame_sensor_id: string;  //ID of Endgame agent installer to download from Endgame server

}