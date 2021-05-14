import { ElasticsearchNodeDataInterface } from '../interfaces';
import { ElasticsearchNodeDataReturnClass } from './elasticsearch-node-data-return.class';

/**
 * Class defines the elasticsearch node data
 *
 * @export
 * @class ElasticsearchNodeDataClass
 * @extends {ElasticsearchNodeDataReturnClass}
 * @implements {ElasticsearchNodeDataInterface}
 */
export class ElasticsearchNodeDataClass extends ElasticsearchNodeDataReturnClass implements ElasticsearchNodeDataInterface {
  max_scale_count_coordinating: number;
  max_scale_count_data: number;
  max_scale_count_master: number;
  max_scale_count_ml: number;
  server_node_count: number;

  /**
   * Creates an instance of ElasticsearchNodeDataClass.
   *
   * @param {ElasticsearchNodeDataInterface} elasticsearch_node_data_interface
   * @memberof ElasticsearchNodeDataClass
   */
  constructor(elasticsearch_node_data_interface: ElasticsearchNodeDataInterface) {
    super(elasticsearch_node_data_interface);

    this.max_scale_count_coordinating = elasticsearch_node_data_interface.max_scale_count_coordinating;
    this.max_scale_count_data = elasticsearch_node_data_interface.max_scale_count_data;
    this.max_scale_count_master = elasticsearch_node_data_interface.max_scale_count_master;
    this.max_scale_count_ml = elasticsearch_node_data_interface.max_scale_count_ml;
    this.server_node_count = elasticsearch_node_data_interface.server_node_count;
  }
}
