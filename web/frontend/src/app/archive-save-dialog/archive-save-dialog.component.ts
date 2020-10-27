import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-archive-dialog',
  templateUrl: './archive-save-dialog.component.html',
  styleUrls: ['./archive-save-dialog.component.scss']
})
export class ArchiveSaveDialogComponent {
    constructor(public dialogRef: MatDialogRef<ArchiveSaveDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data) { }
}
