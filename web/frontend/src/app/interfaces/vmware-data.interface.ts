/**
 * Interface defines the VMWare Data
 *
 * @export
 * @interface VmwareDataInterface
 */
export interface VMWareDataInterface {
  portgroups: string[];
  datacenters: string[];
  datastores: string[];
  folders: string[];
  clusters: string[];
}
