import { AbstractControl, ValidatorFn } from '@angular/forms';

/**
 * Validator used for confirming that a second field matches intended field
 *
 * @export
 * @class ConfirmPasswordValidator
 */
export class ConfirmPasswordValidator {
  static match(control_name: string, match_control_name: string): ValidatorFn {
    return (controls: AbstractControl) => {
      const control = controls.get(control_name);
      const match_control = controls.get(match_control_name);

      /* istanbul ignore else */
      if (control?.value !== match_control?.value) {
        match_control?.setErrors({
          matching: true
        });
        return { matching: true };
      } else {
        return null;
      }
    };
  }
}
