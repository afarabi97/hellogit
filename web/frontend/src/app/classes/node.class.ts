import { JobInterface, NodeInterface } from '../interfaces';
import { DeviceFactsClass } from './device-facts.class';
import { JobClass } from './job.class';
import { ObjectUtilitiesClass } from './object-utilities.class';
import { StatusClass } from './status.class';

/**
 * Class defines the node
 *
 * @export
 * @class NodeClass
 */
export class NodeClass implements NodeInterface {
  _id?: string;
  boot_drives: string[];
  data_drives: string[];
  deployment_name?: string;
  deployment_type: string;
  deviceFacts: DeviceFactsClass;
  hostname: string;
  ip_address: string;
  is_remote?: boolean;
  jobs?: JobClass[];
  mac_address: string;
  node_type: string;
  os_raid: boolean;
  os_raid_root_size: number;
  pxe_type: string;
  raid_drives: string[];
  virtual_cpu: number;
  virtual_data: number;
  virtual_mem: number;
  virtual_os: number;
  vpn_status: string | null;
  isDeployed?: boolean;
  isRemoving?: boolean;
  status?: StatusClass;

  /**
   * Creates an instance of NodeClass.
   *
   * @param {NodeInterface} node_interface
   * @memberof NodeClass
   */
  constructor(node_interface: NodeInterface) {
    this._id = node_interface._id;
    this.boot_drives = node_interface.boot_drives;
    this.data_drives = node_interface.data_drives;
    this.deployment_name = node_interface.deployment_name;
    this.deployment_type = node_interface.deployment_type;
    this.hostname = node_interface.hostname;
    this.ip_address = node_interface.ip_address;
    this.is_remote = node_interface.is_remote;
    this.mac_address = node_interface.mac_address;
    this.node_type = node_interface.node_type;
    this.os_raid = node_interface.os_raid;
    this.os_raid_root_size = node_interface.os_raid_root_size;
    this.pxe_type = node_interface.pxe_type;
    this.raid_drives = node_interface.raid_drives;
    this.virtual_cpu = node_interface.virtual_cpu;
    this.virtual_data = node_interface.virtual_data;
    this.virtual_mem = node_interface.virtual_mem;
    this.virtual_os = node_interface.virtual_os;
    this.vpn_status = node_interface.vpn_status;

    if (ObjectUtilitiesClass.notUndefNull(node_interface.jobs)) {
      this.jobs = node_interface.jobs.map((j: JobInterface) => new JobClass(j));
    }
    if (Object.keys(node_interface.deviceFacts).length > 0) {
      this.deviceFacts = new DeviceFactsClass(node_interface.deviceFacts);
    }
  }
}
