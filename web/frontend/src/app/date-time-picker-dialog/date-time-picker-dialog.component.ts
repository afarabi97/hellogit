import { Component, Inject } from '@angular/core';
import { ConfirmDailogComponent } from '../confirm-dailog/confirm-dailog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TIMEZONES } from '../frontend-constants';
@Component({
    selector: 'app-date-time-picker-dialog',
    template: `
    <h1 matDialogTitle>{{data.paneTitle}}</h1>
    <div mat-dialog-content>
    <p>{{data.paneString}}</p>
    <div fxLayout="row" fxLayoutGap="10px">
        <app-date-time [formControl]="data.date" placeholder="Current Date & Time"></app-date-time>
        <mat-form-field>
        <mat-label>Time Zone</mat-label>
        <mat-select [formControl]="data.timezone" >
            <mat-option value="{{timezone}}" *ngFor="let timezone of timeZones">{{timezone}}</mat-option>
        </mat-select>
        </mat-form-field>
    </div>
    </div>
    <div mat-dialog-actions fxLayout="row" fxLayoutGap="5px" fxLayoutAlign="end center">
        <button mat-raised-button (click)="close('option1')">{{data.option1}}</button>
        <button mat-raised-button color="primary" (click)="close('option2')">{{data.option2}}</button>
    </div>
    `
})
export class DateTimePickerDialogComponent extends ConfirmDailogComponent {
    public timeZones = TIMEZONES;
    /**
     *Creates an instance of ConfirmDailogComponent.
     * @param {MatDialogRef<ConfirmDailogComponent>} dialogRef
     * @param {*} data
     * @memberof ConfirmDailogComponent
     */
    constructor(public dialogRef: MatDialogRef<ConfirmDailogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
        super(dialogRef, data);
    }
}
