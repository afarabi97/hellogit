import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EntityConfig } from '../../interfaces';
import { ApiService } from '../../services/abstract/api.service';
import { HealthDashboardStatusClass } from '../classes/health-dashboard-status.class';
import { HealthDashboardStatusServiceInterface } from '../interfaces/service-interfaces/health-dashboard-status-service.interface';

const ENTITY_CONFIG: EntityConfig = { entityPart: '', type: 'HealthDashboardStatusService' };

@Injectable({
  providedIn: 'root'
})
export class HealthDashboardStatusService extends ApiService<any> implements HealthDashboardStatusServiceInterface {

  constructor() {
    super(ENTITY_CONFIG);
  }

  get_health_dashboard_status(): Observable<Array<HealthDashboardStatusClass>> {
    return this.httpClient_.get(environment.HEALTH_DASHBOARD_STATUS).pipe(
      catchError((error: HttpErrorResponse) => this.handleError('get elastic status', error)),
    );
  }

  get_remote_health_dashboard_status(): Observable<Array<HealthDashboardStatusClass>> {
    return this.httpClient_.get(environment.REMOTE_HEALTH_DASHBOARD_STATUS).pipe(
      catchError((error: HttpErrorResponse) => this.handleError('get elastic status', error)),
    );
  }

  get_health_dashboard_kibana_info(ipaddress: string) {
    let url = `${environment.REMOTE_HEALTH_DASHBOARD_KIBANA_INFO}/${ipaddress}`
    return this.httpClient_.get(url).pipe(
      catchError((error: HttpErrorResponse) => this.handleError('get kibana info', error)),
    );
  }
}
