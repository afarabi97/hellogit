import { FormControl, ValidatorFn, AbstractControlOptions, AsyncValidatorFn } from "@angular/forms";

export const enum DialogControlTypes {
  text = 1,
  password,
  textarea,
  date,
  dropdown
}

export class DialogFormControl extends FormControl {
  controlType: DialogControlTypes;
  label: string;
  tooltip: string;

  constructor(label: string,
              formState?: any, validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
              asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
              tooltip: string = null,
              controlType: DialogControlTypes = DialogControlTypes.text)
  {
    super(formState, validatorOrOpts, asyncValidator);
    this.controlType = controlType;
    this.label = label;
    this.tooltip = tooltip;
  }
}
