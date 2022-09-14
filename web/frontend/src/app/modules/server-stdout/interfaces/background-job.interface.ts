/**
 * Interface defines the Backgound Job
 *
 * @export
 * @interface BackgroundJobInterface
 */
export interface BackgroundJobInterface {
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
}
