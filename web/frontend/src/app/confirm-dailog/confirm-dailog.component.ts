import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirm-dailog',
  templateUrl: './confirm-dailog.component.html',
  styleUrls: ['./confirm-dailog.component.scss']
})
export class ConfirmDailogComponent {


  /**
   *Creates an instance of ConfirmDailogComponent.
   * @param {MatDialogRef<ConfirmDailogComponent>} dialogRef
   * @param {*} data
   * @memberof ConfirmDailogComponent
   */
  constructor( public dialogRef: MatDialogRef<ConfirmDailogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  /**
   * closes the dialogRef
   *
   * @param {string} selectedOption
   * @memberof ConfirmDailogComponent
   */
  close(selectedOption: string) {
    selectedOption === 'option1' ? this.dialogRef.close(this.data.option1) : this.dialogRef.close(this.data.option2);
  }

}
