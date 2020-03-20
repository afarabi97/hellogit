import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

export const HTTP_OPTIONS = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ESScaleServiceService {

  constructor(private http: HttpClient) { }

  postElaticNodes(podCount): Observable<Object> {
    const url = '/api/scale/elastic';
    let payload = { "elastic" : podCount };
    return this.http.post(url, payload, HTTP_OPTIONS).pipe();
  }

  getElaticNodes(): Observable<Object> {
    const url = '/api/scale/elastic/nodes';
    return this.http.get(url).pipe();
  }

  deployElastic():  Observable<Object> {
    const url = '/api/apply_elastic_deploy';
    return this.http.get(url).pipe();
  }

  checkElastic():  Observable<Object> {
    const url = '/api/scale/check';
    return this.http.get(url).pipe();
  }

  getElasticFullConfig():  Observable<Object> {
    const url = '/api/scale/elastic/advanced';
    return this.http.get(url).pipe();
  }

  postElasticFullConfig(config): Observable<Object> {
    const url = '/api/scale/elastic/advanced';
    let payload = { "elastic" : config };
    return this.http.post(url, payload, HTTP_OPTIONS).pipe();
  }

}
