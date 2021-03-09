import { ErrorMessageInterface } from '../interfaces';

/**
 * Class defines the ErrorMessageClass
 *
 * @export
 * @class ErrorMessageClass
 * @implements {ErrorMessageInterface}
 */
export class ErrorMessageClass implements ErrorMessageInterface {
  error_message: string;

  /**
   * Creates an instance of ErrorMessageClass.
   *
   * @param {ErrorMessageInterface} error_message_interface
   * @memberof ErrorMessageClass
   */
  constructor(error_message_interface: ErrorMessageInterface) {
    this.error_message = error_message_interface.error_message;
  }
}
