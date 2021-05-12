import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { SystemHealthServiceInterface } from '../interfaces/service-interfaces/system-health-service.interface';
import { ApiService } from '../../services/abstract/api.service';
import { EntityConfig } from '../../interfaces';

import { HealthStatusClass } from '../classes';
import { HealthStatusInterface } from '../interfaces';

const entityConfig: EntityConfig = { entityPart: '', type: 'HealthServiceService' };

@Injectable({
  providedIn: 'root'
})
export class SystemHealthService extends ApiService<any> implements SystemHealthServiceInterface {

  constructor() {
    super(entityConfig);
  }

  getHealthStatus(): Observable<HealthStatusClass> {
    return this.httpClient_.get<HealthStatusInterface>(environment.SYSTEM_HEALTH_SERVICE_GET_HEALTH_STATUS).pipe(
      map(data => new HealthStatusClass(data)),
      catchError((error: HttpErrorResponse) => this.handleError('get health status', error))
    );
  }

  getPipelineStatus(): Observable<Object> {
    return this.httpClient_.get(environment.SYSTEM_HEALTH_SERVICE_GET_PIPELINE_STATUS);
  }

  describePod(pod_name: string, namespace: string): Observable<Object> {
    const url = `${environment.SYSTEM_HEALTH_SERVICE_DESCRIBE_POD}/${pod_name}/${namespace}`
    return this.httpClient_.get(url).pipe(catchError((error: HttpErrorResponse) => this.handleError('describe pod', error)));
  }

  podLogs(pod_name: string, namespace: string): Observable<Object> {
    const url = `${environment.SYSTEM_HEALTH_SERVICE_POD_LOGS}/${pod_name}/${namespace}`
    return this.httpClient_.get(url).pipe(catchError((error: HttpErrorResponse) => this.handleError('pod logs', error)));
  }

  describeNode(node_name: string): Observable<Object> {
    const url = `${environment.SYSTEM_HEALTH_SERVICE_DESCRIBE_NODE}/${node_name}`
    return this.httpClient_.get(url).pipe(catchError((error: HttpErrorResponse) => this.handleError('describe node', error)));
  }
}
