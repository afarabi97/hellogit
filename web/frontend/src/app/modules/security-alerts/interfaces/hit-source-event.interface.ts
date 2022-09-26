/**
 * Interface defines the Hit Source Event
 *
 * @export
 * @interface HitSourceEventInterface
 */
export interface HitSourceEventInterface {
  ingested: string;
  kind: string;
  created: string;
  module: string;
  type: string[];
  category: string[];
  dataset: string;
  id?: string;
  severity?: number;
  original?: string;
  serverity?: number;
  start?: string;
  hive_id?: number;
}
