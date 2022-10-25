/**
 * Interface defines the Update Alerts
 *
 * @export
 * @interface UpdateAlertsInterface
 */
export interface UpdateAlertsInterface {
  count: number;
  'event.module': string;
  'event.kind': string;
  'rule.name': string;
  'source.address'?: string;
  'source.ip'?: string;
  'source.port'?: string;
  'destination.port'?: string;
  'destination.address'?: string;
  'destination.ip'?: string;
  '@timestamp'?: string;
}
