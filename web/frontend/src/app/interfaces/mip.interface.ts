import { JobInterface } from './job.interface';

/**
 * Interface defines the MIP
 *
 * @export
 * @interface MIPInterface
 */
export interface MIPInterface {
  _id: string;
  hostname: string;
  ip_address: string;
  mac_address: string;
  pxe_type: boolean;
  jobs: JobInterface[];
}
