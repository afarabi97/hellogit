import { BackgroundJobInterface } from '../interfaces';

/**
 * Class defines the Background Job
 *
 * @export
 * @class BackgroundJobClass
 * @implements {BackgroundJobInterface}
 */
export class BackgroundJobClass implements BackgroundJobInterface {
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
  meta: string;
  worker_name: string;

  /**
   * Creates an instance of BackgroundJonClass.
   *
   * @param {BackgroundJobInterface} background_job_interface
   * @memberof BackgroundJonClass
   */
  constructor(background_job_interface: BackgroundJobInterface) {
    this.job_id = background_job_interface.job_id;
    this.redis_key = background_job_interface.redis_key;
    this.created_at = background_job_interface.created_at;
    this.enqueued_at = background_job_interface.enqueued_at;
    this.started_at = background_job_interface.started_at;
    this.ended_at = background_job_interface.ended_at;
    this.origin = background_job_interface.origin;
    this.description = background_job_interface.description;
    this.timeout = background_job_interface.timeout;
    this.status = background_job_interface.status;
    this.ttl = background_job_interface.ttl;
    this.result_ttl = background_job_interface.result_ttl;
    this.queued_position = background_job_interface.queued_position;
    this.meta = background_job_interface.meta;
    this.worker_name = background_job_interface.worker_name;
  }
}
