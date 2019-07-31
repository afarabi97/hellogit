import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material';

@Component({
    selector: 'app-date-time',
    template: `
     <div fxLayoutGap="10px">
      <mat-form-field>
        <!-- Datepicker requires an input be attached to it. So we'll give it a fake one -->
        <!-- We have to give it a fake one otherwise it will override the time fields in our date-->
        <input [matDatepicker]="picker" hidden (dateChange)="pickerUpdate($event)" [disabled]="isDisabled"/>
        <input
          matInput
          [value]="value | date:this.format"
          (change)="textChange($event)"
          [formControl]="control"
          placeholder="{{placeholder}}"
        />
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
        <mat-error>Invalid Date provided</mat-error>
        <mat-hint *ngIf="!!mandatoryTime">Time of day cannot be changed</mat-hint>
      </mat-form-field>
    </div>
    `,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: DateTimeComponent,
        multi: true
    }]
})
export class DateTimeComponent implements ControlValueAccessor, OnChanges {
    public  value: Date = null;
    private onChange;
    private showPicker = false;
    public isDisabled = false;

    // mat-form-field requires a form control to know how to set error state
    // making a dummy control to satisfy its needs
    control = new FormControl();

    @Input() format = 'M/dd/yyyy HH:mm:ss';
    @Input() placeholder;
    @Input() mandatoryTime: string;

    constructor(
        private _datePipe: DatePipe
    ) { }

    ngOnChanges() {
        this.writeValue(this.value);
    }

    /**
     * Listens for date change events from Datepicker
     * @param {MatDatepickerInputEvent<Date>} event datepicker event
     */
    pickerUpdate(event: MatDatepickerInputEvent<Date>) {
        const selectedDate = new Date(event.value);
        // create a new reference so Angular will pick up that the binding changed
        // and update the UI
        const hoursMinutesSeconds = this._getHoursMinutesSeconds();
        this.value = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            hoursMinutesSeconds[0], // hours
            hoursMinutesSeconds[1], // minutes
            hoursMinutesSeconds[2] // seconds
        );
        this.onChange(this.value);
        this.showPicker = !this.showPicker;
    }

    /**
     * Returns hours, minutes and seconds in UTC time as an array as [hours, minutes, seconds]
     * @private
     */
    private _getHoursMinutesSeconds(): [number, number, number] {
        if (this.mandatoryTime) {
            const defaultDate = this._getMandatoryTime(this.mandatoryTime);
            return [
                defaultDate.getHours(),
                defaultDate.getMinutes(),
                defaultDate.getSeconds()
            ];
        } else if (this.value) {
            return [
                this.value.getHours(),
                this.value.getMinutes(),
                this.value.getSeconds()
            ];
        } else {
            return [0, 0, 0];
        }
    }

    /**
     * Returns date object with manadatory hours and minutes in UTC time
     * @param mandatoryTime
     * @private
     */
    private _getMandatoryTime(mandatoryTime: string): Date {
        if (this.mandatoryTime && this.mandatoryTime.length === 4) {
            const hours = Number.parseInt(this.mandatoryTime[0] + this.mandatoryTime[1]);
            const minutes = Number.parseInt(this.mandatoryTime[2] + this.mandatoryTime[3]);
            return new Date(0, 0, 0, hours, minutes);
        }
        return new Date(0, 0, 0, 0, 0, 0);
    }

    /**
     * Listens for input change events from user typing directly in input
     * @param event input element event
     */
    textChange(event: any) {
        const prevDate = new Date(this.value);
        const newDate = new Date(event.target.value);
        if (newDate.toString() !== 'Invalid Date') {
            this.value = new Date(
                newDate.getFullYear(),
                newDate.getMonth(),
                newDate.getDate()
            );
            if (this.mandatoryTime) {
                const mandDate = this._getDateWithMandatoryTime(newDate);
                // if a mandatory time is set, DON'T allow this to be changed
                this.value.setHours(mandDate.getHours());
                this.value.setMinutes(mandDate.getMinutes());
                this.value.setSeconds(mandDate.getSeconds());
            } else {
                this.value.setHours(newDate.getHours());
                this.value.setMinutes(newDate.getMinutes());
                this.value.setSeconds(newDate.getSeconds());
            }
            this.control.setValue(this._datePipe.transform(this.value, this.format));
            this.control.setErrors(null);
            this.onChange(this.value);
        } else {
            this.control.setErrors({ date: event.target.value });
            this.value = prevDate;
        }
    }

    /**
     * Implemented from ControlValueAccessor interface
     * @param obj
     */
    writeValue(obj: Date): void {
        this.value = obj && this.mandatoryTime ? this._getDateWithMandatoryTime(obj) : obj;
        this.control.reset({ value: this._datePipe.transform(this.value, this.format), disabled: this.isDisabled });
    }

    private _getDateWithMandatoryTime(date: Date): Date {
        const hoursMinutesSeconds = this._getHoursMinutesSeconds();
        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hoursMinutesSeconds[0], // hours
            hoursMinutesSeconds[1], // minutes
            hoursMinutesSeconds[2] // seconds
        );
    }

    /**
     * Implemented from ControlValueAccessor interface
     * @param fn
     */
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    /**
     * Implemented from ControlValueAccessor interface. Nothing special needs to be done on touch of the field
     * @param fn
     */
    registerOnTouched(fn: any): void {
    }

    /**
     * Implemented from ControlValueAccessor interface
     * @param {boolean} isDisabled
     */
    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
        this.control.reset({ value: this.control.value, disabled: isDisabled });
    }
}
