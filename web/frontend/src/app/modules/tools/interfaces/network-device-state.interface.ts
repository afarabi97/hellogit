/**
 * Interface defines the Network Device State
 *
 * @export
 * @interface NetworkDeviceStateInterface
 * @extends {IFACEStateInterface}
 */
export interface NetworkDeviceStateInterface {
  node: string;
  device: string;
  state: string;
  link_up: boolean;
}
