/**
 * Interface defines the Element Spec
 *
 * @export
 * @interface ElementSpecInterface
 */
export interface ElementSpecInterface {
  name: string;
  type: string;
  description?: string;
  default_value?: string | boolean;
  required?: boolean;
  regexp?: string;
  error_message?: string;
  label?: string;
  placeholder?: string;
}
