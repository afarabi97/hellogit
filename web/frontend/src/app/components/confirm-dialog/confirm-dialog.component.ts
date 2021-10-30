import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ObjectUtilitiesClass } from 'src/app/classes';

import { ConfirmDialogMatDialogDataInterface } from '../../interfaces';

/**
 * Component used for displaying universal dialog window
 *
 * @export
 * @class ConfirmDialogComponent
 */
@Component({
  selector: 'cvah-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: [
    './confirm-dialog.component.scss'
  ]
})
export class ConfirmDialogComponent {
  // Used for two way data binding user input for double confirm
  double_confirm_value: string;

  /**
   * Creates an instance of ConfirmDialogComponent.
   *
   * @param {MatDialogRef<ConfirmDialogComponent>} mat_dialog_ref_
   * @param {ConfirmDialogMatDialogDataInterface} mat_dialog_data
   * @memberof ConfirmDialogComponent
   */
  constructor(private mat_dialog_ref_: MatDialogRef<ConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public mat_dialog_data: ConfirmDialogMatDialogDataInterface) {
    this.double_confirm_value = '';
  }

  /**
   * Check to see if variable value is defined and not null
   *
   * @param {*} variable_value
   * @returns {boolean}
   * @memberof ConfirmDialogComponent
   */
  check_variable_value_defined(variable_value: any): boolean {
    return ObjectUtilitiesClass.notUndefNull(variable_value);
  }

  /**
   * Used for checking if user typed the double confirm message
   *
   * @returns {boolean}
   * @memberof ConfirmDialogComponent
   */
  is_double_confirm_message_typed(): boolean {
    return this.double_confirm_value.toLowerCase() === this.mat_dialog_data.message_double_confirm.toLowerCase();
  }

  /**
   * Used for closing the MatDialogRef
   *
   * @param {string} selected_option
   * @memberof ConfirmDialogComponent
   */
  close(selected_option: string): void {
    if (selected_option === this.mat_dialog_data.option1) {
      this.mat_dialog_ref_.close(this.mat_dialog_data.option1);
    } else {
      this.mat_dialog_ref_.close(this.mat_dialog_data.option2);
    }
  }
}
