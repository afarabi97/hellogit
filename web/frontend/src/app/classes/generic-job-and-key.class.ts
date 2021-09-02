import { GenericJobAndKeyInterface } from '../interfaces';

/**
 * Class defines the Generic Job and Key
 *
 * @export
 * @class GenericJobAndKeyClass
 * @implements {GenericJobAndKeyInterface}
 */
export class GenericJobAndKeyClass implements GenericJobAndKeyInterface {
  job_id: string;
  redis_key: string;

  /**
   * Creates an instance of GenericJobAndKeyClass.
   *
   * @param {GenericJobAndKeyInterface} generic_job_and_key_interface
   * @memberof GenericJobAndKeyClass
   */
  constructor(generic_job_and_key_interface: GenericJobAndKeyInterface) {
    this.job_id = generic_job_and_key_interface.job_id;
    this.redis_key = generic_job_and_key_interface.redis_key;
  }
}
