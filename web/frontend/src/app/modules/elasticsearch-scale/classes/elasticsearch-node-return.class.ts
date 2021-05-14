import { ElasticsearchNodeReturnInterface } from '../interfaces';
import { ElasticsearchNodeDataReturnClass } from './elasticsearch-node-data-return.class';

/**
 * Class defines the elasticsearch node return
 *
 * @export
 * @class ElasticsearchNodeReturnClass
 * @implements {ElasticsearchNodeReturnInterface}
 */
export class ElasticsearchNodeReturnClass implements ElasticsearchNodeReturnInterface {
  elastic: ElasticsearchNodeDataReturnClass;

  /**
   * Creates an instance of ElasticsearchNodeReturnClass.
   *
   * @param {ElasticsearchNodeReturnInterface} elasticsearch_node_return_interface
   * @memberof ElasticsearchNodeReturnClass
   */
  constructor(elasticsearch_node_return_interface: ElasticsearchNodeReturnInterface) {
    this.elastic = elasticsearch_node_return_interface.elastic;
  }
}
