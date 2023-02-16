import { PodStatusClass } from '../classes';

/**
 * Interface defines the Accumulator
 *
 * @export
 * @interface AccumulatorInterface
 */
export interface AccumulatorInterface {
  [ key: string ]: PodStatusClass[];
}
