import { ElasticsearchObjectInterface } from '../interfaces';

/**
 * Class defines the Elasticsearch Object
 *
 * @export
 * @class ElasticsearchObjectClass
 * @implements {ElasticsearchObjectInterface}
 */
export class ElasticsearchObjectClass implements ElasticsearchObjectInterface {
  node_name: string;
  name: string;
  active: string;
  queue: string;
  rejected: string;

  /**
   * Creates an instance of ElasticsearchObjectClass.
   *
   * @param {ElasticsearchObjectInterface} elasticsearch_object_interface
   * @memberof ElasticsearchObjectClass
   */
  constructor(elasticsearch_object_interface: ElasticsearchObjectInterface) {
    this.node_name = elasticsearch_object_interface.node_name;
    this.name = elasticsearch_object_interface.name;
    this.active = elasticsearch_object_interface.active;
    this.queue = elasticsearch_object_interface.queue;
    this.rejected = elasticsearch_object_interface.rejected;
  }
}
