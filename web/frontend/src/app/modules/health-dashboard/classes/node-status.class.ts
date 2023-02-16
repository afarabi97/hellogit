import { ObjectUtilitiesClass } from '../../../classes';
import { NodeStatusInterface, StorageInterface } from '../interfaces';
import { CapacityAllocatableRemainingClass } from './capacity-allocatable-remaining.class';
import { ElasticsearchObjectClass } from './elasticsearch-object.class';
import { MemoryClass } from './memory.class';
import { PacketStatsClass } from './packet-stats.class';
import { StorageClass } from './storage.class';

/**
 * Class defines the Node Status
 *
 * @export
 * @class NodeStatusClass
 * @implements {NodeStatusInterface}
 */
export class NodeStatusClass implements NodeStatusInterface {
  name: string;
  address: string;
  ready: boolean;
  type: string;
  storage?: StorageClass[] | null;
  memory?: MemoryClass | null;
  cpu?: number | null;
  capacity: CapacityAllocatableRemainingClass;
  allocatable: CapacityAllocatableRemainingClass;
  remaining: CapacityAllocatableRemainingClass;
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
  app_data?: PacketStatsClass[];
  write_rejects?: ElasticsearchObjectClass[];

  /**
   * Creates an instance of NodeStatusClass.
   *
   * @param {NodeStatusInterface} node_status_interface
   * @memberof NodeStatusClass
   */
  constructor(node_status_interface: NodeStatusInterface) {
    this.name = node_status_interface.name;
    this.address = node_status_interface.address;
    this.ready = node_status_interface.ready;
    this.type = node_status_interface.type;
    this.capacity = new CapacityAllocatableRemainingClass(node_status_interface.capacity);
    this.allocatable = new CapacityAllocatableRemainingClass(node_status_interface.allocatable);
    this.remaining = new CapacityAllocatableRemainingClass(node_status_interface.remaining);
    this.node_info = node_status_interface.node_info;

    if (ObjectUtilitiesClass.notUndefNull(node_status_interface.storage)) {
      this.storage = node_status_interface.storage.map((s: StorageInterface) => new StorageClass(s));
    } else {
      this.storage = null;
    }

    if (ObjectUtilitiesClass.notUndefNull(node_status_interface.memory)) {
      this.memory = new MemoryClass(node_status_interface.memory);
    } else {
      this.memory = null;
    }

    if (ObjectUtilitiesClass.notUndefNull(node_status_interface.cpu)) {
      this.cpu = node_status_interface.cpu;
    } else {
      this.cpu = null;
    }
  }
}
