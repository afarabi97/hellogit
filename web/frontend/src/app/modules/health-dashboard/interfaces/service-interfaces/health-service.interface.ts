import { Observable } from 'rxjs';

import { KitTokenInterface } from '../../../../interfaces';
import {
  DatastoreClass,
  DescribePodNodeClass,
  ElasticsearchObjectClass,
  NodeStatusClass,
  PacketStatsClass,
  PodLogClass,
  PodStatusClass
} from '../../classes';

/**
 * Interface defines the Health Service
 *
 * @export
 * @interface HealthServiceInterface
 */
export interface HealthServiceInterface {
  get_datastores(): Observable<DatastoreClass[]>;
  write_rejects(kit_token?: KitTokenInterface): Observable<ElasticsearchObjectClass[]>;
  zeek_pckt_stats(kit_token?: KitTokenInterface): Observable<PacketStatsClass[]>;
  suricata_pckt_stats(kit_token?: KitTokenInterface): Observable<PacketStatsClass[]>;
  get_nodes_status(kit_token?: KitTokenInterface): Observable<NodeStatusClass[]>;
  get_pods_status(kit_token?: KitTokenInterface): Observable<PodStatusClass[]>;
  describe_node(node_name: string): Observable<DescribePodNodeClass>;
  describe_pod(pod_name: string, namespace: string): Observable<DescribePodNodeClass>;
  pod_logs(pod_name: string, namespace: string): Observable<PodLogClass[]>;
}
