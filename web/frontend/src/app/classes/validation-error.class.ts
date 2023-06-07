import { ValidationErrorInterface } from '../interfaces';

/**
 * Class defines the Validation Error
 *
 * @export
 * @class ValidationErrorClass
 * @implements {ValidationErrorInterface}
 */
export class ValidationErrorClass implements ValidationErrorInterface {
  status: string;
  messages: Object;

  /**
   * Creates an instance of ValidationErrorClass.
   *
   * @param {ValidationErrorInterface} validation_error_interface
   * @memberof ValidationErrorClass
   */
  constructor(validation_error_interface: ValidationErrorInterface) {
    this.status = validation_error_interface.status;
    this.messages = validation_error_interface.messages;
  }
}
