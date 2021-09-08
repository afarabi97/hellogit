import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

import { IP_CONSTRAINT } from '../frontend-constants';
import { isIpv4InSubnet } from '../globals';
import { ValidatorObjectInterface } from '../interfaces';

export class errorObject {
  error_message: string;
  controlValue: any;
  constructor(errorObj) {
    this.error_message = errorObj.error_message ? errorObj.error_message : 'Invalid Input';
    this.controlValue = errorObj.control;
  }
}

export interface FormGroupControls {
  [key: string]: AbstractControl;
}

export interface AllValidationErrors {
  control_name: string;
  error_name: string;
  error_value: any;
}

export function validateFromArray(validatorArray: ValidatorObjectInterface[], ops?: any): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    let errors = validatorArray.map(validator => {
      switch (validator.validatorFn) {
        case 'pattern':
          return patternValidator(validator, control);
        case 'password':
          return passwordValidator(validator, control, ops);
        case 'unique':
          return uniqueValidator(validator, control, ops);
        case 'ip&subnet':
          return validateIPAddress(validator, control, ops);
        case 'required':
          return requiredField(validator, control);
        case 'fieldMatch':
          return inputFieldMatch(validator, control, ops);
        case 'minInArray':
          return minInArray(validator, control, ops);
        default:
          return undefined;
      }
    });
    errors = errors.filter(error => error);
    return errors.length === 0 ? null : errors[0];
  };
}

export function passwordValidator(validatorObject: ValidatorObjectInterface, control: AbstractControl, ops?: any): ValidationErrors | null {
  if (!control.value){
    return null;
  }

  let subject = 'The password';
  if (ops?.error_message_subject) {
    subject = ops.error_message_subject;
  }

  if (control.value.length < 15) {
    return { password: validatorObject.error_message, error_message: `${subject} must be at least 15 characters`};
  }

  if(!/[0-9]/.test(control.value)) {
    return { password: validatorObject.error_message, error_message: `${subject} must have at least 1 digit`};
  }

  if(!/[a-z]/.test(control.value)) {
    return { password: validatorObject.error_message, error_message: `${subject} must have at least 1 lowercase letter`};
  }

  if (!/[A-Z]/.test(control.value)) {
    return { password: validatorObject.error_message, error_message: `${subject} must have at least 1 uppercase letter`};
  }

  if (!/[^0-9a-zA-Z]/.test(control.value)) {
    return { password: validatorObject.error_message, error_message: `${subject} must have at least 1 symbol`};
  }

  if ((new Set(control.value)).size < 8) {
    return { password: validatorObject.error_message, error_message: `${subject} must have at least 8 unique characters.`};
  }
  if (consecutive(control.value)) {
    return { password: validatorObject.error_message, error_message: `${subject} must not have 3 consecutive characters that are the same`};
  }

}

function consecutive(password) {
  let c;
  let same;

  for (let i = 0; i<= password.length; i++) {
    if (i === 0) {
      c = password[i];
      same = 1;
    } else {
      if (c === password[i]) {
        same += 1;
      } else {
        if (same > 2) {
          return true;
        }
        same = 1;
        c = password[i];
      }
    }
  }
  return false;
}





export function patternValidator(validatorObject: ValidatorObjectInterface, control: AbstractControl) {
  const forbidden = control.value && control.value.length > 0 ? validatorObject.ops.pattern.test(control.value) : {};
  return forbidden ? null : { pattern: { value: control.value }, error_message: validatorObject.error_message };
}

export function uniqueValidator(validatorObject: ValidatorObjectInterface, control: AbstractControl, ops?: any) {
  let isUnique;

  if (ops.uniqueArray instanceof Array && ops.formControlName) {
    isUnique = ops.uniqueArray.find((obj, i) => control.value.length > 0 && obj[ops.formControlName] === control.value && i !== ops.index);
  } else if (ops.uniqueArray instanceof Array) {
    isUnique = ops.uniqueArray.find((obj, i) => control.value.length > 0 && obj === control.value && i !== ops.index);
  } else if (ops.uniqueArray instanceof FormArray) {
    isUnique = ops.uniqueArray.value.find((obj, i) => control.value.length > 0 && obj[ops.formControlName] === control.value && i !== ops.index);
  }
  return isUnique ? new errorObject({ control: control, error_message: validatorObject.error_message(control.value) }) : null;
}

export function inputFieldMatch(validatorObject: ValidatorObjectInterface, control: AbstractControl, ops?: any) {
  return control.value === ops.parentControl.value ? null : new errorObject({ control: control, error_message: validatorObject.error_message });
}

export function validateIPAddress(validatorObject: ValidatorObjectInterface, control: AbstractControl, ops?: any) {
  let error = null;
  if (control.touched) {
    const ip_range = validatorObject.ops.ip_range;
    const unfilledControls = [];
    // loop through dependant fields
    ip_range.map(ip => {
      // if not an actual IP return
      let fgIP = ops.parentFormGroup.get(ip.value);

      if (fgIP instanceof FormArray) {
        // hard coded to position one because controller_interface is a FormArray
        const fa = ops.parentFormGroup.get(ip.value) as FormArray;
        fgIP = fa.at(0);
      }

      if (fgIP.invalid) {
        unfilledControls.push(ip.label);
        return;
      }
      if (control.value && control.value.length > 0) {
        if (!new RegExp(IP_CONSTRAINT).test(control.value)) {
          return new errorObject({ control: control, error_message: `Invalid IP Address` });
        }
        const parsedIP = fgIP.value.split('.');
        const parsedInput = control.value.split('.');
        if (parsedInput.length < 3) {
          return error = new errorObject({ control: control, error_message: 'Invalid Input' });
        }
        if (validatorObject.ops.testRange && (parsedInput[0] !== parsedIP[0] || parsedInput[1] !== parsedIP[1] || parsedInput[2] !== parsedIP[2])) {
          return error = new errorObject({ control: control, error_message: 'IP is not within the correct range' });
        }
      }
    });

    // specific for ip address
    const findValue = (arr, key, value) => arr.filter(v => v[key] === value);
    if (findValue(ip_range, 'value', 'controller_interface') && findValue(ip_range, 'value', 'netmask')) {
      // get the formcontrols
      const pat = new RegExp(IP_CONSTRAINT);
      const controller_interface = ops.parentFormGroup.get('controller_interface');
      const netmask = ops.parentFormGroup.get('netmask');
      // start validating using previous validation
      if (controller_interface.value !== undefined && pat.test(control.value)) {
        if (!isIpv4InSubnet(control.value, controller_interface.value, netmask.value)) {
          error = new errorObject({ control: control, error_message: `The value ${control.value} is not in the correct subnet` });
        }

      }

    }

    if (unfilledControls.length > 0) {
      return error = new errorObject({ control: control, error_message: `Please fill out ${unfilledControls.join(' & ')}` });
    }
  }
  return error;
}

export function getFormValidationErrors(controls: FormGroupControls): AllValidationErrors[] {
  let errors: AllValidationErrors[] = [];
  Object.keys(controls).forEach(key => {
    const control = controls[key];
    if (control instanceof FormGroup) {
      errors = errors.concat(getFormValidationErrors(control.controls));
    } else if (control instanceof FormArray) {
      const formArray = control as FormArray;
      formArray.controls.map(c => {
        if (c instanceof FormGroup) {
          errors = errors.concat(getFormValidationErrors(c.controls));
        }
      });
    }
    const controlErrors: ValidationErrors = controls[key].errors;
    if (controlErrors !== null) {
      Object.keys(controlErrors).forEach(keyError => {
        errors.push({
          control_name: key,
          error_name: keyError,
          error_value: controlErrors[keyError]
        });
      });
    }
  });
  return errors.filter(error => !(error.error_value instanceof Object));
}

export function requiredField(validatorObject: ValidatorObjectInterface, control: AbstractControl) {
  if (control.touched && control.value.length > 0) {
    return null;
  }

  if (control.value == null || control.touched || control.value.length === 0) {
    return new errorObject({ control: control, error_message: validatorObject.error_message });
  }
  return null;
}

export function minInArray(validatorObject: ValidatorObjectInterface, control: AbstractControl, ops?: any) {
  let minRequiredArray = [];
  if (ops.minRequiredArray instanceof FormArray) {
    if (!ops.minRequiredArray.value.find(c => c[ops.minRequireControl] !== undefined)) {
      return null;
    }
    minRequiredArray = ops.minRequiredArray.value.filter(c => c[ops.minRequireControl] === ops.minRequiredValue);
  } else {
    if (!ops.minRequiredArray.find(c => c[ops.minRequireControl] !== undefined)) {
      return null;
    }
    minRequiredArray = ops.minRequiredArray.filter(c => c.value === ops.minRequiredValue);
  }
  return minRequiredArray.length < ops.minRequired ? new errorObject({ control: control, error_message: validatorObject.error_message }) : null;
}
