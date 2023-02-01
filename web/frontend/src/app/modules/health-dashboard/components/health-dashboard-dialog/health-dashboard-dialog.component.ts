import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { KeyValueClass } from '../../../../classes';
import { HealthDashboardDialogDataInterface } from '../../interfaces';

/**
 * Component used for displaying health dashboard key value pairs
 *
 * @export
 * @class HealthDashboardDialogComponent
 */
@Component({
  selector: 'cvah-health-dashboard-dialog',
  templateUrl: './health-dashboard-dialog.component.html',
  styleUrls: ['./health-dashboard-dialog.component.scss']
})
export class HealthDashboardDialogComponent {
  // Used for passing title to html
  title: string;
  // Used for passing dialog data as info to html
  info: KeyValueClass[];

  /**
   * Creates an instance of HealthDashboardDialogComponent.
   *
   * @param {MatDialogRef<HealthDashboardDialogComponent>} mat_dialog_ref_
   * @param {HealthDashboardDialogDataInterface} mat_dialog_data
   * @memberof HealthDashboardDialogComponent
   */
  constructor(private mat_dialog_ref_: MatDialogRef<HealthDashboardDialogComponent>,
              @Inject(MAT_DIALOG_DATA) mat_dialog_data: HealthDashboardDialogDataInterface) {
    this.title = mat_dialog_data.title;
    this.info = mat_dialog_data.info;
  }

  /**
   * Used for closing the mat dialog
   *
   * @memberof HealthDashboardDialogComponent
   */
  close(): void {
    this.mat_dialog_ref_.close();
  }
}
