import { IFACEStateInterface } from '../../../interfaces';

/**
 * Interface defines the Initial Device State
 *
 * @export
 * @interface InitialDeviceStateInterface
 */
export interface InitialDeviceStateInterface {
  node: string;
  interfaces: IFACEStateInterface[];
}
