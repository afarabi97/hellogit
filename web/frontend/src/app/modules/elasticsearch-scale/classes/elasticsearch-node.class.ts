import { ElasticsearchNodeInterface } from '../interfaces';
import { ElasticsearchNodeReturnClass } from './elasticsearch-node-return.class';

/**
 * Class defines the elasticsearch node
 *
 * @export
 * @class ElasticsearchNodeClass
 * @extends {ElasticsearchNodeReturnClass}
 * @implements {ElasticsearchNodeInterface}
 */
export class ElasticsearchNodeClass extends ElasticsearchNodeReturnClass implements ElasticsearchNodeInterface {
  max_scale_count_data: number;
  max_scale_count_master: number;
  max_scale_count_ml: number;
  max_scale_count_ingest: number;
  server_node_count: number;

  /**
   * Creates an instance of ElasticsearchNodeClass.
   *
   * @param {ElasticsearchNodeInterface} elasticsearch_node_interface
   * @memberof ElasticsearchNodeClass
   */
  constructor(elasticsearch_node_interface: ElasticsearchNodeInterface) {
    super(elasticsearch_node_interface);

    this.max_scale_count_data = elasticsearch_node_interface.max_scale_count_data;
    this.max_scale_count_master = elasticsearch_node_interface.max_scale_count_master;
    this.max_scale_count_ml = elasticsearch_node_interface.max_scale_count_ml;
    this.max_scale_count_ingest = elasticsearch_node_interface.max_scale_count_ingest;
    this.server_node_count = elasticsearch_node_interface.server_node_count;
  }
}
