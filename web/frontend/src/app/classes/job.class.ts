import { JobInterface } from '../interfaces';

/**
 * Class defines the Job
 *
 * @export
 * @class JobClass
 * @implements {JobInterface}
 */
export class JobClass implements JobInterface {
  complete: boolean;
  description: string;
  error: boolean;
  exec_type: string;
  inprogress: boolean;
  job_id: string;
  message: boolean;
  name: string;
  node_id: string;
  pending: boolean;
  _id: string;

  /**
   * Creates an instance of JobClass.
   *
   * @param {JobInterface} job_interface
   * @memberof JobClass
   */
  constructor(job_interface: JobInterface) {
    this._id = job_interface._id;
    this.complete = job_interface.complete;
    this.description = job_interface.description;
    this.error = job_interface.error;
    this.exec_type = job_interface.exec_type;
    this.inprogress = job_interface.inprogress;
    this.job_id = job_interface.job_id;
    this.message = job_interface.message;
    this.name = job_interface.name;
    this.node_id = job_interface.node_id;
    this.pending = job_interface.pending;
  }
}
