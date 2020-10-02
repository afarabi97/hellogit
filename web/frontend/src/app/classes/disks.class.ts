import { DisksInterface } from '../interfaces';

/**
 * Class defines the disks
 *
 * @export
 * @class DisksClass
 */
export class DisksClass implements DisksInterface {
  has_root: boolean;
  name: string;
  size_gb: number;
  size_tb: number;

  /**
   * Creates an instance of DisksClass.
   *
   * @param {DisksInterface} disksInterface
   * @memberof DisksClass
   */
  constructor(disksInterface: DisksInterface) {
    this.has_root = disksInterface.has_root;
    this.name = disksInterface.name;
    this.size_gb = disksInterface.size_gb;
    this.size_tb = disksInterface.size_tb;
  }
}
