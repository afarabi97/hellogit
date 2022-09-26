/**
 * Interface defines the Hit Source Source
 *
 * @export
 * @interface HitSourceSourceInterface
 */
export interface HitSourceSourceInterface {
  address: string;
  port: number;
  ip: string;
  bytes?: number;
  packets?: number;
}
