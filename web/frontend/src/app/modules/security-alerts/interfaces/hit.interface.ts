import { HitSourceInterface } from './hit-source.interface';

/**
 * Interface defines the Hit
 *
 * @export
 * @interface HitInterface
 */
export interface HitInterface {
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: HitSourceInterface;
}
