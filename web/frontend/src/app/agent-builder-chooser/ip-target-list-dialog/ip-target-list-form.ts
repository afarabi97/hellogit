import { FormGroup, ValidationErrors, FormArray } from '@angular/forms';
import { HtmlInput, HtmlCheckBox, HtmlCardSelector } from '../../html-elements';
import { IP_CONSTRAINT, INVALID_FEEDBACK_IP } from '../../frontend-constants';
import { NamePassword } from '../../name-password';
import {IpTargetList, AgentBuilderService} from '../../agent-builder.service'

export class IpTargetListForm extends FormGroup {
  targets: FormArray = new FormArray([]);
  errors = {};
  readyToInstall:boolean = false; 
  public agentBuilderSrv: AgentBuilderService

  constructor() {
    super({})
    this.addControl('windows_credentials', this.windows_credentials);
    this.addControl('target_list_selector', this.target_list_selector);
    this.addControl('target_list_name', this.target_list_name);
    this.targets.setValidators([this.checkAllTargetsValid, this.checkForDuplicateTargets]);
    this.setValidators(checkForSufficientData);
  }

  windows_credentials = new NamePassword({});

  target_list_name = new HtmlInput(
      'target_list_name',
      'Target List Name',
      'Enter name for target list',
      'text',
      undefined,
      'Must enter a list name.',
      true,
      '',
      '');

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

  target_list_selector = new HtmlCardSelector(
        'target_set',
        "Target Sets",
        "List of existing target sets. Select one.",
        "Target Sets",
        "Select One", 
        "Invalid",
        false,
        undefined,
        true,
        []);
        //[{label: 'foo', value: 0, isSelected: false}, { label: 'bar', value: 1, isSelected: false}])

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

  saveTargetList() {
      let target_list = new IpTargetList();
      target_list.name = this.target_list_name.value;
      for(let target of this.targets.value) {
        target_list.targets.push(target.ip_address)
      }
      console.log('Saving target list:',this.targets.value);
      console.log('Saving target list:',target_list);
      this.agentBuilderSrv.saveIpTargetList(target_list).subscribe(
        new_list => {
          console.log('received new list:', new_list);
        },
        err => {
          console.log('received error', err)
        });
        this.populateSavedTargetSelector() 
  }

  onTargetListSelection() {
    this.targets = new FormArray([]);
    let controls = this.targets.controls;
    this.target_list_name.setValue(this.target_list_selector.value[0].name);
    for(let ip of this.target_list_selector.value[0].targets) {
      this.addTarget();
      controls[this.targets.length - 1].get('ip_address').setValue(ip);
    }
  }

  populateSavedTargetSelector() {
    this.agentBuilderSrv.getIpTargetList().subscribe(
      saved_target_lists => { 
        console.log("received target lists:", saved_target_lists)
        let target_sets = [];
        this.target_list_selector.default_options.length = 0
        for(let target of saved_target_lists) {
          this.target_list_selector.default_options.push({label: target.name, value: target, isSelected: false})
        }
      },
      error => {
        console.error("populateSavedTargetSelector, error:", error)
      }
    )
  }

}

export function checkForSufficientData(ai_form: IpTargetListForm ): null | ValidationErrors {
    ai_form.errors = {};

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
