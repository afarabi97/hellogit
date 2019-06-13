import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { DialogControlTypes, DialogFormControl } from './modal-dialog-mat-form-types';

@Component({
  selector: 'app-modal-dialog-mat',
  templateUrl: './modal-dialog-mat.component.html',
  styleUrls: ['./modal-dialog-mat.component.scss']
})
export class ModalDialogMatComponent implements OnInit {
  title: string;
  instructions: string;
  dialogForm: FormGroup;
  confirmBtnText: string;

  constructor(public dialogRef: MatDialogRef<ModalDialogMatComponent>,
              @Inject(MAT_DIALOG_DATA)
              public backingObject: { title: string, instructions: string, dialogForm: FormGroup, confirmBtnText: string})
  {
      this.title = backingObject.title;
      this.instructions = backingObject.instructions;
      this.dialogForm = backingObject.dialogForm;
      this.confirmBtnText = backingObject.confirmBtnText;
  }

  ngOnInit() {}

  objectValues(obj: any) {
    let ret_val = [];
    for (let item of Object.values(obj)){
        ret_val.push(item);
    }
    return ret_val;
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

  public getErrorMessage(control: DialogFormControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  submitAndClose(): void{
    this.dialogRef.close(this.dialogForm);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
