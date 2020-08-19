import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-archive-dialog',
  templateUrl: './archive-save-dialog.component.html',
  styles: [`
    mat-form-field{
      width:100%
    }
  `]
})
export class ArchiveSaveDialogComponent {
    constructor(public dialogRef: MatDialogRef<ArchiveSaveDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data) { }
}
