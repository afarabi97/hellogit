/**
 * Interface defines the Hit Source Event
 *
 * @export
 * @interface HitSourceEventInterface
 */
export interface HitSourceEventInterface {
  kind: string;
  module: string;
  ingested?: string;
  created?: string;
  type?: string[];
  category?: string[];
  dataset?: string;
  id?: string;
  severity?: number;
  original?: string;
  serverity?: number;
  start?: string;
  hive_id?: number;
}
