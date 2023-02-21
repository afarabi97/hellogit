import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MatDialogDataTitleInfoStringInterface } from '../../../../interfaces';

/**
 * Component used for displaying dialog message
 *
 * @export
 * @class ModalDialogDisplayMatComponent
 */
@Component({
  selector: 'cvah-modal-dialog-display-mat',
  templateUrl: './modal-dialog-display-mat.component.html',
  styleUrls: ['./modal-dialog-display-mat.component.scss']
})
export class ModalDialogDisplayMatComponent {
  // Used for passing title to html
  title: string;
  // Used for passing info string to html
  info: string;

  /**
   * Creates an instance of ModalDialogDisplayMatComponent.
   *
   * @param {MatDialogRef<ModalDialogDisplayMatComponent>} mat_dialog_ref_
   * @param {MatDialogDataTitleInfoStringInterface} mat_dialog_data
   * @memberof ModalDialogDisplayMatComponent
   */
  constructor(private mat_dialog_ref_: MatDialogRef<ModalDialogDisplayMatComponent>,
              @Inject(MAT_DIALOG_DATA) mat_dialog_data: MatDialogDataTitleInfoStringInterface) {
    this.title = mat_dialog_data.title;
    this.info = mat_dialog_data.info;
  }

  /**
   * Used for closing the dialog display
   *
   * @memberof ModalDialogDisplayMatComponent
   */
  close(): void {
    this.mat_dialog_ref_.close();
  }
}
