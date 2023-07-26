import { VMWareDataInterface } from '../interfaces';

/**
 * Class defines the VMWare Data
 *
 * @export
 * @class VMWareDataClass
 * @implements {VMWareDataInterface}
 */
export class VMWareDataClass implements VMWareDataInterface {
  portgroups: string[];
  datacenters: string[];
  datastores: string[];
  folders: string[];
  clusters: string[];

  /**
   * Creates an instance of VMWareDataClass.
   *
   * @param {VMWareDataInterface} vmwareDataInterface
   * @memberof VMWareDataClass
   */
  constructor(vmwareDataInterface: VMWareDataInterface) {
    this.portgroups = vmwareDataInterface.portgroups;
    this.datacenters = vmwareDataInterface.datacenters;
    this.datastores = vmwareDataInterface.datastores;
    this.folders = vmwareDataInterface.folders;
    this.clusters = vmwareDataInterface.clusters;
  }
}
