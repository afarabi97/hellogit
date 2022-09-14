import { JobLogInterface } from '../interfaces';

/**
 * Class defines the Job Log
 *
 * @export
 * @class JobLogClass
 * @implements {JobLogInterface}
 */
export class JobLogClass implements JobLogInterface {
  color: string;
  jobName: string;
  jobid: string;
  log: string;

  /**
   * Creates an instance of JobLogClass.
   *
   * @param {JobLogInterface} job_log_interface
   * @memberof JobLogClass
   */
  constructor(job_log_interface: JobLogInterface) {
    this.color = job_log_interface.color;
    this.jobName = job_log_interface.jobName;
    this.jobid = job_log_interface.jobid;
    this.log = job_log_interface.log;
  }
}
