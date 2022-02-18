/**
 * Interface defines the Form Control
 *
 * @export
 * @interface FormControlInterface
 */
export interface FormControlInterface {
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
}
