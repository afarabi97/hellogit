import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ConfirmDialogMatDialogDataInterface } from '../interfaces';

@Component({
  selector: 'app-confirm-dailog',
  templateUrl: './confirm-dailog.component.html',
  styleUrls: ['./confirm-dailog.component.scss']
})
export class ConfirmDailogComponent {

  /**
   * Creates an instance of ConfirmDailogComponent.
   *
   * @param {MatDialogRef<ConfirmDailogComponent>} dialogRef
   * @param {ConfirmDialogMatDialogDataInterface} data
   * @memberof ConfirmDailogComponent
   */
  constructor(public dialogRef: MatDialogRef<ConfirmDailogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogMatDialogDataInterface) { }

  /**
   * closes the dialogRef
   *
   * @param {string} selectedOption
   * @memberof ConfirmDailogComponent
   */
  close(selectedOption: string) {
    this.dialogRef.close(selectedOption === 'option1' ? this.data.option1 : this.data.option2);
  }
}
