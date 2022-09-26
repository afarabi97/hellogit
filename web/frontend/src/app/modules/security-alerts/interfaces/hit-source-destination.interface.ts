/**
 * Interface defines the Hit Source Destination
 *
 * @export
 * @interface HitSourceDestinationInterface
 */
export interface HitSourceDestinationInterface {
  address: string;
  port: number;
  ip: string;
  bytes?: number;
  packets?: number;
}
