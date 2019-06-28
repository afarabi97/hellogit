import { Component, Input, OnChanges, Output, EventEmitter, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
@Component({
    selector: 'app-archive-dialog',
    template: `
    <h2 mat-dialog-title>Save {{data.title}}</h2>
    <mat-dialog-content>
    <p> Are you sure you want to save this {{data.title}}? </p>
    <mat-form-field>
    <mat-label>Comment</mat-label>
    <textarea matInput rows="10" placeholder="Enter a reminder as to what this configuration is for." [(ngModel)]="data.archive.comment"></textarea>
    </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions fxLayout="row" fxLayoutAlign="end center">
        <button mat-raised-button (click)="dialogRef.close()">Cancel</button>
        <button mat-raised-button color="primary" [mat-dialog-close]="data.archive">Save</button>
    </mat-dialog-actions>
  `,
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
