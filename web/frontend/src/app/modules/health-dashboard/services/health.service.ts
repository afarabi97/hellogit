import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { EntityConfig, KitTokenInterface } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { HealthServiceInterface } from '../interfaces/service-interfaces/health-service.interface';


const entityConfig: EntityConfig = {
  entityPart: '',
  type: 'HealthService',
};

@Injectable({
  providedIn: null,
})
export class HealthService extends ApiService<any> implements HealthServiceInterface {
  constructor() {
    super(entityConfig);
  }

  get_nodes_status(remote?: KitTokenInterface): Observable<Array<Object>> {
    let url = environment.HEALTH_SERVICE_GET_NODES_STATUS;
    if (remote) {
      url = `${environment.HEALTH_SERVICE_REMOTE}/${remote.kit_token_id}/nodes/status`;
    }

    return this.httpClient_
      .get(url)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('get nodes health status', error)
        )
      );
  }

  get_pods_status(remote?: KitTokenInterface): Observable<Array<Object>> {
    let url = environment.HEALTH_SERVICE_GET_PODS_STATUS;
    if (remote) {
      url = `${environment.HEALTH_SERVICE_REMOTE}/${remote.kit_token_id}/pods/status`;
    }

    return this.httpClient_
      .get(url)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('get pods health status', error)
        )
      );
  }

  get_applications_health_status(): Observable<Array<Object>> {
    const url = environment.HEALTH_SERVICE_GET_APPLICATIONS_STATUS;

    return this.httpClient_
      .get(url)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('get applications health status', error)
        )
      );
  }

  get_snmp_data(): Observable<Array<Object>> {
    return this.httpClient_
      .get(environment.HEALTH_SERVICE_GET_SNMP_STATUS)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('get snmp data', error)
        )
      );
  }

  get_snmp_alerts(): Observable<Array<Object>> {
    return this.httpClient_
      .get(environment.HEALTH_SERVICE_GET_SNMP_ALERTS)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError('get snmp alerts', error)
        )
      );
  }

  get_datastores(): Observable<Array<Object>> {
    return this.httpClient_
      .get(environment.HEALTH_SERVICE_GET_DATASTORES)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError('get datastores', error)
        )
      );
  }

  describe_node(node_name: string): Observable<Object> {
    const url = `${environment.HEALTH_SERVICE_DESCRIBE_NODE}/${node_name}`;

    return this.httpClient_
      .get(url)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('describe node', error)
        )
      );
  }

  describe_pod(pod_name: string, namespace: string): Observable<Object> {
    const url = `${environment.HEALTH_SERVICE_DESCRIBE_POD}/${pod_name}/${namespace}`;

    return this.httpClient_
      .get(url)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          this.handleError('describe pod', error)
        )
      );
  }

  pod_logs(pod_name: string, namespace: string): Observable<Object> {
    const url = `${environment.HEALTH_SERVICE_POD_LOGS}/${pod_name}/${namespace}`;

    return this.httpClient_
    .get(url)
    .pipe(
      catchError((error: HttpErrorResponse) =>
        this.handleError('pod logs', error)
      )
    );
  }

  write_rejects(remote?: KitTokenInterface):Observable<Array<Object>> {
    let url = `${environment.HEALTH_SERVICE_WRITE_REJECTS}`;
    if (remote) {
      url = `${environment.HEALTH_SERVICE_WRITE_REJECTS}/remote/${remote.ipaddress}`;
    }
    return this.httpClient_
    .get(url)
    .pipe(
      catchError((error: HttpErrorResponse) =>
        this.handleError('elasticsearch write rejects', error)
      )
    );
  }

  zeek_pckt_stats(remote?: KitTokenInterface):Observable<Array<Object>> {
    let url = `${environment.HEALTH_SERVICE_APP}/zeek/packets`;
    if (remote) {
      url = `${environment.HEALTH_SERVICE_APP}/zeek/packets/remote/${remote.ipaddress}`;
    }
    return this.httpClient_
    .get(url)
    .pipe(
      catchError((error: HttpErrorResponse) =>
        this.handleError('zeek packets', error)
      )
    );
  }

  suricata_pckt_stats(remote?: KitTokenInterface):Observable<Array<Object>> {
    let url = `${environment.HEALTH_SERVICE_APP}/suricata/packets`;
    if (remote) {
      url = `${environment.HEALTH_SERVICE_APP}/suricata/packets/remote/${remote.ipaddress}`;
    }
    return this.httpClient_
    .get(url)
    .pipe(
      catchError((error: HttpErrorResponse) =>
        this.handleError('suricata packets', error)
      )
    );
  }
}
