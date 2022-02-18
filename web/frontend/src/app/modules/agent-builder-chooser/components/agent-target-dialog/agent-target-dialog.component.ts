import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';

import { ObjectUtilitiesClass } from '../../../../classes';
import { IPTargetListClass } from '../../classes';
import {
  DNS_INSTRUCTIONS,
  SMB_PORT,
  VALIDATORS_REQUIRED,
  VALIDATORS_REQUIRED_FROM_ARRAY,
  WINRM_PORT,
  WINRM_PORT_SSL
} from '../../constants/agent-builder-chooser.constant';
import { IPTargetListInterface } from '../../interfaces';

@Component({
  selector: 'cvah-agent-target-dialog',
  templateUrl: 'agent-target-dialog.component.html',
  styleUrls: ['./agent-target-dialog.component.scss']
})
export class AgentTargetDialogComponent implements OnInit {
  // Used for tracking user changes within html
  ip_target_list_form_group: FormGroup;
  ntlm_form_group: FormGroup;
  smb_form_group: FormGroup;
  // Used to guide form group active and what stage html is on
  is_ntlm: boolean;
  is_smb: boolean;
  // Static displayed in html
  dns_instructions: string;

  /**
   * Creates an instance of AgentTargetDialogComponent.
   *
   * @param {FormBuilder} form_builder_
   * @param {MatDialogRef<AgentTargetDialogComponent>} mat_dialog_ref_
   * @memberof AgentTargetDialogComponent
   */
  constructor(private form_builder_: FormBuilder,
              private mat_dialog_ref_: MatDialogRef<AgentTargetDialogComponent>) {
    this.is_ntlm = false;
    this.is_smb = false;
    this.dns_instructions = DNS_INSTRUCTIONS;
  }

  /**
   * Used for setting up initializer methods
   *
   * @memberof AgentTargetDialogComponent
   */
  ngOnInit(): void {
    this.initialize_ip_target_list_form_group_();
    this.initialize_ntlm_form_group_();
    this.initialize_smb_form_group_();
  }

  /**
   * Used for setting port value based on radio button selection
   *
   * @param {MatRadioChange} event
   * @memberof AgentTargetDialogComponent
   */
  protocol_change_step(event: MatRadioChange): void {
    this.is_ntlm = false;
    this.is_smb = false;

    if (event.value === 'ntlm') {
      this.is_ntlm = true;
      this.ntlm_form_group.get('port').setValue(WINRM_PORT);
    } else {
      this.is_smb = true;
      this.smb_form_group.get('port').setValue(SMB_PORT);
    }
  }

  /**
   * Used for changing the ntlm port value between ssl / non ssl
   *
   * @param {MatCheckboxChange} event
   * @memberof AgentTargetDialogComponent
   */
  change_non_dirty_port_value(event: MatCheckboxChange): void {
    const abstract_control: AbstractControl = this.ntlm_form_group.get('port');
    /* istanbul ignore else */
    if (!abstract_control.dirty) {
      if (event.checked) {
        this.ntlm_form_group.get('port').setValue(WINRM_PORT_SSL);
      } else {
        this.ntlm_form_group.get('port').setValue(WINRM_PORT);
      }
    }
  }

  /**
   * Used for returning and displaying error message within html
   *
   * @param {FormGroup} form_group
   * @param {string} control_name
   * @returns {string}
   * @memberof AgentTargetDialogComponent
   */
  get_error_message(form_group: FormGroup, control_name: string): string {
    const abstract_control: AbstractControl = form_group.get(control_name);

    return ObjectUtilitiesClass.notUndefNull(abstract_control) &&
           abstract_control.errors ? abstract_control.errors.error_message : '';
  }

  /**
   * Used for checking to see if form goup configuration is valid
   *
   * @returns {boolean}
   * @memberof AgentTargetDialogComponent
   */
  form_groups_valid(): boolean {
    if (this.is_ntlm) {
      return (this.ntlm_form_group.valid && this.ip_target_list_form_group.valid);
    } else if (this.is_smb) {
      return (this.smb_form_group.valid && this.ip_target_list_form_group.valid);
    } else {
      return false;
    }
  }

  /**
   * Used for closing mat dialog window
   *
   * @memberof AgentTargetDialogComponent
   */
  close(): void {
    this.mat_dialog_ref_.close();
  }

  /**
   * Used for closing mat dialog window and submitting object on close
   *
   * @memberof AgentTargetDialogComponent
   */
  submit(): void {
    const ip_target_list: IPTargetListInterface = {
      name: this.ip_target_list_form_group.get('config_name').value,
      protocol: this.ip_target_list_form_group.get('protocol').value,
      ntlm: this.ntlm_form_group.value,
      smb: this.smb_form_group.value
    };
    this.mat_dialog_ref_.close(new IPTargetListClass(ip_target_list));
  }

  /**
   * Used for initializing ip target list form group
   *
   * @private
   * @memberof AgentTargetDialogComponent
   */
  private initialize_ip_target_list_form_group_(): void {
    const ip_target_list_form_group: FormGroup = this.form_builder_.group({
      config_name: new FormControl('', VALIDATORS_REQUIRED),
      protocol: new FormControl(null, VALIDATORS_REQUIRED)
    });

    this.set_ip_target_list_form_group_(ip_target_list_form_group);
  }

  /**
   * Used for initializing ntlm form group
   *
   * @private
   * @memberof AgentTargetDialogComponent
   */
  private initialize_ntlm_form_group_(): void {
    const ntlm_form_group: FormGroup = this.form_builder_.group({
      port: new FormControl('', VALIDATORS_REQUIRED_FROM_ARRAY),
      domain_name: new FormControl(''),
      is_ssl: new FormControl(false)
    });

    this.set_ntlm_form_group_(ntlm_form_group);
  }

  /**
   * Used for initializing smb form group
   *
   * @private
   * @memberof AgentTargetDialogComponent
   */
  private initialize_smb_form_group_(): void {
    const smb_form_group: FormGroup = this.form_builder_.group({
      port: new FormControl('', VALIDATORS_REQUIRED_FROM_ARRAY),
      domain_name: new FormControl('')
    });

    this.set_smb_form_group_(smb_form_group);
  }

  /**
   * Used for setting ip target list form group
   *
   * @private
   * @param {FormGroup} ip_target_list_form_group
   * @memberof AgentTargetDialogComponent
   */
  private set_ip_target_list_form_group_(ip_target_list_form_group: FormGroup): void {
    this.ip_target_list_form_group = ip_target_list_form_group;
  }

  /**
   * Used for setting ntlm form group
   *
   * @private
   * @param {FormGroup} ntlm_form_group
   * @memberof AgentTargetDialogComponent
   */
  private set_ntlm_form_group_(ntlm_form_group: FormGroup): void {
    this.ntlm_form_group = ntlm_form_group;
  }

  /**
   * Used for setting smb form group
   *
   * @private
   * @param {FormGroup} smb_form_group
   * @memberof AgentTargetDialogComponent
   */
  private set_smb_form_group_(smb_form_group: FormGroup): void {
    this.smb_form_group = smb_form_group;
  }
}
