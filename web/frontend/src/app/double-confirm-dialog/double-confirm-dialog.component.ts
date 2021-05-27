import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-double-confirm-dialog',
  templateUrl: './double-confirm-dialog.component.html',
  styleUrls: ['./double-confirm-dialog.component.scss']
})
export class DoubleConfirmDialogComponent {
  doubleConfirm = "";

  /**
   *Creates an instance of ConfirmDailogComponent.
   * @param {MatDialogRef<ConfirmDailogComponent>} dialogRef
   * @param {*} data
   * @memberof ConfirmDailogComponent
   */
  constructor(public dialogRef: MatDialogRef<DoubleConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA)
              public data: {paneString: string,
                            paneTitle: string,
                            option1: string,
                            option2: string,
                            doubleConfirmText: string}) {
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

  isConfirmEnabled(){
    return this.doubleConfirm === this.data.doubleConfirmText;
  }

}
