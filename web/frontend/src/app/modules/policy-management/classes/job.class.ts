import { JobInterface } from "../interfaces";

/**
 * Class defines the job
 *
 * @export
 * @class JobClass
 * @implements {JobInterface}
 */
export class JobClass implements JobInterface {
  job_id: string;
  redis_key: string;
  created_at: string;
  enqueued_at: string;
  started_at: string;
  ended_at: string;
  origin: string;
  description: string;
  timeout: number;
  status: string;
  ttl: string;
  result_ttl: number;
  queued_position: number;

  /**
   * Creates an instance of JobClass.
   *
   * @param {JobInterface} job_interface
   * @memberof JobClass
   */
  constructor(job_interface: JobInterface) {
    this.job_id = job_interface.job_id;
    this.redis_key = job_interface.redis_key;
    this.created_at = job_interface.created_at;
    this.enqueued_at = job_interface.enqueued_at;
    this.started_at = job_interface.started_at;
    this.ended_at = job_interface.ended_at;
    this.origin = job_interface.origin;
    this.description = job_interface.description;
    this.timeout = job_interface.timeout;
    this.status = job_interface.status;
    this.ttl = job_interface.ttl;
    this.result_ttl = job_interface.result_ttl;
    this.queued_position = job_interface.queued_position;
  }
}
