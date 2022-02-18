import { IFACEStateInterface } from '../interfaces';

/**
 * Class defines the IFACE State
 *
 * @export
 * @class IFACEStateClass
 * @implements {IFACEStateInterface}
 */
export class IFACEStateClass implements IFACEStateInterface {
  name: string;
  state: string;
  link_up: boolean;

  /**
   * Creates an instance of IFACEStateClass.
   *
   * @param {IFACEStateInterface} iface_state
   * @memberof IFACEStateClass
   */
  constructor(iface_state: IFACEStateInterface) {
    this.name = iface_state.name;
    this.state = iface_state.state;
    this.link_up = iface_state.link_up;
  }
}
