import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { PodLogClass } from '../../../../classes';
import { PodLogDialogDataInterface } from '../../../../interfaces';

/**
 * Component used for displaying pod log dtata
 *
 * @export
 * @class PodLogDialogComponent
 */
@Component({
  selector: 'cvah-pod-log-dialog',
  templateUrl: './pod-log-dialog.component.html',
  styleUrls: ['./pod-log-dialog.component.scss']
})
export class PodLogDialogComponent {
  // Used for passing readonly value to text editor
  readonly show_options: boolean = false;
  readonly is_read_only: boolean = true;
  readonly use_language: string = 'txt';
  // Used for passing title to html
  title: string;
  // Used for passing dialog data as info to html
  pod_logs: PodLogClass[];

  /**
   * Creates an instance of PodLogDialogComponent.
   *
   * @param {MatDialogRef<PodLogDialogComponent>} mat_dialog_ref_
   * @param {PodLogDialogDataInterface} mat_dialog_data
   * @memberof PodLogDialogComponent
   */
  constructor(private mat_dialog_ref_: MatDialogRef<PodLogDialogComponent>,
              @Inject(MAT_DIALOG_DATA) mat_dialog_data: PodLogDialogDataInterface) {
    this.title = mat_dialog_data.title;
    this.pod_logs = mat_dialog_data.info;
  }

  /**
   * Used for closing the mat dialog
   *
   * @memberof PodLogDialogComponent
   */
  close(): void {
    this.mat_dialog_ref_.close();
  }
}
