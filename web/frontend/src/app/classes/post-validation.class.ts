import { PostValidationInterface } from '../interfaces';

/**
 * Class defines the Post Validation
 *
 * @export
 * @class PostValidationClass
 * @implements {PostValidationInterface}
 */
export class PostValidationClass implements PostValidationInterface {
  post_validation: string[] | object;

  /**
   * Creates an instance of PostValidationClass.
   *
   * @param {PostValidationInterface} post_validation_interface
   * @memberof PostValidationClass
   */
  constructor(post_validation_interface: PostValidationInterface) {
    this.post_validation = post_validation_interface.post_validation;
  }
}
