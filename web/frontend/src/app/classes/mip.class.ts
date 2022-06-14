import { JobInterface, MIPInterface } from '../interfaces';
import { JobClass } from './job.class';

/**
 * Class defines the MIP
 *
 * @export
 * @class MIPClass
 * @implements {MIPInterface}
 */
export class MIPClass implements MIPInterface {
  _id: string;
  hostname: string;
  ip_address: string;
  mac_address: string;
  pxe_type: boolean;
  jobs: JobClass[];

  /**
   * Creates an instance of MIPClass.
   *
   * @param {MIPInterface} mip_interface
   * @memberof MIPClass
   */
  constructor(mip_interface: MIPInterface) {
    this._id = mip_interface._id;
    this.hostname = mip_interface.hostname;
    this.ip_address = mip_interface.ip_address;
    this.mac_address = mip_interface.mac_address;
    this.pxe_type = mip_interface.pxe_type;
    this.jobs = mip_interface.jobs.map((job: JobInterface) => new JobClass(job));
  }
}
