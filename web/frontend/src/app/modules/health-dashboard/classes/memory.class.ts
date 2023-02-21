import { MemoryInterface } from '../interfaces';

/**
 * Class defines the Memory
 *
 * @export
 * @class MemoryClass
 * @implements {MemoryInterface}
 */
export class MemoryClass implements MemoryInterface {
  available: number;
  percent: number;

  /**
   * Creates an instance of MemoryClass.
   *
   * @param {MemoryInterface} memory_interface
   * @memberof MemoryClass
   */
  constructor(memory_interface: MemoryInterface) {
    this.available = memory_interface.available;
    this.percent = memory_interface.percent;
  }
}
