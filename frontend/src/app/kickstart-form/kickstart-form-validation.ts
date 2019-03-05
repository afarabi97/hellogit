import {  FormArray, AbstractControl } from '@angular/forms';
import { HtmlInput } from '../html-elements';
import { INVALID_PASSWORD_MISMATCH, IP_CONSTRAINT } from '../frontend-constants';
import { NodeFormGroup } from './kickstart-form';
import { CheckForInvalidControls, isIpv4InSubnet } from '../globals';
import { KickstartInventoryForm } from './kickstart-form';

function _compare_field(nodes: FormArray, fieldName: string): { hasError: boolean, conflict: string } {
  if (nodes != null && nodes.length >= 2){
    for (let i = 0; i < nodes.length; i++){
      let nodeI = nodes.at(i);

      for (let x = (i + 1); x < nodes.length; x++) {
        let nodeX = nodes.at(x);
        if (nodeI.get(fieldName).valid &&
            nodeX.get(fieldName).valid &&
            nodeI.get(fieldName).value == nodeX.get(fieldName).value
            )
        {
          return {hasError: true, conflict: nodeI.get(fieldName).value };
        }
      }
    }
  }
  return {hasError: false, conflict: null };
}

function _validateDhcpRange(control: AbstractControl, errors: Array<string>): void {
    let dhcp_range_ctrl = control.get('dhcp_range');
    if (dhcp_range_ctrl === null || dhcp_range_ctrl.value === null) {
        return;
    }

    if(dhcp_range_ctrl.value === "") {
        errors.push("- DHCP range is invalid. Please select a controller interface and then select a valid start value.");
    }
}

function _validateNodes(control: AbstractControl, errors: Array<string>): void {
    let nodes = control.get('nodes') as FormArray;
    let has_servers = false;
    let has_sensors = false;

    if (nodes === undefined || nodes === null){
        return;
    }

    if (nodes.length < 2){
        errors.push("- A minimum of two nodes is required before submitting this form.");
    }

    for (let i = 0; i < nodes.length; i++){
        let node = nodes.at(i) as NodeFormGroup;
        if (node.node_type.value == node.node_type.options[0] || node.node_type.value == node.node_type.options[3] ){
            has_servers = true;
        } else {
            has_sensors = true;
        }
        if (has_servers && has_sensors){
            return;
        }
    }
    if ((!has_sensors || !has_servers)){
        errors.push("- A minium of one server and one sensor is required for the Kickstart configuration.");
    }
}

function _validateContorllerInterface(control: AbstractControl, errors: Array<string>): void {
    let ctrl_interface = control.get('controller_interface') as FormArray;
    if (ctrl_interface !== null){
        if (ctrl_interface.length === 0) {
            errors.push("- Controller interfaces failed to validate. You need to select one.");
        }
    }
}

function _validateNodeIps(control: AbstractControl, errors: Array<string>): void {
    let nodes = control.get('nodes') as FormArray;
    let form  = control as KickstartInventoryForm;

    if (nodes === undefined || nodes === null){
        return;
    }

    let pat = new RegExp(IP_CONSTRAINT);
    for (let i = 0; i < nodes.length; i++){
        let node = nodes.at(i) as NodeFormGroup;
        if (form.controller_interface.value[0] !== undefined &&
            pat.test(node.ip_address.value)){
            if (! isIpv4InSubnet(node.ip_address.value, form.controller_interface.value[0], form.netmask.value)){
                errors.push("- The " + node.ip_address.value + " passed in is not in the correct subnet.");
            }
        }
    }
}

export function ValidateKickStartInventoryForm(control: AbstractControl){
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

  if (dhcp_start != null && dhcp_end != null){
    if (dhcp_end.value == dhcp_start.value){
      errors.push("- DHCP start and end addresses cannot be the same.");
    }
  }

  if (root_password != null && re_password != null){
    if (root_password.value != re_password.value){
      //Sets the Error message at the formControl Level
      re_password.setErrors({ custom_error: INVALID_PASSWORD_MISMATCH});

      //Sets the error message at the formGroup Level.  There is a validation box where this will appear.
      errors.push("- The passwords you entered do not match.  Please retype them carefully.");
    }
  }

  _validateContorllerInterface(control, errors);
  _validateDhcpRange(control, errors);
  _validateNodes(control, errors);
  _validateNodeIps(control, errors);
  CheckForInvalidControls(control, errors);
  if (errors.length > 0){
    return { errors: errors};
  }

  return null;
}
