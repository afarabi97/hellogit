import { PackageInterface } from '../interfaces';

/**
 * Class defines the Package
 *
 * @export
 * @class PackageClass
 * @implements {PackageInterface}
 */
export class PackageClass implements PackageInterface {
  [ key: string ]: any

  /**
   * Creates an instance of PackageClass.
   *
   * @param {PackageInterface} package_interface
   * @memberof PackageClass
   */
  constructor(package_interface: PackageInterface) {
    const interface_keys: string[] = Object.keys(package_interface);

    interface_keys.forEach((k: string) => {
      this[k] = package_interface[k];
    });
  }
}
