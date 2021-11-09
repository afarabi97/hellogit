import { CustomPackageInterface } from '../interfaces';
import { PackageClass } from './package.class';

/**
 * Class defines the Custom Package
 *
 * @export
 * @class CustomPackageClass
 * @implements {CustomPackageInterface}
 */
 export class CustomPackageClass implements CustomPackageInterface {
  [ name: string ]: PackageClass;

  /**
   * Creates an instance of CustomPackageClass.
   *
   * @param {CustomPackageInterface} custom_package_interface
   * @memberof CustomPackageClass
   */
  constructor(custom_package_interface: CustomPackageInterface) {
    const interface_keys: string[] = Object.keys(custom_package_interface);

    interface_keys.forEach((k: string) => {
      this[k] = custom_package_interface[k];
    });
  }
}
