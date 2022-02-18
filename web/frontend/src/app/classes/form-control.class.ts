import { FormControlInterface } from '../interfaces';

/**
 * Class defines the Form Control
 *
 * @export
 * @class FormControlClass
 * @implements {FormControlInterface}
 */
export class FormControlClass implements FormControlInterface {
  default_value?: string | boolean | string[];
  dependent_app?: string;
  description?: string;
  error_message?: string;
  falseValue?: boolean | string;
  regexp?: string;
  required?: boolean;
  name: string;
  trueValue?: boolean | string;
  type: string;

  /**
   * Creates an instance of FormControlClass.
   *
   * @param {FormControlInterface} form_control_interface
   * @memberof FormControlClass
   */
  constructor(form_control_interface: FormControlInterface) {
    this.default_value = form_control_interface.default_value;
    this.dependent_app = form_control_interface.dependent_app;
    this.description = form_control_interface.description;
    this.error_message = form_control_interface.error_message;
    this.falseValue = form_control_interface.falseValue;
    this.name = form_control_interface.name;
    this.regexp = form_control_interface.regexp;
    this.required = form_control_interface.required;
    this.trueValue = form_control_interface.trueValue;
    this.type = form_control_interface.type;
  }
}
