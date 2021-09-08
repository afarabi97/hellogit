import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-dialog-display-mat',
  templateUrl: './modal-dialog-display-mat.component.html',
  styleUrls: ['./modal-dialog-display-mat.component.scss']
})
export class ModalDialogDisplayMatComponent {
  title: string;
  info: string;
  confirmBtnText: string;

  constructor(public dialogRef: MatDialogRef<ModalDialogDisplayMatComponent>,
              @Inject(MAT_DIALOG_DATA)
              public backingObject: { title: string; info: string}) {
    this.title = backingObject.title;
    this.info = backingObject.info;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
