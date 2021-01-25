import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { BackingObjectInterface } from '../interfaces';
import { DialogControlTypes, DialogFormControl } from './modal-dialog-mat-form-types';
import {COMMA, ENTER, SPACE} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';


export interface Chip {
  name: string;
}

@Component({
  selector: 'app-modal-dialog-mat',
  templateUrl: './modal-dialog-mat.component.html',
  styleUrls: ['./modal-dialog-mat.component.scss']
})
export class ModalDialogMatComponent {
  title: string;
  instructions: string;
  dialogForm: FormGroup;
  confirmBtnText: string;

  //Chip stuff
  readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
  chips: string[] = [];

  constructor(public dialogRef: MatDialogRef<ModalDialogMatComponent>,
              @Inject(MAT_DIALOG_DATA) public backingObject: BackingObjectInterface) {
      this.title = backingObject.title;
      this.instructions = backingObject.instructions;
      this.dialogForm = backingObject.dialogForm;
      this.confirmBtnText = backingObject.confirmBtnText;
  }

  objectValues(obj: any) {
    const ret_val = [];
    for (const item of Object.values(obj)){
      ret_val.push(item);
    }

    return ret_val;
  }

  getTimezoneControl(){
    return this.dialogForm.get('timezone');
  }

  isTextInput(control: DialogFormControl): boolean {
    return control.controlType === DialogControlTypes.text;
  }

  isTextArea(control: DialogFormControl): boolean {
    return control.controlType === DialogControlTypes.textarea;
  }

  isPasswordInput(control: DialogFormControl): boolean {
    return control.controlType === DialogControlTypes.password;
  }

  isDateInput(control: DialogFormControl): boolean{
    return control.controlType === DialogControlTypes.date;
  }

  isDropDown(control: DialogFormControl): boolean {
    return control.controlType === DialogControlTypes.dropdown;
  }

  isCheckBox(control: DialogFormControl): boolean {
    return control.controlType === DialogControlTypes.checkbox;
  }

  isChips(control: DialogFormControl): boolean {
    return control.controlType === DialogControlTypes.chips;
  }

  getErrorMessage(control: DialogFormControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  submitAndClose(): void{
    for (const control of this.objectValues(this.dialogForm.controls)){
      if (this.isChips(control)){
        control.setValue(this.chips.join(","));
      }
    }
    this.dialogRef.close(this.dialogForm);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  // Chip Controls
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our chip
    if ((value || '').trim()) {
      this.chips.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(chip: string): void {
    const index = this.chips.indexOf(chip);

    if (index >= 0) {
      this.chips.splice(index, 1);
    }
  }
}
