import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDatepickerInputEvent, MatSelectChange } from '@angular/material';

import { ObjectUtilitiesClass } from '../../classes';
import { returnDate } from '../../functions/cvah.functions';
import { TIMEZONES } from './constants/date-time.constants';
import { getCurrentDate } from './functions/date-time.functions';

/**
 * Component used for date time realted functionality
 *
 * @export
 * @class DateTimeComponent
 * @implements {OnChanges}
 */
@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: DateTimeComponent,
    multi: true
  }]
})
export class DateTimeComponent implements OnChanges {
  // Unique ID passed from parent component to create unique element ids
  @Input() uniqueHTMLID: string;
  @Input() datetime: FormControl;
  @Input() timezone: FormControl;
  @Input() format = 'MM/dd/yyyy HH:mm:ss';
  @Input() placeholder: string;
  timeZones = TIMEZONES;
  value: Date = null;
  isDisabled: boolean;

  /**
   * Creates an instance of DateTimeComponent.
   *
   * @param {DatePipe} datePipe_
   * @memberof DateTimeComponent
   */
  constructor(private datePipe_: DatePipe) {
    this.isDisabled = false;
  }

  /**
   * Listens for changes on inputs
   *
   * @memberof DateTimeComponent
   */
  ngOnChanges(): void {
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(this.datetime)){
      this.changeDateTime_();
      this.writeValue_(this.value);
    }
  }

    /**
     * Used for generating unique element id for html
     *
     * @param {string} passedID
     * @returns {string}
     * @memberof DateTimeComponent
     */
  generateUniqueHTMLID(passedID: string): string {
    return ObjectUtilitiesClass.notUndefNull(this.uniqueHTMLID) ? `${this.uniqueHTMLID}-${passedID}` : passedID;
  }

  /**
   * Used for calling private changeDateTime_()
   *
   * @param {MatSelectChange} timezoneChg
   * @memberof DateTimeComponent
   */
  changeDateTime(timezoneChg: MatSelectChange): void {
    this.changeDateTime_(timezoneChg.value);
  }

  /**
     * Listens for date change events from Datepicker
   *
   * @param {MatDatepickerInputEvent<Date>} event
   * @memberof DateTimeComponent
   */
  pickerUpdate(event: MatDatepickerInputEvent<Date>): void {
    const selectedDate = new Date(event.value);
    // create a new reference so Angular will pick up that the binding changed
    // and update the UI
    const hoursMinutesSeconds = this.getHoursMinutesSeconds_();
    this.value = returnDate( selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(),
                             hoursMinutesSeconds[0], hoursMinutesSeconds[1], hoursMinutesSeconds[2] );
  }

  /**
     * Listens for input change events from user typing directly in input
   *
   * @param {*} event
   * @memberof DateTimeComponent
   */
  textChange(event: any): void {
    const prevDate = new Date(this.value);
    const newDate = new Date(event.target.value);
    if (newDate.toString() !== 'Invalid Date') {
      this.value = returnDate( newDate.getFullYear(), newDate.getMonth(), newDate.getDate(),
                               newDate.getHours(), newDate.getMinutes(), newDate.getSeconds() );
      this.datetime.setValue(this.datePipe_.transform(this.value, this.format));
      this.datetime.setErrors(null);
    } else {
      this.datetime.setErrors({ date: event.target.value });
      this.value = prevDate;
    }
  }

  /**
   * Used for changing the date and time
   *
   * @private
   * @param {string} [timezonestr='UTC']
   * @memberof DateTimeComponent
   */
  private changeDateTime_(timezonestr: string = 'UTC'): void {
    /* istanbul ignore else */
    if (timezonestr === 'Browser') {
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.timezone.setValue(browserTimezone);
      timezonestr = browserTimezone;
    }

    this.value = getCurrentDate(timezonestr);
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(this.value) &&
        ObjectUtilitiesClass.notUndefNull(this.datetime)) {
      this.writeValue_(this.value);
    }
  }

  /**
     * Returns hours, minutes and seconds in UTC time as an array as [hours, minutes, seconds]
   *
   * @private
   * @returns {number[]}
   * @memberof DateTimeComponent
   */
  private getHoursMinutesSeconds_(): number[] {
    if (ObjectUtilitiesClass.notUndefNull(this.value)) {
      return [ this.value.getHours(), this.value.getMinutes(), this.value.getSeconds() ];
    } else {
      return [ 0, 0, 0 ];
    }
  }

  /**
   * Used for writing a new value and reseting the datetime with new value
   *
   * @private
   * @param {Date} newDate
   * @memberof DateTimeComponent
   */
  private writeValue_(newDate: Date): void {
    this.value = newDate;
    this.datetime.reset({ value: this.datePipe_.transform(this.value, this.format), disabled: this.isDisabled });
  }
}
