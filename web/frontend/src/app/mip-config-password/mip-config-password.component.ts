import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { validateFromArray } from '../validators/generic-validators.validator';

@Component({
  selector: 'app-mip-config-password',
  templateUrl: './mip-config-password.component.html',
  styleUrls: ['./mip-config-password.component.scss'],
  host: {
    'class': 'app-mip-config-password'
  }
})
export class MIPConfigPasswordComponent implements OnInit, OnChanges {

    // Unique ID passed from parent component to create unique element ids
    @Input() uniqueHTMLID: string;
    @Input() form: FormGroup;
    @Input() name: string;
    @Input() enabled: boolean;
    password_index: number;
    password: FormControl;
    confirm_password: FormControl;
    private group: FormGroup;

    ngOnInit() {
      this.createControls();
    }

    ngOnChanges(changes) {
        if(this.group) {
            if (changes.enabled.currentValue) {
                this.group.enable();
            } else {
                this.group.disable();
            }
        }
    }

    /**
     * Used for generating unique element id for html
     *
     * @param {string} passedID
     * @returns {string}
     * @memberof CardComponent
     */
    generateUniqueHTMLID(passedID: string): string {

      return this.uniqueHTMLID ? `${this.uniqueHTMLID}-${passedID}` : passedID;
    }

    private capitalize(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    createControls() {
      let passwords = <FormArray> this.form.get('passwords');
      this.password_index = passwords.length;

      let capitalizedName = this.capitalize(this.name);

      let vpassword = [
        { ops: { pattern: /^.{6,}$/ }, error_message: `You must enter a ${this.name} password with a minimum length of 6 characters.`, validatorFn: 'pattern' },
        { error_message: `${capitalizedName} password is required.`, validatorFn: 'required' }
      ];

      let vconfirm_password = [
        { ops: { pattern: /^.{6,}$/ }, error_message: `You must enter a ${this.name} password with a minimum length of 6 characters.`, validatorFn: 'pattern' },
        { error_message: `The passwords for ${this.name} do not match. Please retype them carefully.`, validatorFn: 'fieldMatch' },
        { error_message: `Retyping ${this.name} password is required.`, validatorFn: 'required' }
      ];

      let password = new FormControl(null, Validators.compose([validateFromArray(vpassword)]));
      let confirm_password = new FormControl(null, Validators.compose([validateFromArray(vconfirm_password, { parentControl: password })]));
      let name = new FormControl(this.name);

      let controls = {
          'password': password,
          'confirm_password': confirm_password,
          'name': name
      }

      let formGroup = new FormGroup(controls);

      passwords.push(formGroup);
      passwords.disable();

      this.password = password;
      this.confirm_password = confirm_password;
      this.group = formGroup;
    }

    public getErrorMessage(control: FormControl): string {
        return control.errors ? control.errors.error_message : '';
    }
}
