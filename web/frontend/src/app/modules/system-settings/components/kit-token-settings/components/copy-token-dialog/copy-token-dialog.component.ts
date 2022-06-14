import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'app-copy-token-modal-dialog',
  templateUrl: './copy-token-dialog.component.html',
  styleUrls: ['./copy-token-dialog.component.scss']
})
export class CopyTokenModalDialogComponent {
  title: string;
  token: string;
  confirmBtnText: string;

  constructor(public dialogRef: MatDialogRef<CopyTokenModalDialogComponent>,
              @Inject(MAT_DIALOG_DATA)
              public backingObject: { title: string; token: string },
              private clipboardApi: ClipboardService
              ) {
    this.title = backingObject.title;
    this.token = backingObject.token;
  }

  copyText() {
    this.clipboardApi.copyFromContent(this.token);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
