import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ResponseContentType } from '@angular/http';
import { Observable, of } from 'rxjs';
import { HTTP_OPTIONS } from './globals';

@Injectable({
  providedIn: 'root'
})
export class AgentBuilderService {

  constructor(private http: HttpClient) { }

  getAgentInstaller(payload: Object) : Observable<any> {
    //{pf_sense_ip: "172.16.77.22", winlogbeat_port: "5044", grr_port: "8080", isGrrInstalled: false}
    let url = '/api/generate_windows_installer';
    return this.http.post(url, payload, { responseType: 'blob' }).pipe();
  }
}

