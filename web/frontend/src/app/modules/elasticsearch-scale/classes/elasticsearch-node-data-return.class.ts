import { ElasticsearchNodeDataReturnInterface } from "../interfaces";

/**
 * Class defines the elasticsearch node data return
 *
 * @export
 * @class ElasticsearchNodeDataReturnClass
 * @implements {ElasticsearchNodeDataReturnInterface}
 */
export class ElasticsearchNodeDataReturnClass implements ElasticsearchNodeDataReturnInterface {
  data: number;
  master: number;
  ml: number;
  ingest: number;

  /**
   * Creates an instance of ElasticsearchNodeDataReturnClass.
   *
   * @param {ElasticsearchNodeDataReturnInterface} elasticsearch_node_data_return_interface
   * @memberof ElasticsearchNodeDataReturnClass
   */
  constructor(elasticsearch_node_data_return_interface: ElasticsearchNodeDataReturnInterface) {
    this.data = elasticsearch_node_data_return_interface.data;
    this.master = elasticsearch_node_data_return_interface.master;
    this.ml = elasticsearch_node_data_return_interface.ml;
    this.ingest = elasticsearch_node_data_return_interface.ingest;
  }
}
