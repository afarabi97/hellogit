import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HTTP_OPTIONS } from '../globals';

@Injectable({
  providedIn: 'root'
})
export class ConfigmapsService {

  constructor(private http: HttpClient) { }

  getConfigMaps(): Observable<Object> {
    const url = '/api/configmaps';
    return this.http.get(url).pipe();
  }

  getAssociatedPods(config_map_name: string): Observable<Object>{
    const url = `/api/associated/pods/${config_map_name}`
    return this.http.get(url).pipe();
  }

  getConfigMap(namespace: string,
               config_name: string,
               data_name: string): Observable<Object>{
    const url = `/api/configmap/data/${namespace}/${config_name}/${data_name}`;
    return this.http.get(url).pipe();
  }

  saveConfigMap(configMap: Object, associatedPods: Array<{podName:string, namespace: string}>=[]): Observable<Object> {
    const url = '/api/configmap';
    const payload = {configMap: configMap, associatedPods: associatedPods}
    return this.http.put(url, payload, HTTP_OPTIONS).pipe();
  }

  deleteConfigMap(namespace: string, name: string): Observable<Object> {
    const url = `/api/configmap/${namespace}/${name}`;
    return this.http.delete(url).pipe();
  }

  createConfigMap(configMap: Object) {
    const url = '/api/configmap';
    return this.http.post(url, configMap, HTTP_OPTIONS).pipe();
  }
}
