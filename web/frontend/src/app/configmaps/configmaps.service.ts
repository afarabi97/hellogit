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
    const url = '/api/get_config_maps';
    return this.http.get(url).pipe();
  }

  getAssociatedPods(config_map_name: string): Observable<Object>{
    const url = `/api/get_associated_pods/${config_map_name}`
    return this.http.get(url).pipe();
  }

  getConfigMap(namespace: string,
               config_name: string,
               data_name: string): Observable<Object>{
    const url = `/api/get_config_map/${namespace}/${config_name}/${data_name}`;
    return this.http.get(url).pipe();
  }

  saveConfigMap(configMap: Object, associatedPods: Array<{podName:string, namespace: string}>=[]): Observable<Object> {
    const url = '/api/save_config_map';
    let payload = {configMap: configMap, associatedPods: associatedPods}
    return this.http.post(url, payload, HTTP_OPTIONS).pipe();
  }

  deleteConfigMap(namespace: string, name: string): Observable<Object> {
    const url = `/api/delete_config_map/${namespace}/${name}`;
    return this.http.delete(url).pipe();
  }

  createConfigMap(configMap: Object) {
    const url = '/api/create_config_map';
    return this.http.post(url, configMap, HTTP_OPTIONS).pipe();
  }
}
