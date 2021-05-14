import { ElasticsearchCheckInterface } from "../interfaces";

/**
 * Class defines the elasticsearch check
 *
 * @export
 * @class ElasticsearchCheckClass
 * @implements {ElasticsearchCheckInterface}
 */
export class ElasticsearchCheckClass implements ElasticsearchCheckInterface {
  status: string;

  /**
   * Creates an instance of ElasticsearchCheckClass.
   *
   * @param {ElasticsearchCheckInterface} elasticsearch_check_interface
   * @memberof ElasticsearchCheckClass
   */
  constructor(elasticsearch_check_interface: ElasticsearchCheckInterface) {
    this.status = elasticsearch_check_interface.status;
  }
}
