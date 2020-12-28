import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';


@Injectable({
  providedIn: 'root'
})
export class HealthServiceService {

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  getHealthStatus(): Observable<Object> {
    const url = '/api/health/status';
    return this.http.get(url).pipe();
  }

  getPipelineStatus(): Observable<Object> {
    const url = '/api/pipeline/status';
    return this.http.get(url).pipe();
  }

  describePod(podName: string, namespace: string): Observable<Object> {
    const url = `/api/pod/describe/${podName}/${namespace}`
    return this.http.get(url).pipe();
  }

  podLogs(podName: string, namespace: string): Observable<Object> {
    const url = `/api/pod/logs/${podName}/${namespace}`
    return this.http.get(url).pipe();
  }

  describeNode(nodeName: string): Observable<Object> {
    const url = `/api/node/describe/${nodeName}`
    return this.http.get(url).pipe();
  }

  displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

}
