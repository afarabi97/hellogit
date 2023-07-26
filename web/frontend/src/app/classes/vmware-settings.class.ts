import { VMWareSettingsInterface } from '../interfaces';

/**
 * Class defines the VMWare Settings
 *
 * @export
 * @class VMWareSettingsClass
 * @implements {VMWareSettingsInterface}
 */
export class VMWareSettingsClass implements VMWareSettingsInterface {
  _id: string;
  ip_address: string;
  username: string;
  password: string;
  datastore: string;
  vcenter: boolean;
  folder: string;
  datacenter: string;
  portgroup: string;
  cluster: string;

  /**
   * Creates an instance of VMWareSettingsClass.
   *
   * @param {VMWareSettingsInterface} vmwareSettingsInterface
   * @memberof VMWareSettingsClass
   */
  constructor(vmwareSettingsInterface: VMWareSettingsInterface) {
    this._id = vmwareSettingsInterface._id;
    this.ip_address = vmwareSettingsInterface.ip_address;
    this.username = vmwareSettingsInterface.username;
    this.password = vmwareSettingsInterface.password;
    this.datastore = vmwareSettingsInterface.datastore;
    this.vcenter = vmwareSettingsInterface.vcenter;
    this.folder = vmwareSettingsInterface.folder;
    this.datacenter = vmwareSettingsInterface.datacenter;
    this.portgroup = vmwareSettingsInterface.portgroup;
    this.cluster = vmwareSettingsInterface.cluster;
  }
}
