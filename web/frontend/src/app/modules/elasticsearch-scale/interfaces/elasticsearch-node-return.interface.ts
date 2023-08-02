/**
 * Interface defines the elasticsearch node return
 *
 * @export
 * @interface ElasticsearchNodeReturnInterface
 */
export interface ElasticsearchNodeReturnInterface {
  data: number;
  master: number;
  ml: number;
  ingest: number;
}
