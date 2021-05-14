import { ElasticsearchConfigurationInterface } from "../interfaces";

/**
 * Class defines the elasticsearch configuration
 *
 * @export
 * @class ElasticsearchConfigurationClass
 * @implements {ElasticsearchConfigurationInterface}
 */
export class ElasticsearchConfigurationClass implements ElasticsearchConfigurationInterface {
  elastic: string;

  /**
   * Creates an instance of ElasticsearchConfigurationClass.
   *
   * @param {ElasticsearchConfigurationInterface} elasticsearch_configuration_interface
   * @memberof ElasticsearchConfigurationClass
   */
  constructor(elasticsearch_configuration_interface: ElasticsearchConfigurationInterface) {
    this.elastic = elasticsearch_configuration_interface.elastic;
  }
}
