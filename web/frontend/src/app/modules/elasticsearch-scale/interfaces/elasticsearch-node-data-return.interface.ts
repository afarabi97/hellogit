/**
 * Interface defines the elasticsearch node return
 *
 * @export
 * @interface ElasticsearchNodeDataReturnInterface
 */
export interface ElasticsearchNodeDataReturnInterface {
  data: number;
  master: number;
  ml: number;
  ingest: number;
}
