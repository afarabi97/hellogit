import { ElementSpecInterface } from '../interfaces';

/**
 * Class defines the Element Spec
 *
 * @export
 * @class ElementSpecClass
 * @implements {ElementSpecInterface}
 */
export class ElementSpecClass implements ElementSpecInterface {
  name: string;
  type: string;
  description?: string;
  default_value?: string;
  required?: boolean;
  regexp?: string;
  error_message?: string;
  label?: string;
  placeholder?: string;

  /**
   * Creates an instance of ElementSpecClass.
   *
   * @param {ElementSpecInterface} element_spec_interface
   * @memberof ElementSpecClass
   */
  constructor(element_spec_interface: ElementSpecInterface) {
    this.name = element_spec_interface.name;
    this.type = element_spec_interface.type;
    this.description = element_spec_interface.description;
    this.default_value = element_spec_interface.default_value;
    this.required = element_spec_interface.required;
    this.regexp = element_spec_interface.regexp;
    this.error_message = element_spec_interface.error_message;
    this.label = element_spec_interface.label;
    this.placeholder = element_spec_interface.placeholder;
  }
}
