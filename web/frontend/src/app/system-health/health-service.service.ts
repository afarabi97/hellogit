import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HealthServiceService {

  constructor(private http: HttpClient) { }

  performSystemsCheck(): Observable<Object> {
    const url = '/api/perform_systems_check';
    return this.http.get(url).pipe();
  }

  getHealthStatus(): Observable<Object> {
    const url = '/api/get_health_status';
    return this.http.get(url).pipe();
  }
  
  describePod(podName: string, namespace: string): Observable<Object> {
    const url = `/api/describe_pod/${podName}/${namespace}`    
    return this.http.get(url).pipe();
  }

  describeNode(nodeName: string): Observable<Object> {
    const url = `/api/describe_node/${nodeName}`
    return this.http.get(url).pipe();
  }
  
}

