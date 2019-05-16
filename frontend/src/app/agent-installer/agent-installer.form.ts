import { FormGroup, ValidationErrors, FormArray } from '@angular/forms';
import { HtmlInput, HtmlCheckBox, HtmlCardSelector } from '../html-elements';
import { IP_CONSTRAINT, INVALID_FEEDBACK_IP } from '../frontend-constants';
import { NamePassword } from '../name-password';

export class AgentInstallerForm extends FormGroup {
  targets: FormArray;
  errors = {};
  readyToInstall:boolean = false;

  constructor() {
    super({})
    super.addControl('installer_select', this.installer_select);
    this.addControl('windows_credentials', this.windows_credentials);
    this.targets = new FormArray([]);
    this.targets.setValidators([this.checkAllTargetsValid, this.checkForDuplicateTargets]);
    this.setValidators(checkForSufficientData);
  }

  installer_select = new HtmlCardSelector(
    'installer_select',
    "Windows Agent Installers",
    "List of existing Windows agent installers. Select one.",
    "Installers Configurations",
    "Select One",
    "Invalid",
    false,
    undefined,
    true,
    []);

  windows_credentials = new NamePassword({});

  addTarget() {
    let newCtrl = new HtmlInput(
      'ip_address',
      'IP Address',
      'Enter the name of a Windows IP addressa',
      'text',
      IP_CONSTRAINT,
      INVALID_FEEDBACK_IP,
      true,
      "",
      "The installer will attempt to install agents to the Windows machine at this address");
    //TODO: This seems awfully hackish. FormGroup is used only because I 
    //couldn't figure out any other way to access the HtmlInput in the HTML 
    //template. There should be a way to push just the HtmlInput, which would
    //simplify things a lot.
    this.targets.push(new FormGroup({ 'ip_address': newCtrl}));
  }

  removeTarget(index: number) {
    this.targets.removeAt(index);
  }

  checkAllTargetsValid(ip_inputs: FormArray): null | ValidationErrors {
    let errors = {};
    for(let ctrl of ip_inputs.controls) {
      let ip_input = ctrl.get('ip_address');
      if(!ip_input.valid) {
        errors["Invalid IP"] = ip_input.value;
      }
    }
    if(Object.keys(errors).length == 0) {
      return null;
    }
    return errors;
  } 

  checkForDuplicateTargets(ip_inputs: FormArray): null | ValidationErrors {
    let errors = {}
    let unique_ips = [];
    for(let ctrl of ip_inputs.controls) {
      let ipInput = ctrl.get('ip_address');
      let ip=ipInput.value;
      if(Object.values(unique_ips).indexOf(ip) > -1) {
        errors['Duplicate IP'] = ip;
        ipInput.setErrors({ip: 'Duplicate'});
      }
      else {
        unique_ips.push(ip);
      }
    }
    if(Object.keys(errors).length == 0){
      return null;
    }
    return errors;
  }

}

export function checkForSufficientData(ai_form: AgentInstallerForm): null | ValidationErrors {
    ai_form.errors = {};
    if(Object.keys(ai_form.installer_select.value).length == 0) {
      ai_form.errors['Installer Configuation'] = 'Select an Installer Configuration';
    }

    if(!ai_form.windows_credentials.password.valid) {
      ai_form.errors['Password'] = 'Invalid Value'
    }

    if(!ai_form.windows_credentials.user_name.valid) {
      ai_form.errors['User Name'] = 'Invalid Value';
    }

    if(ai_form.targets.controls.length == 0){
      ai_form.errors['Targets'] = 'No target IP addresses';
    }
    else {
      if(!ai_form.targets.valid) {
        ai_form.errors = Object.assign({}, ai_form.errors, ai_form.targets.errors);
      }
    }

    ai_form.readyToInstall = (Object.keys(ai_form.errors).length == 0);
    if(ai_form.readyToInstall){
      return null;
    }  
    return ai_form.errors;
  }
