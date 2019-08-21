import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDatepickerInputEvent, MatSelectChange } from '@angular/material';


export const TIMEZONES = [
  'UTC',
  'Browser',
  'America/Chicago',
  'America/Denver',
  'America/Detroit',
  'America/Los_Angeles',
  'America/New_York'
];

export function getCurrentDate(timezone: string='UTC') {
  const date = new Date();
  const year = date.toLocaleString('en-US', {year: 'numeric', timeZone: timezone });
  const month = date.toLocaleString('en-US', {month: '2-digit', timeZone: timezone });
  const day = date.toLocaleString('en-US', {day: '2-digit', timeZone: timezone });
  const hours = date.toLocaleString('en-US', {hour: '2-digit', hour12: false, timeZone: timezone });
  const minutes = date.toLocaleString('en-US', {minute: '2-digit', timeZone: timezone });
  const seconds = date.toLocaleString('en-US', {second: '2-digit', timeZone: timezone });
  return new Date(parseInt(year), (parseInt(month) - 1), parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
}

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
          [formControl]="datetime"
          placeholder="{{placeholder}}"
        />
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
        <mat-error>Invalid Date provided</mat-error>
        <mat-hint *ngIf="!!mandatoryTime">Time of day cannot be changed</mat-hint>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Time Zone</mat-label>
        <mat-select [formControl]="timezone" (selectionChange)="changeDateTime($event)">
            <mat-option value="{{timezone}}" *ngFor="let timezone of timeZones">{{timezone}}</mat-option>
        </mat-select>
        </mat-form-field>
    </div>
    `,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: DateTimeComponent,
        multi: true
    }]
})
export class DateTimeComponent implements OnChanges {
    public timeZones = TIMEZONES;
    public value: Date = null;
    private showPicker = false;
    public isDisabled = false;

    @Input()
    datetime: FormControl;

    @Input()
    timezone: FormControl;

    @Input() format = 'MM/dd/yyyy HH:mm:ss';
    @Input() placeholder;
    @Input() mandatoryTime: string;

    constructor(
        private _datePipe: DatePipe
    ) {
    }

    ngOnChanges() {
      if (this.datetime){
         this._changeDateTime();
         this.writeValue(this.value);
      }
    }

    private _changeDateTime(timezonestr: string="UTC"){
      if (timezonestr === "Browser"){
        let browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.timezone.setValue(browserTimezone);
        timezonestr = browserTimezone;
      }

      this.value = getCurrentDate(timezonestr);
      if (this.value && this.datetime)
        this.writeValue(this.value);
    }

    changeDateTime(timezoneChg: MatSelectChange){
      this._changeDateTime(timezoneChg.value);
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
            this.datetime.setValue(this._datePipe.transform(this.value, this.format));
            this.datetime.setErrors(null);
        } else {
            this.datetime.setErrors({ date: event.target.value });
            this.value = prevDate;
        }
    }

    /**
     * Implemented from ControlValueAccessor interface
     * @param obj
     */
    writeValue(obj: Date): void {
        this.value = obj && this.mandatoryTime ? this._getDateWithMandatoryTime(obj) : obj;
        this.datetime.reset({ value: this._datePipe.transform(this.value, this.format), disabled: this.isDisabled });
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
}
