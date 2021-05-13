import { SystemVersionInterface } from '../interfaces';

/**
 * Class defines the system version
 *
 * @export
 * @class SystemVersionClass
 * @implements {SystemVersionInterface}
 */
export class SystemVersionClass implements SystemVersionInterface {
  version: string;
  commit_hash: string;
  build_date: string;

  /**
   * Creates an instance of SystemVersionClass.
   *
   * @param {SystemVersionInterface} system_version_interface
   * @memberof SystemVersionClass
   */
  constructor(system_version_interface: SystemVersionInterface){
    this.version = system_version_interface.version;
    this.commit_hash = system_version_interface.commit_hash.substring(0, 8);
    this.build_date = system_version_interface.build_date;
  }
}
