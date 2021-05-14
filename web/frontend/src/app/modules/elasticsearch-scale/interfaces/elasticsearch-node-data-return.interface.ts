/**
 * Interface defines the elasticsearch node return
 *
 * @export
 * @interface ElasticsearchNodeDataReturnInterface
 */
export interface ElasticsearchNodeDataReturnInterface {
  coordinating: number;
  data: number;
  master: number;
  ml: number;
}
