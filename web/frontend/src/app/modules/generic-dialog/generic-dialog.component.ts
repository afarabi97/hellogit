import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ObjectUtilitiesClass } from '../../classes';
import { DialogDataInterface } from '../../interfaces';

/**
 * Component used for rendering generic Material dialog
 */
@Component({
  selector: 'cvah-generic-dialog',
  templateUrl: './generic-dialog.component.html',
  styleUrls: [
    'generic-dialog.component.scss'
  ]
})
export class GenericDialogComponent<T> {

  /**
   * Creates an instance of GenericDialogComponent.
   *
   * @param {MatDialogRef<GenericDialogComponent<T>>} mat_dialog_ref - A reference to the dialog opened.
   * @param {DialogDataInterface} mat_dialog_data - Injected dialog data
   * @memberof GenericDialogComponent
   */
  constructor(public mat_dialog_ref: MatDialogRef<GenericDialogComponent<T>>,
              @Inject(MAT_DIALOG_DATA) public mat_dialog_data: DialogDataInterface<any>) {}

  /**
   * Check to see if variable value is defined and not null
   *
   * @param {*} variable_value
   * @returns {boolean}
   * @memberof GenericDialogComponent
   */
  check_variable_value_defined(variable_value: any): boolean {
    return ObjectUtilitiesClass.notUndefNull(variable_value);
  }
}
