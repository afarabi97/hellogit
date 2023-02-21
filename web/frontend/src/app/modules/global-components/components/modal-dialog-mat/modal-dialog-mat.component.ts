import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogFormControlClass, ObjectUtilitiesClass } from '../../../../classes';
import { DialogControlTypesEnum } from '../../../../enums/dialog-control-types.enum';
import { BackingObjectInterface } from '../../../../interfaces';

/**
 * Component used for displaying dynamic dialog form controls
 *
 * @export
 * @class ModalDialogMatComponent
 */
@Component({
  selector: 'cvah-modal-dialog-mat',
  templateUrl: './modal-dialog-mat.component.html',
  styleUrls: ['./modal-dialog-mat.component.scss']
})
export class ModalDialogMatComponent {
  // Used for passing values and data to html
  title: string;
  instructions: string;
  dialog_form_group: FormGroup;
  confirm_button_text: string;
  // Used for passing key codes for a seperator
  seperator_key_codes: number[];
  // Used for holding on to list of chips displayed in html and tied to a dialog form control
  chips: string[];

  /**
   * Creates an instance of ModalDialogMatComponent.
   *
   * @param {MatDialogRef<ModalDialogMatComponent>} mat_dialog_ref_
   * @param {BackingObjectInterface} mat_dialog_data
   * @memberof ModalDialogMatComponent
   */
  constructor(private mat_dialog_ref_: MatDialogRef<ModalDialogMatComponent>,
              @Inject(MAT_DIALOG_DATA) mat_dialog_data: BackingObjectInterface) {
    this.title = mat_dialog_data.title;
    this.instructions = mat_dialog_data.instructions;
    this.dialog_form_group = mat_dialog_data.dialogForm;
    this.confirm_button_text = mat_dialog_data.confirmBtnText;
    this.seperator_key_codes = [ENTER, COMMA, SPACE];
    this.chips = [];
  }

  /**
   * Used for retrieving all of the form controls from a dialog form group
   *
   * @param {FormGroup} dialog_form_group
   * @return {DialogFormControlClass[]}
   * @memberof ModalDialogMatComponent
   */
  get_dialog_form_controls(dialog_form_group: FormGroup): DialogFormControlClass[] {
    const dialog_form_controls: DialogFormControlClass[] = [];
    for (const dialog_form_control of Object.values(dialog_form_group.controls)) {
      dialog_form_controls.push(dialog_form_control as DialogFormControlClass);
    }

    return dialog_form_controls;
  }

  /**
   * Used for checking if control is text input
   *
   * @param {DialogFormControlClass} control
   * @return {boolean}
   * @memberof ModalDialogMatComponent
   */
  is_text_input(control: DialogFormControlClass): boolean {
    return control.controlType === DialogControlTypesEnum.text;
  }

  /**
   * Used for checking if control is textarea
   *
   * @param {DialogFormControlClass} control
   * @return {boolean}
   * @memberof ModalDialogMatComponent
   */
  is_textarea(control: DialogFormControlClass): boolean {
    return control.controlType === DialogControlTypesEnum.textarea;
  }

  /**
   * Used for checking if control is password input
   *
   * @param {DialogFormControlClass} control
   * @return {boolean}
   * @memberof ModalDialogMatComponent
   */
  is_password_input(control: DialogFormControlClass): boolean {
    return control.controlType === DialogControlTypesEnum.password;
  }

  /**
   * Used for checking if control is dropdown
   *
   * @param {DialogFormControlClass} control
   * @return {boolean}
   * @memberof ModalDialogMatComponent
   */
  is_dropdown(control: DialogFormControlClass): boolean {
    return control.controlType === DialogControlTypesEnum.dropdown;
  }

  /**
   * Used for checking if control is checkbox
   *
   * @param {DialogFormControlClass} control
   * @return {boolean}
   * @memberof ModalDialogMatComponent
   */
  is_checkbox(control: DialogFormControlClass): boolean {
    return control.controlType === DialogControlTypesEnum.checkbox;
  }

  /**
   * Used for checking if control is date input
   *
   * @param {DialogFormControlClass} control
   * @return {boolean}
   * @memberof ModalDialogMatComponent
   */
  is_date_input(control: DialogFormControlClass): boolean {
    return control.controlType === DialogControlTypesEnum.date;
  }

  /**
   * Used for getting the timezone form control from the form group
   *
   * @return {DialogFormControlClass}
   * @memberof ModalDialogMatComponent
   */
  get_timezone_control(): DialogFormControlClass {
    return this.dialog_form_group.get('timezone') as DialogFormControlClass;
  }

  /**
   * Used for checking if control is chips
   *
   * @param {DialogFormControlClass} control
   * @return {boolean}
   * @memberof ModalDialogMatComponent
   */
  is_chips(control: DialogFormControlClass): boolean {
    return control.controlType === DialogControlTypesEnum.chips;
  }

  /**
   * Used for returning an error message for a form control
   *
   * @param {AbstractControl} control
   * @return {string}
   * @memberof ModalDialogMatComponent
   */
  get_error_message(control: DialogFormControlClass): string {
    return ObjectUtilitiesClass.notUndefNull(control) &&
           ObjectUtilitiesClass.notUndefNull(control.errors) ? control.errors.error_message : '';
  }

  /**
   * Used for adding an alert chip
   *
   * @param {MatChipInputEvent} event
   * @memberof ModalDialogMatComponent
   */
  add_alert_chip(event: MatChipInputEvent): void {
    const input: HTMLInputElement = event.input;
    const value: string = event.value.trim();

    /* istanbul ignore else */
    if (value !== '') {
      this.chips.push(value);
    }

    input.value = '';
  }

  /**
   * Used for removing chip
   *
   * @param {string} chip
   * @memberof ModalDialogMatComponent
   */
  remove_alert_chip(chip: string): void {
    const index_from_chips: number = this.chips.indexOf(chip);

    /* istanbul ignore else */
    if (index_from_chips >= 0) {
      this.chips.splice(index_from_chips, 1);
    }
  }

  /**
   * Used for closing the dialog form control component
   *
   * @memberof ModalDialogMatComponent
   */
  cancel(): void {
    this.mat_dialog_ref_.close();
  }

  /**
   * Used for sending dialog form group back to parent component
   *
   * @memberof ModalDialogMatComponent
   */
  submit(): void {
    for (const dialog_form_control of this.get_dialog_form_controls(this.dialog_form_group)) {
      if (this.is_chips(dialog_form_control)) {
        dialog_form_control.setValue(this.chips.join(','));
      }
    }
    this.mat_dialog_ref_.close(this.dialog_form_group);
  }
}
