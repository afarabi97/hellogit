/**
 * Interface defines the job
 *
 * @export
 * @interface JobInterface
 */
export interface JobInterface {
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
}
