import { CapacityAllocatableRemainingInterface } from '../interfaces';

/**
 * Class defines the Capacity Allocatable Remaining
 *
 * @export
 * @class CapacityAllocatableRemainingClass
 * @implements {CapacityAllocatableRemainingInterface}
 */
export class CapacityAllocatableRemainingClass implements CapacityAllocatableRemainingInterface {
  cpu: string;
  "ephermeral-storage"?: string;
  memory: string;
  pods?: string;

  /**
   * Creates an instance of CapacityAllocatableRemainingClass.
   *
   * @param {CapacityAllocatableRemainingInterface} capacity_allocatable_remaining_interface
   * @memberof CapacityAllocatableRemainingClass
   */
  constructor(capacity_allocatable_remaining_interface: CapacityAllocatableRemainingInterface) {
    this.cpu = capacity_allocatable_remaining_interface.cpu;
    this['ephermeral-storage'] = capacity_allocatable_remaining_interface['ephermeral-storage'];
    this.memory = capacity_allocatable_remaining_interface.memory;
    this.pods = capacity_allocatable_remaining_interface.pods;
  }
}
