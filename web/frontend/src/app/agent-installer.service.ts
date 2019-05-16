import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs';

export interface WindowsInstallerConfigInterface {
  '_id': string,
  'config_name': string,
  'install_endgame': boolean,
  'install_sysmon': boolean,
  'install_winlogbeat': boolean,
  'pf_sense_ip': string
}

@Injectable({
  providedIn: 'root'
})
export class AgentInstallerService {

  constructor(private http: HttpClient) { }

  getAgentInstallerConfigs() : Observable<any> {
    let url = '/api/agent_installer_configs';
    return this.http.get(url).pipe();
  }

}


