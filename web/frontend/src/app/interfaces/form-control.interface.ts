/**
 * Interface defines the Form Control
 *
 * @export
 * @interface FormControlInterface
 */
export interface FormControlInterface {
  default_value?: string;
  description?: string;
  error_message?: string;
  falseValue?: string;
  regexp?: string;
  required?: boolean;
  name: string;
  trueValue?: string;
  type: string;
  dependent_app?: string;
}
