import { SystemNameInterface } from "../interfaces";

/**
 * Class defines system name
 *
 * @export
 * @class SystemNameClass
 * @implements {SystemNameInterface}
 */
export class SystemNameClass implements SystemNameInterface {
  system_name: string;

  /**
   * Creates an instance of SystemNameClass.
   *
   * @param {SystemNameInterface} systemNameInterface
   * @memberof SystemNameClass
   */
  constructor(systemNameInterface: SystemNameInterface) {
    this.system_name = systemNameInterface.system_name;
  }
}
