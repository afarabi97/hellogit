import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'node-info-dialog',
  templateUrl: 'node-info-dialog.component.html',
  styleUrls: ['node-info-dialog.component.css']
})
export class NodeInfoDialogComponent {

  constructor( public dialogRef: MatDialogRef<NodeInfoDialogComponent>,
               @Inject(MAT_DIALOG_DATA) public backingObj: any) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
