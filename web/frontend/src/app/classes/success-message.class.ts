import { SuccessMessageInterface } from '../interfaces';

/**
 * Class defines the SuccessMessageClass
 *
 * @export
 * @class SuccessMessage
 * @implements {SuccessMessageInterface}
 */
export class SuccessMessageClass implements SuccessMessageInterface {
  success_message: string;

  /**
   * Creates an instance of SuccessMessage.
   *
   * @param {SuccessMessageInterface} success_message_interface
   * @memberof SuccessMessage
   */
  constructor(success_message_interface: SuccessMessageInterface) {
    this.success_message = success_message_interface.success_message;
  }
}
