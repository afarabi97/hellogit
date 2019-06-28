import { FormArray, AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HtmlInput } from '../html-elements';
import { INVALID_PASSWORD_MISMATCH, IP_CONSTRAINT } from '../frontend-constants';
import { NodeFormGroup } from './kickstart-form';
import { CheckForInvalidControls, isIpv4InSubnet } from '../globals';
import { KickstartInventoryForm } from './kickstart-form';

function _compare_field(nodes: FormArray, fieldName: string): { hasError: boolean, conflict: string } {
  if (nodes != null && nodes.length >= 2) {
    for (let i = 0; i < nodes.length; i++) {
      let nodeI = nodes.at(i);

      for (let x = (i + 1); x < nodes.length; x++) {
        let nodeX = nodes.at(x);
        if (nodeI.get(fieldName).valid &&
          nodeX.get(fieldName).valid &&
          nodeI.get(fieldName).value == nodeX.get(fieldName).value
        ) {
          return { hasError: true, conflict: nodeI.get(fieldName).value };
        }
      }
    }
  }
  return { hasError: false, conflict: null };
}

function _validateDhcpRange(control: AbstractControl, errors: Array<string>): void {
  let dhcp_range_ctrl = control.get('dhcp_range');
  if (dhcp_range_ctrl === null || dhcp_range_ctrl.value === null) {
    return;
  }

  if (dhcp_range_ctrl.value === "") {
    errors.push("- DHCP range is invalid. Please select a controller interface and then select a valid start value.");
  }
}

function _validateNodes(control: AbstractControl, errors: Array<string>): void {
  let nodes = control.get('nodes') as FormArray;
  let has_servers = false;
  let has_sensors = false;

  if (nodes === undefined || nodes === null) {
    return;
  }

  if (nodes.length < 2) {
    errors.push("- A minimum of two nodes is required before submitting this form.");
  }
}

function _validateContorllerInterface(control: AbstractControl, errors: Array<string>): void {
  let ctrl_interface = control.get('controller_interface') as FormArray;
  if (ctrl_interface !== null) {
    if (ctrl_interface.length === 0) {
      errors.push("- Controller interfaces failed to validate. You need to select one.");
    }
  }
}

function _validateNodeIps(control: AbstractControl, errors: Array<string>): void {
  let nodes = control.get('nodes') as FormArray;
  let form = control as KickstartInventoryForm;

  if (nodes === undefined ||
    nodes === null ||
    form.controller_interface.value === null ||
    form.controller_interface.value[0] === null) {
    return;
  }

  let pat = new RegExp(IP_CONSTRAINT);
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes.at(i) as NodeFormGroup;
    if (form.controller_interface.value[0] !== undefined &&
      pat.test(node.ip_address.value)) {
      if (!isIpv4InSubnet(node.ip_address.value, form.controller_interface.value[0], form.netmask.value)) {
        errors.push("- The " + node.ip_address.value + " passed in is not in the correct subnet.");
      }
    }
  }
}

export function ValidateKickStartInventoryForm(control: AbstractControl) {
  let dhcp_start = control.get('dhcp_start');
  let dhcp_end = control.get('dhcp_end');

  let root_password = control.get('root_password') as HtmlInput;
  let re_password = control.get('re_password') as HtmlInput;

  let nodes = control.get('nodes') as FormArray;
  let ip_check = _compare_field(nodes, 'ip_address');
  let mac_check = _compare_field(nodes, 'mac_address');
  let host_check = _compare_field(nodes, 'hostname');
  let errors = [];

  if (ip_check.hasError) {
    errors.push("- Duplicate IP addresses found: " + ip_check.conflict + " Nodes must have a unique ip address.")
  }
  if (mac_check.hasError) {
    errors.push("- Duplicate mac addresses found: " + mac_check.conflict + " Nodes must have a unique mac address.")
  }
  if (host_check.hasError) {
    errors.push("- Duplicate hostnames found: " + host_check.conflict + " Node must have a unique hostnames.")
  }

  if (dhcp_start != null && dhcp_end != null) {
    if (dhcp_end.value == dhcp_start.value) {
      errors.push("- DHCP start and end addresses cannot be the same.");
    }
  }

  if (root_password != null && re_password != null) {
    if (root_password.value != re_password.value) {
      //Sets the Error message at the formControl Level
      re_password.setErrors({ custom_error: INVALID_PASSWORD_MISMATCH });

      //Sets the error message at the formGroup Level.  There is a validation box where this will appear.
      errors.push("- The passwords you entered do not match.  Please retype them carefully.");
    }
  }

  _validateContorllerInterface(control, errors);
  _validateDhcpRange(control, errors);
  _validateNodes(control, errors);
  _validateNodeIps(control, errors);
  CheckForInvalidControls(control, errors);
  if (errors.length > 0) {
    return { errors: errors };
  }

  return null;
}

export interface validatorObject {
  validatorFn: string;
  error_message: string | any;
  ops?: any;
}

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

export function validateFromArray(validatorArray: validatorObject[], ops?: any): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    let errors = validatorArray.map(validator => {
      switch (validator.validatorFn) {
        case 'pattern':
          return patternValidator(validator, control);
        case 'unique':
          return uniqueValidator(validator, control, ops);
        case 'ip&subnet':
          return validateIPAddress(validator, control, ops);
        case 'required':
          return requiredField(validator, control);
        case 'fieldMatch':
          return inputFieldMatch(validator, control, ops);
        default:
          return undefined;
      }
    });
    errors = errors.filter(error => error);
    return errors.length === 0 ? null : errors[0];
  };
}

export function patternValidator(validatorObject: validatorObject, control: AbstractControl) {
  const forbidden = control.value && control.value.length > 0 ? validatorObject.ops.pattern.test(control.value) : {};
  return forbidden ? null : { pattern: { value: control.value }, error_message: validatorObject.error_message };
}

export function uniqueValidator(validatorObject: validatorObject, control: AbstractControl, ops?: any) {
  let isUnique;
  if (ops.uniqueArray instanceof Array) {
    isUnique = ops.uniqueArray.find(obj => control.value.length > 0 && obj[ops.formControlName] == control.value);
  } else if (ops.uniqueArray instanceof FormArray) {
    isUnique = ops.uniqueArray.value.find((obj, i) => control.value.length > 0 && obj[ops.formControlName] == control.value && i != ops.index );
  }
  return isUnique ? new errorObject({ control: control, error_message: validatorObject.error_message(control.value) }) : null;
}

export function inputFieldMatch(validatorObject: validatorObject, control: AbstractControl, ops?: any) {
  return control.value === ops.parentControl.value ? null : new errorObject({ control: control, error_message: validatorObject.error_message });
}

export function validateIPAddress(validatorObject: validatorObject, control: AbstractControl, ops?: any) {
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
        const fa = ops.parentFormGroup.get(ip.value) as FormArray
        fgIP = fa.at(0);
      }

      if (fgIP.untouched || fgIP.invalid) {
        unfilledControls.push(ip.label)
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
    let findValue = (arr, key, value) => arr.filter(v => v[key] == value);
    if (findValue(ip_range, 'value', 'controller_interface') && findValue(ip_range, 'value', 'netmask')) {
      // get the formcontrols
      let pat = new RegExp(IP_CONSTRAINT);
      let controller_interface = ops.parentFormGroup.get('controller_interface');
      let netmask = ops.parentFormGroup.get('netmask');
      // start validating using previous validation
      if (controller_interface.value[0] !== undefined && pat.test(control.value)) {
        if (!isIpv4InSubnet(control.value, controller_interface.value[0], netmask.value)) {
          error = new errorObject({ control: control, error_message: `The value ${control.value} is not in the correct subnet` })
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
          errors = errors.concat(getFormValidationErrors(c.controls))
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

export function requiredField(validatorObject: validatorObject, control: AbstractControl) {
  if (control.touched && control.value.length > 0) {
    return null;
  }

  if (control.value == null || control.touched || control.value.length == 0) {
    return new errorObject({ control: control, error_message: validatorObject.error_message });
  }
  return null;
}