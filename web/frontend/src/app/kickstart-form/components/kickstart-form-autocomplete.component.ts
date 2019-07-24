import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
@Component({
  selector: 'app-kickstart-form-autocomplete',
  template: `
    <form>
    <mat-form-field>
      <input type="text" placeholder="{{inputPlaceHolder}}" matInput [formControl]="formControlInput" [matAutocomplete]="auto">
      <mat-error *ngIf="matError">{{matError}}</mat-error>
      <mat-autocomplete #auto="matAutocomplete">
        <mat-option *ngFor="let option of filteredOptions | async" [value]="option">
          {{option}}
        </mat-option>
      </mat-autocomplete>
      <mat-icon
      *ngIf="
      formControlInput.valid &&
      formControlInput.touched
      "
      matSuffix
      color="primary"
      >check_circle</mat-icon>
    <mat-icon
      *ngIf="
      formControlInput.invalid &&
      formControlInput.touched
      "
      matSuffix
      color="warn"
      >error</mat-icon>
    </mat-form-field>
  </form>
  `,
  styles: [`
        mat-form-field{
            width:100%
        }
  `]
})
export class KickstartFormAutoCompleteComponent implements OnChanges {
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
