import { ElasticsearchNodeReturnInterface } from './elasticsearch-node-return.interface';

/**
 * Interface defines the elasticsearch node
 *
 * @export
 * @interface ElasticsearchNodeInterface
 * @extends {ElasticsearchNodeReturnInterface}
 */
export interface ElasticsearchNodeInterface extends ElasticsearchNodeReturnInterface {
  max_scale_count_data: number;
  max_scale_count_master: number;
  max_scale_count_ml: number;
  max_scale_count_ingest: number;
  server_node_count: number;
}
