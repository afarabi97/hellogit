import { Observable } from 'rxjs';
import { HealthStatusClass } from '../../classes';

/**
 * Interface defines the PolicyManagementService
 *
 * @export
 * @interface SystemHealthServiceInterface
 */
export interface SystemHealthServiceInterface {
  getHealthStatus(): Observable<HealthStatusClass>;
  getPipelineStatus(): Observable<Object>;
  describePod(podName: string, namespace: string): Observable<Object>;
  podLogs(podName: string, namespace: string): Observable<Object>;
  describeNode(nodeName: string): Observable<Object>;
}
