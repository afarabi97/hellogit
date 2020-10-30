import { VersionInterface } from '../interfaces';

/**
 * Class defines the version
 *
 * @export
 * @class VersionClass
 * @implements {VersionInterface}
 */
export class VersionClass implements VersionInterface {
  version: string;
  commit_hash: string;
  build_date: string;

  /**
   * Creates an instance of VersionClass.
   *
   * @param {VersionInterface} versionInterface
   * @memberof VersionClass
   */
  constructor(versionInterface: VersionInterface){
    this.version = versionInterface.version;
    this.commit_hash = versionInterface.commit_hash.substring(0, 8);
    this.build_date = versionInterface.build_date;
  }
}
