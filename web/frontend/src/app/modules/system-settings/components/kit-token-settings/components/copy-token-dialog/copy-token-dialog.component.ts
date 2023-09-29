import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MAT_SNACKBAR_CONFIGURATION_60000_DUR_OK } from '../../../../../../constants/cvah.constants';
import { MatSnackBarService } from '../../../../../../services/mat-snackbar.service';
import { CopyTokenDialogDataInterface } from '../../../../interfaces';

/**
 * Component used for copy token
 *
 * @export
 * @class CopyTokenDialogComponent
 */
@Component({
  selector: 'cvah-copy-token-modal-dialog',
  templateUrl: './copy-token-dialog.component.html',
  styleUrls: ['./copy-token-dialog.component.scss']
})
export class CopyTokenDialogComponent {
  // Used for displaying title within html dialog
  title: string;
  // Used for displaying token within html textarea
  token: string;

  /**
   * Creates an instance of CopyTokenDialogComponent.
   *
   * @param {MatDialogRef<CopyTokenDialogComponent>} mat_dialog_ref_
   * @param {Clipboard} clipboard_
   * @param {CopyTokenDialogDataInterface} mat_dialog_data
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof CopyTokenDialogComponent
   */
  constructor(private mat_dialog_ref_: MatDialogRef<CopyTokenDialogComponent>,
              @Inject(Clipboard) private readonly clipboard_: Clipboard,
              @Inject(MAT_DIALOG_DATA) mat_dialog_data: CopyTokenDialogDataInterface,
              private mat_snackbar_service_: MatSnackBarService) {
    this.title = mat_dialog_data.title;
    this.token = mat_dialog_data.token;
  }

  /**
   * Used for copying token to clipboard
   *
   * @memberof CopyTokenDialogComponent
   */
  click_button_copy_token(): void {
    const clipboard_copy: boolean = this.clipboard_.copy(this.token);
    /* istanbul ignore else */
    if (clipboard_copy === true) {
      const message: string = 'Token copied to clipboard!';
      this.mat_snackbar_service_.displaySnackBar(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR_OK);
    }
  }

  /**
   * Used for closing the mat dialog ref
   *
   * @memberof CopyTokenDialogComponent
   */
  click_button_close(): void {
    this.mat_dialog_ref_.close();
  }
}
