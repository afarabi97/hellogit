import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-health-dashboard-modal-dialog',
  templateUrl: './health-dashboard-dialog.component.html',
  styleUrls: ['./health-dashboard-dialog.component.scss']
})
export class HealthDashboardModalDialogComponent {
  title: string;
  info: Object;
  confirmBtnText: string;

  constructor(public dialogRef: MatDialogRef<HealthDashboardModalDialogComponent>,
              @Inject(MAT_DIALOG_DATA)
              public backingObject: { title: string, info: Object }) {
    this.title = backingObject.title;
    this.info = backingObject.info;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
