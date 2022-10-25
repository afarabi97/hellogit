/**
 * Interface defines the Alert List Hits
 *
 * @export
 * @interface AlertListHitsInterface
 */
export interface AlertListHitsInterface {
  total: {
    value: number;
    relation: string;
  };
  max_score: number;
  hits: Object[];
}
