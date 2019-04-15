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
}