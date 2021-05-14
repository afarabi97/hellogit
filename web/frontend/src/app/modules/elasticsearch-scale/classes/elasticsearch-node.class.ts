import { ElasticsearchNodeInterface } from '../interfaces';
import { ElasticsearchNodeDataClass } from './elasticsearch-node-data.class';

/**
 * Class defines the elasticsearch node
 *
 * @export
 * @class ElasticsearchNodeClass
 * @implements {ElasticsearchNodeInterface}
 */
export class ElasticsearchNodeClass implements ElasticsearchNodeInterface {
  elastic: ElasticsearchNodeDataClass;

  /**
   * Creates an instance of ElasticsearchNodeClass.
   *
   * @param {ElasticsearchNodeInterface} elasticsearch_node_interface
   * @memberof ElasticsearchNodeClass
   */
  constructor(elasticsearch_node_interface: ElasticsearchNodeInterface) {
    this.elastic = elasticsearch_node_interface.elastic;
  }
}
