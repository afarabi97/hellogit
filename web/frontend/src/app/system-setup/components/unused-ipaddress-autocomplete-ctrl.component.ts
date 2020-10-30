import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
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
export class UnusedIpAddressAutoCompleteComponent implements OnChanges {
  // Unique ID passed from parent component to create unique element ids
  @Input() uniqueHTMLID: string;
  @Input() formControlInput: FormControl = new FormControl();
  @Input() options: string[] = [];
  @Input() inputPlaceHolder: string;
  @Input() matError: string;
  @Output() inputChange: EventEmitter<any> = new EventEmitter();
  filteredOptions: Observable<any[]>;

  ngOnChanges() {
    if (this.formControlInput && this.options) {
      // first emitter
      this.emitValueChanges(undefined);
      this.filteredOptions = this.formControlInput.valueChanges
        .pipe(
          startWith(''),
          tap(value => this.emitValueChanges(value)),
          map(value => this._filter(value))
        );
    }
  }

  /**
   * Used for generating unique element id for html
   *
   * @param {string} passedID
   * @returns {string}
   * @memberof UnusedIpAddressAutoCompleteComponent
   */
  generateUniqueHTMLID(passedID: string): string {
    return ObjectUtilitiesClass.notUndefNull(this.uniqueHTMLID) ? `${this.uniqueHTMLID}-${passedID}` : passedID;
  }

  private _filter(value: string): string[] {
    const filterValue = value ? value.toLowerCase() : '';
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  emitValueChanges(value: string) {
    this.inputChange.emit({
      value: value
    });
  }

}
