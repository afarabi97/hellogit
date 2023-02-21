import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { ObjectUtilitiesClass } from '../../../../classes';

/**
 * Used for displaying any unused ip addresses
 *
 * @export
 * @class UnusedIpAddressAutoCompleteComponent
 * @implements {OnInit}
 * @implements {OnChanges}
 */
@Component({
  selector: 'cvah-unused-ipaddress-autocomplete-ctrl',
  templateUrl: './unused-ipaddress-autocomplete-ctrl.component.html',
  styleUrls: ['./unused-ipaddress-autocomplete-ctrl.component.scss']
})
export class UnusedIpAddressAutoCompleteComponent implements OnInit, OnChanges {
  // Parent component passed inputs
  @Input() form_control: FormControl;
  @Input() options: string[];
  @Input() label: string;
  @Input() mat_tooltip: string;
  @Input() mat_error: string;
  filtered_options: Observable<any[]>;

  /**
   * Creates an instance of UnusedIpAddressAutoCompleteComponent.
   *
   * @memberof UnusedIpAddressAutoCompleteComponent
   */
  constructor() {
    this.form_control = new FormControl();
    this.options = [];
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof UnusedIpAddressAutoCompleteComponent
   */
  ngOnInit(): void {
    this.filter_options_();
  }

  /**
   * Listens for changes on inputs
   *
   * @param {SimpleChanges} changes
   * @memberof UnusedIpAddressAutoCompleteComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    const options_changes: SimpleChange = changes['options'];
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(options_changes) &&
        options_changes.currentValue !== options_changes.previousValue) {
      this.filter_options_();
    }
  }

  /**
   * Used for resetting a form control
   *
   * @memberof UnusedIpAddressAutoCompleteComponent
   */
  reset_form_control(event: boolean): void {
    /* istanbul ignore else */
    if (event) {
      this.form_control.reset('');
    }
  }

  /**
   * Used for filtering options used in html
   *
   * @private
   * @memberof UnusedIpAddressAutoCompleteComponent
   */
  private filter_options_(): void {
    /* istanbul ignore else */
    if (this.form_control && this.options) {
      this.filtered_options = this.form_control.valueChanges
                                .pipe(startWith(''),
                                      map((value: string) => this.filter_(value)));
    }
  }

  /**
   * Used for filtering a value from options input
   *
   * @private
   * @param {string} value
   * @return {string[]}
   * @memberof UnusedIpAddressAutoCompleteComponent
   */
  private filter_(value: string): string[] {
    if (ObjectUtilitiesClass.notUndefNull(value)) {
      return this.options.filter((option: string) => option.toLowerCase().includes(value.toLowerCase()));
    } else {
      return this.options;
    }
  }
}
