import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { validateFromArray } from '../../../../../../validators/generic-validators.validator';
import { addToken } from '../../../../validators/kit-token.validator';

/**
 * Component used for add token
 *
 * @export
 * @class AddKitTokenDialogComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'cvah-add-kit-token-dialog',
  templateUrl: 'add-kit-token-dialog.component.html',
  styleUrls: ['./add-kit-token-dialog.component.scss']
})
export class AddKitTokenDialogComponent implements OnInit {
  // Used for passing form group to html for user input
  kit_token_settings_form_group: FormGroup;

  /**
   * Creates an instance of AddKitTokenDialogComponent.
   *
   * @param {FormBuilder} form_builder_
   * @param {MatDialogRef<AddKitTokenDialogComponent>} mat_dialog_ref_
   * @memberof AddKitTokenDialogComponent
   */
  constructor(private form_builder_: FormBuilder,
              private mat_dialog_ref_: MatDialogRef<AddKitTokenDialogComponent>) { }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof AddKitTokenDialogComponent
   */
  ngOnInit(): void {
    this.initialize_kit_token_settings_form_group_();
  }

  /**
   * Used for displaying error message for a form field
   *
   * @param {AbstractControl} control
   * @return {string}
   * @memberof AddKitTokenDialogComponent
   */
  get_error_message(control: AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  /**
   * Used for submitting a valid form group
   *
   * @memberof AddKitTokenDialogComponent
   */
  submit(): void {
    this.mat_dialog_ref_.close(this.kit_token_settings_form_group.getRawValue());
  }

  /**
   * Used for closing the mat dialog ref
   *
   * @memberof AddKitTokenDialogComponent
   */
  click_button_close(): void {
    this.mat_dialog_ref_.close();
  }

  /**
   * Used for setting up the form group
   *
   * @memberof AddKitTokenDialogComponent
   */
  private initialize_kit_token_settings_form_group_(): void {
    const kit_token_settings_form_group = this.form_builder_.group({
                                                                     ipaddress: this.form_builder_.control(null, Validators.compose([validateFromArray(addToken.ip_address)]))
                                                                   });

    this.set_kit_token_settings_form_group_(kit_token_settings_form_group);
  }

  /**
   * Used for setting the form group equal to passed value
   *
   * @param {FormGroup} kit_token_settings_form_group
   * @memberof AddKitTokenDialogComponent
   */
  private set_kit_token_settings_form_group_(kit_token_settings_form_group: FormGroup): void {
    this.kit_token_settings_form_group = kit_token_settings_form_group;
  }
}
