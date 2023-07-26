/**
 * Interface defines the CMWare Settings
 *
 * @export
 * @interface VMWareSettingsInterface
 */
export interface VMWareSettingsInterface {
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
}
