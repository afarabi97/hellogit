import { ElasticsearchNodeReturnInterface } from '../interfaces';

/**
 * Class defines the elasticsearch node return
 *
 * @export
 * @class ElasticsearchNodeReturnClass
 * @implements {ElasticsearchNodeReturnInterface}
 */
export class ElasticsearchNodeReturnClass implements ElasticsearchNodeReturnInterface {
  data: number;
  master: number;
  ml: number;
  ingest: number;

  /**
   * Creates an instance of ElasticsearchNodeReturnClass.
   *
   * @param {ElasticsearchNodeReturnInterface} elasticsearch_node_return_interface
   * @memberof ElasticsearchNodeReturnClass
   */
  constructor(elasticsearch_node_return_interface: ElasticsearchNodeReturnInterface) {
    this.data = elasticsearch_node_return_interface.data;
    this.master = elasticsearch_node_return_interface.master;
    this.ml = elasticsearch_node_return_interface.ml;
    this.ingest = elasticsearch_node_return_interface.ingest;
  }
}
