import { Observable } from 'rxjs';

import { SuccessMessageClass } from '../../../../classes';
import {
  ElasticsearchCheckClass,
  ElasticsearchConfigurationClass,
  ElasticsearchNodeClass,
  ElasticsearchNodeReturnClass,
} from '../../classes';

/**
 * Interface defines the elasticsearch service
 *
 * @export
 * @interface ElasticsearchServiceInterface
 */
export interface ElasticsearchServiceInterface {
  get_elastic_nodes(): Observable<ElasticsearchNodeClass>;
  post_elastic_nodes(elasticsearch_node_return: ElasticsearchNodeReturnClass): Observable<SuccessMessageClass>;
  get_elastic_full_config(): Observable<ElasticsearchConfigurationClass>;
  post_elastic_full_config(elasticsearch_configuration: ElasticsearchConfigurationClass): Observable<SuccessMessageClass>;
  deploy_elastic(): Observable<void>;
  check_elastic(): Observable<ElasticsearchCheckClass>;
}
