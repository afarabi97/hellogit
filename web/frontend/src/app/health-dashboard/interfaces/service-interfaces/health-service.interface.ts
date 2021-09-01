import { Observable } from 'rxjs';
import { KitTokenInterface} from '../../../system-setupv2/interfaces/kit-token.interface';

export interface HealthServiceInterface {
  get_nodes_status(remote?: KitTokenInterface): Observable<Array<Object>>;
  get_pods_status(remote?: KitTokenInterface): Observable<Array<Object>>;
  get_applications_health_status(): Observable<Array<Object>>;
  get_snmp_data(): Observable<Array<Object>>;
  get_snmp_alerts(): Observable<Array<Object>>;
  get_datastores(): Observable<Array<Object>>;
  describe_node(node_name: string): Observable<Object>;
  describe_pod(pod_name: string, namespace: string): Observable<Object>;
  pod_logs(pod_name: string, namespace: string): Observable<Object>;
  write_rejects(remote?: KitTokenInterface): Observable<Array<Object>>;
  zeek_pckt_stats(remote?: KitTokenInterface): Observable<Array<Object>>;
  suricata_pckt_stats(remote?: KitTokenInterface): Observable<Array<Object>>;
}
