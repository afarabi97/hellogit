import { ElasticsearchNodeDataReturnInterface } from './elasticsearch-node-data-return.interface';

/**
 * Interface defines the elasticsearch node data
 *
 * @export
 * @interface ElasticsearchNodeDataInterface
 * @extends {ElasticsearchNodeDataReturnInterface}
 */
export interface ElasticsearchNodeDataInterface extends ElasticsearchNodeDataReturnInterface {
  max_scale_count_coordinating: number;
  max_scale_count_data: number;
  max_scale_count_master: number;
  max_scale_count_ml: number;
  server_node_count: number;
}
