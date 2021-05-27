import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
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
export class UnusedIpAddressAutoCompleteComponent implements OnInit {
  // Unique ID passed from parent component to create unique element ids
  @Input() formControlInput: FormControl = new FormControl();
  @Input() options: string[] = [];
  @Input() inputPlaceHolder: string;
  @Input() matError: string;
  filteredOptions: Observable<any[]>;

  ngOnInit() {
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
