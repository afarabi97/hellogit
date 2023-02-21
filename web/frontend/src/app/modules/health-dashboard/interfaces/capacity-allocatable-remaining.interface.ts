/**
 * Interface defines the Capacity Allocatable Remaining
 *
 * @export
 * @interface CapacityAllocatableRemainingInterface
 */
export interface CapacityAllocatableRemainingInterface {
  cpu: string;
  "ephermeral-storage"?: string;
  memory: string;
  pods?: string;
}
