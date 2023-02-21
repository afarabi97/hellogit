import { StorageInterface } from '../interfaces';

/**
 * Class defines the Storage
 *
 * @export
 * @class StorageClass
 * @implements {StorageInterface}
 */
export class StorageClass implements StorageInterface {
  name: string;
  free: number;
  percent: number;

  /**
   * Creates an instance of StorageClass.
   *
   * @param {StorageInterface} storage_interface
   * @memberof StorageClass
   */
  constructor(storage_interface: StorageInterface) {
    this.name = storage_interface.name;
    this.free = storage_interface.free;
    this.percent = storage_interface.percent;
  }
}
