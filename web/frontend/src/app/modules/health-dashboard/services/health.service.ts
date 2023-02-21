import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { ObjectUtilitiesClass } from '../../../classes';
import { EntityConfig, KitTokenInterface } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import {
  DatastoreClass,
  DescribePodNodeClass,
  ElasticsearchObjectClass,
  NodeStatusClass,
  PacketStatsClass,
  PodLogClass,
  PodStatusClass
} from '../classes';
import {
  DatastoreInterface,
  DescribePodNodeInterface,
  ElasticsearchObjectInterface,
  HealthServiceInterface,
  NodeStatusInterface,
  PacketStatsInterface,
  PodLogInterface,
  PodStatusInterface
} from '../interfaces';

const entityConfig: EntityConfig = { entityPart: '', type: 'HealthService' };

/**
 * Service used to make health related api calls
 *
 * @export
 * @class HealthService
 * @extends {ApiService<any>}
 * @implements {HealthServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class HealthService extends ApiService<any> implements HealthServiceInterface {

  /**
   * Creates an instance of HealthService.
   *
   * @memberof HealthService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET datastores
   *
   * @return {Observable<DatastoreClass[]>}
   * @memberof HealthService
   */
  get_datastores(): Observable<DatastoreClass[]> {
    return this.httpClient_.get<DatastoreInterface[]>(environment.HEALTH_SERVICE_GET_DATASTORES)
                           .pipe(map((response: DatastoreInterface[]) => response.map((d: DatastoreInterface) => new DatastoreClass(d))),
                                 catchError((error: HttpErrorResponse) => this.handleError('get datastores', error)));
  }

  /**
   * REST call to GET elasticsearch write rejects
   *
   * @param {KitTokenInterface} [kit_token]
   * @return {Observable<ElasticsearchObjectClass[]>}
   * @memberof HealthService
   */
  write_rejects(kit_token?: KitTokenInterface):Observable<ElasticsearchObjectClass[]> {
    const url: string = ObjectUtilitiesClass.notUndefNull(kit_token) ?
                          `${environment.HEALTH_SERVICE_WRITE_REJECTS}/remote/${kit_token.ipaddress}` : environment.HEALTH_SERVICE_WRITE_REJECTS;

    return this.httpClient_.get<ElasticsearchObjectInterface[]>(url)
                           .pipe(map((response: ElasticsearchObjectInterface[]) => response.map((elasticsearch_object: ElasticsearchObjectInterface) => new ElasticsearchObjectClass(elasticsearch_object))),
                                 catchError((error: HttpErrorResponse) => this.handleError('elasticsearch write rejects', error)));
  }

  /**
   * REST call to GET zeek packt stats
   *
   * @param {KitTokenInterface} [kit_token]
   * @return {Observable<PacketStatsClass[]>}
   * @memberof HealthService
   */
  zeek_pckt_stats(kit_token?: KitTokenInterface):Observable<PacketStatsClass[]> {
    const url: string = ObjectUtilitiesClass.notUndefNull(kit_token) ?
                          `${environment.HEALTH_SERVICE_APP}/zeek/packets/remote/${kit_token.ipaddress}` : `${environment.HEALTH_SERVICE_APP}/zeek/packets`;

    return this.httpClient_.get<PacketStatsInterface[]>(url)
                           .pipe(map((response: PacketStatsInterface[]) => response.map((packet_stat: PacketStatsInterface) => new PacketStatsClass(packet_stat))),
                                 catchError((error: HttpErrorResponse) => this.handleError('zeek pckt stats', error)));
  }

  /**
   * REST call to GET suricata packt stats
   *
   * @param {KitTokenInterface} [kit_token]
   * @return {Observable<PacketStatsClass[]>}
   * @memberof HealthService
   */
  suricata_pckt_stats(kit_token?: KitTokenInterface):Observable<PacketStatsClass[]> {
    const url: string = ObjectUtilitiesClass.notUndefNull(kit_token) ?
                          `${environment.HEALTH_SERVICE_APP}/suricata/packets/remote/${kit_token.ipaddress}` : `${environment.HEALTH_SERVICE_APP}/suricata/packets`;

    return this.httpClient_.get<PacketStatsInterface[]>(url)
                           .pipe(map((response: PacketStatsInterface[]) => response.map((packet_stat: PacketStatsInterface) => new PacketStatsClass(packet_stat))),
                                 catchError((error: HttpErrorResponse) => this.handleError('suricata pckt stats', error)));
  }

  /**
   * REST call to GET nodes status
   *
   * @param {KitTokenInterface} [kit_token]
   * @return {Observable<NodeStatusClass[]>}
   * @memberof HealthService
   */
  get_nodes_status(kit_token?: KitTokenInterface): Observable<NodeStatusClass[]> {
    const url: string = ObjectUtilitiesClass.notUndefNull(kit_token) ?
                          `${environment.HEALTH_SERVICE_REMOTE}/${kit_token.kit_token_id}/nodes/status` : environment.HEALTH_SERVICE_GET_NODES_STATUS;

    return this.httpClient_.get<NodeStatusInterface[]>(url)
                           .pipe(map((response: NodeStatusInterface[]) => response.map((node_status: NodeStatusInterface) => new NodeStatusClass(node_status))),
                                 catchError((error: HttpErrorResponse) => this.handleError('get nodes status', error)));
  }

  /**
   * REST call to GET pods status
   *
   * @param {KitTokenInterface} [kit_token]
   * @return {Observable<PodStatusClass[]>}
   * @memberof HealthService
   */
  get_pods_status(kit_token?: KitTokenInterface): Observable<PodStatusClass[]> {
    const url: string = ObjectUtilitiesClass.notUndefNull(kit_token) ?
                          `${environment.HEALTH_SERVICE_REMOTE}/${kit_token.kit_token_id}/pods/status` : environment.HEALTH_SERVICE_GET_PODS_STATUS;

    return this.httpClient_.get<PodStatusInterface[]>(url)
                           .pipe(map((response: PodStatusInterface[]) => response.map((pod_status: PodStatusInterface) => new PodStatusClass(pod_status))),
                                 catchError((error: HttpErrorResponse) => this.handleError('get pods status', error)));
  }

  /**
   * REST call to GET describe node
   *
   * @param {string} node_name
   * @return {Observable<DescribePodNodeClass>}
   * @memberof HealthService
   */
  describe_node(node_name: string): Observable<DescribePodNodeClass> {
    const url: string = `${environment.HEALTH_SERVICE_DESCRIBE_NODE}/${node_name}`;

    return this.httpClient_.get<DescribePodNodeInterface>(url)
                           .pipe(map((response: DescribePodNodeInterface) => new DescribePodNodeClass(response)),
                                 catchError((error: HttpErrorResponse) => this.handleError('describe node', error)));
  }

  /**
   * REST call to GET describe pod
   *
   * @param {string} pod_name
   * @param {string} namespace
   * @return {Observable<DescribePodNodeClass>}
   * @memberof HealthService
   */
  describe_pod(pod_name: string, namespace: string): Observable<DescribePodNodeClass> {
    const url: string = `${environment.HEALTH_SERVICE_DESCRIBE_POD}/${pod_name}/${namespace}`;

    return this.httpClient_.get<DescribePodNodeInterface>(url)
                           .pipe(map((response: DescribePodNodeInterface) => new DescribePodNodeClass(response)),
                                 catchError((error: HttpErrorResponse) => this.handleError('describe pod', error)));
  }

  /**
   * REST call to GET pod logs
   *
   * @param {string} pod_name
   * @param {string} namespace
   * @return {Observable<PodLogClass[]>}
   * @memberof HealthService
   */
  pod_logs(pod_name: string, namespace: string): Observable<PodLogClass[]> {
    const url: string = `${environment.HEALTH_SERVICE_POD_LOGS}/${pod_name}/${namespace}`;

    return this.httpClient_.get<PodLogInterface[]>(url)
                           .pipe(map((response: PodLogInterface[]) => response.map((pod_log: PodLogInterface) => new PodLogClass(pod_log))),
                                 catchError((error: HttpErrorResponse) => this.handleError('pod logs', error)));
  }
}
