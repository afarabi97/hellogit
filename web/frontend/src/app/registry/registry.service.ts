import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RegistryService {

  constructor(private http: HttpClient) { }

  getDockerRegistry(){    
    const url = '/api/get_docker_registry';
    return this.http.get(url).pipe();
  }
}