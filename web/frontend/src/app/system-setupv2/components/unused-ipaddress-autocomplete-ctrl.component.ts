import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { ObjectUtilitiesClass } from '../../classes';

@Component({
  selector: 'unused-ipaddress-autocomplete-ctrl',
  templateUrl: './unused-ipaddress-autocomplete-ctrl.component.html',
  styles: [`
    mat-form-field{
        width:100%
    }
  `]
})
export class UnusedIpAddressAutoCompleteComponent implements OnInit, OnChanges {
  // Unique ID passed from parent component to create unique element ids
  @Input() formControlInput: FormControl = new FormControl();
  @Input() options: string[] = [];
  @Input() labelInput: string;
  @Input() matTooltipInput: string;
  @Input() matError: string;
  filteredOptions: Observable<any[]>;

  ngOnInit() {
    this.filter_options_();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const options_changes: SimpleChange = changes['options'];
    if (ObjectUtilitiesClass.notUndefNull(options_changes) &&
        options_changes.currentValue !== options_changes.previousValue) {
      this.filter_options_();
    }
  }

  reset_form_control(event: boolean): void {
    if (event) {
      this.formControlInput.setValue('');
    }
  }

  private filter_options_(): void {
    if (this.formControlInput && this.options) {
      this.filteredOptions = this.formControlInput.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );
    }
  }

  private _filter(value: string): string[] {
    if (value){
      const filterValue = value ? value.toLowerCase() : '';
      return this.options.filter(option => option.toLowerCase().includes(filterValue));
    }
    return this.options;
  }
}
