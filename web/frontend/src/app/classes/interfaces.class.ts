import { InterfacesInterface } from '../interfaces';

/**
 * Class defines the interfaces
 *
 * @export
 * @class InterfacesClass
 */
export class InterfacesClass implements InterfacesInterface {
  ip_address: string;
  mac_address: string;
  name: string;
  speed: number;

  /**
   * Creates an instance of InterfacesClass.
   *
   * @param {InterfacesInterface} interfacesInterface
   * @memberof InterfacesClass
   */
  constructor(interfacesInterface: InterfacesInterface) {
    this.ip_address = interfacesInterface.ip_address;
    this.mac_address = interfacesInterface.mac_address;
    this.name = interfacesInterface.name;
    this.speed = interfacesInterface.speed;
  }
}
