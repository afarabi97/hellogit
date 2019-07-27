import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox'
import { FormBuilder, FormControl,
         FormGroup, Validators } from '@angular/forms';
import { validateFromArray } from '../../validators/generic-validators.validator';
import { MatRadioChange } from '@angular/material';


export const target_config_validators = {
  required: [
    { error_message: 'Required field', validatorFn: 'required' }
  ]
}


const WINRM_PORT = "5985";
const WINRM_PORT_SSL = "5986";
const SMB_PORT = "445";


@Component({
  selector: 'agent-target-dialog',
  templateUrl: 'agent-target-dialog.component.html',
  styleUrls: ['./agent-target-dialog.component.scss']
})
export class AgentTargetDialogComponent implements OnInit {
  newTargetAgentForm: FormGroup;
  kerberosForm: FormGroup;
  ntlmForm: FormGroup;
  smbForm: FormGroup;

  isNegOrNTLM: boolean;
  isKerberos: boolean;
  isSMB: boolean;
  sensor_profiles: Array<{name: string, value: string}>
  dnsInstructions: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AgentTargetDialogComponent>
  ) {
    this.sensor_profiles = new Array();
    this.isNegOrNTLM = false;
    this.isKerberos = false;
    this.isSMB = false;
    this.dnsInstructions = "The \"Windows DNS Suffix\" and \"DNS Server IP\" are optional. If you do not include them, you will need to use the IP address of the Windows target(s). \
                            If you put in the \"DNS Server IP\" and leave out the \"Windows DNS Suffix\" you will need to make sure each host you enter has the appropriate \
                            fully qualified domain name with the suffix attached (EX: <Windows hostname>.<DNS suffix>)."
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.newTargetAgentForm = this.fb.group({
      config_name: new FormControl('', Validators.compose([Validators.required])),
      protocol: new FormControl('', Validators.compose([Validators.required]))
    });

    this.kerberosForm = this.fb.group({
      port: new FormControl('',
                  Validators.compose([validateFromArray(target_config_validators.required)])),
      domain_name: new FormControl('',
                   Validators.compose([validateFromArray(target_config_validators.required)])),
      dns_server: new FormControl('',
                  Validators.compose([validateFromArray(target_config_validators.required)])),
      key_controller: new FormControl('',
                  Validators.compose([validateFromArray(target_config_validators.required)])),
      admin_server: new FormControl('',
                  Validators.compose([validateFromArray(target_config_validators.required)])),
    });

    this.ntlmForm = this.fb.group({
      port: new FormControl('',
            Validators.compose([validateFromArray(target_config_validators.required)])),
      domain_name: new FormControl(''),
      dns_server: new FormControl(''),
      is_ssl: new FormControl(false)      
    });

    this.smbForm = this.fb.group({
      port: new FormControl('',
            Validators.compose([validateFromArray(target_config_validators.required)])),
      domain_name: new FormControl(''),
      dns_server: new FormControl(''),
    });
  }

  changeStep(event: MatRadioChange){
    this.isKerberos = false;
    this.isNegOrNTLM = false;
    this.isSMB = false;

    if (event.value === "negotiate" || event.value === "ntlm"){
      this.isNegOrNTLM = true;
      this.ntlmForm.get('port').setValue(WINRM_PORT);
    } else if (event.value === "kerberos") {
      this.isKerberos = true;
      this.kerberosForm.get('port').setValue(WINRM_PORT_SSL);
    } else if (event.value === "smb") {
      this.isSMB = true;
      this.smbForm.get('port').setValue(SMB_PORT);
    }
  }

  changePortIfNotDirty(event: MatCheckboxChange){
    let port_ctrl = this.ntlmForm.controls['port'] as FormControl;
    if (!port_ctrl.dirty){
      if (event.checked){
        this.ntlmForm.controls['port'].setValue(WINRM_PORT_SSL);
      } else {
        this.ntlmForm.controls['port'].setValue(WINRM_PORT);
      }
    }
  }

  isWizardValid(): boolean {
    if (this.isKerberos){
      return (this.kerberosForm.valid && this.newTargetAgentForm.valid);
    } else if (this.isNegOrNTLM){
      return (this.ntlmForm.valid && this.newTargetAgentForm.valid);
    } else if (this.isSMB){
      return (this.smbForm.valid && this.newTargetAgentForm.valid);
    }
    return false;
  }

  submitAndClose() {
    this.dialogRef.close({ "name": this.newTargetAgentForm.value["config_name"],
                           "protocol": this.newTargetAgentForm.value["protocol"],
                           "kerberos": this.kerberosForm.value,
                           "ntlm": this.ntlmForm.value,
                           "smb": this.smbForm.value } );
  }

  public getErrorMessage(form: FormGroup, control_name: string): string {
    let control = form.get(control_name);
    return control.errors ? control.errors.error_message : '';
  }
}
