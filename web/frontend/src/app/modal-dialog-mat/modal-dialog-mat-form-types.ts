import { AbstractControlOptions, AsyncValidatorFn, FormControl, ValidatorFn } from '@angular/forms';

export const enum DialogControlTypes {
  text = 1,
  password,
  textarea,
  date,
  dropdown,
  timezone,
  checkbox,
  chips
}

export class DialogFormControlConfigClass {
  label: string;
  formState?: any;
  validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null;
  asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null;
  tooltip: string;
  controlType: DialogControlTypes;
  options: string[];
  isDisabled: boolean;

  constructor() {
    this.tooltip = null;
    this.options = [];
    this.isDisabled = false;
    this.controlType = DialogControlTypes.text;
  }
}

export class DialogFormControl extends FormControl {
  controlType: DialogControlTypes;
  label: string;
  tooltip: string;
  options: Array<string>;
  isDisabled: boolean;

  constructor(dialogFormControlConfigClass: DialogFormControlConfigClass) {
    super(dialogFormControlConfigClass.formState, dialogFormControlConfigClass.validatorOrOpts, dialogFormControlConfigClass.asyncValidator);
    this.controlType = dialogFormControlConfigClass.controlType;
    this.label = dialogFormControlConfigClass.label;
    this.tooltip = dialogFormControlConfigClass.tooltip;
    this.options = dialogFormControlConfigClass.options;
    this.isDisabled = dialogFormControlConfigClass.isDisabled;
    if (this.isDisabled){
      this.disable();
    }
  }
}
