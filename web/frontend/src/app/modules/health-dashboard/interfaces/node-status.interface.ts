import { CapacityAllocatableRemainingInterface } from './capacity-allocatable-remaining.interface';
import { MemoryInterface } from './memory.interface';
import { StorageInterface } from './storage.interface';

/**
 * Interface defines the Node Status
 *
 * @export
 * @interface NodeStatusInterface
 */
export interface NodeStatusInterface {
  name: string;
  address: string;
  ready: boolean;
  type: string;
  storage?: StorageInterface[] | null;
  memory?: MemoryInterface | null;
  cpu?: number | null;
  capacity: CapacityAllocatableRemainingInterface;
  allocatable: CapacityAllocatableRemainingInterface;
  remaining: CapacityAllocatableRemainingInterface;
  node_info: {
    architecture: string;
    boot_id: string;
    container_runtime_version: string;
    kernel_version: string;
    kube_proxy_version: string;
    kubelet_version: string;
    machine_id: string;
    operating_system: string;
    os_image: string;
    system_uuid: string;
  };
}
