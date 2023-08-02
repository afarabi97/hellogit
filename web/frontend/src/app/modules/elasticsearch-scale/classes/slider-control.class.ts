import { ObjectUtilitiesClass } from '../../../classes';
import { SLIDER_PROGRAMMING_ERROR_TITLE } from '../constants/elasticsearch-scale.constant';
import { NodeTitleEnum } from '../enums/node-title.enum';
import { ElasticsearchNodeClass } from './elasticsearch-node.class';

/**
 * Class defines the slider control
 *
 * @export
 * @class SliderControlClass
 */
export class SliderControlClass {
  title: string;
  type: string;
  current_count: number;
  min_count: number;
  max_count: number;
  max_node_count_per: number;
  hidden: boolean;

  /**
   * Creates an instance of SliderControlClass.
   *
   * @param {string} type
   * @param {ElasticsearchNodeClass} elasticsearch_node
   * @memberof SliderControlClass
   */
  constructor(type: string, elasticsearch_node: ElasticsearchNodeClass) {
    const max_scale_count_by_type: string = `max_scale_count_${type}`;

    this.type = type;
    this.title = ObjectUtilitiesClass.notUndefNull(NodeTitleEnum[type]) ?
      NodeTitleEnum[type] : SLIDER_PROGRAMMING_ERROR_TITLE;
    this.current_count = ObjectUtilitiesClass.notUndefNull(elasticsearch_node) &&
                         ObjectUtilitiesClass.notUndefNull(elasticsearch_node[type]) ?
      elasticsearch_node[type] : 0;
    this.min_count = 1;
    this.max_count = ObjectUtilitiesClass.notUndefNull(elasticsearch_node) &&
                     ObjectUtilitiesClass.notUndefNull(elasticsearch_node[max_scale_count_by_type]) ?
      elasticsearch_node[max_scale_count_by_type] : 0;
    this.hidden = this.current_count === 0;
  }
}
