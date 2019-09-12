import { FormControl, ValidatorFn, AbstractControlOptions, AsyncValidatorFn } from "@angular/forms";

export const enum DialogControlTypes {
  text = 1,
  password,
  textarea,
  date,
  dropdown,
  timezone
}

export class DialogFormControl extends FormControl {
  controlType: DialogControlTypes;
  label: string;
  tooltip: string;
  options: Array<string>;
  isDisabled: boolean;

  constructor(label: string,
              formState?: any,
              validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
              asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null,
              tooltip: string = null,
              controlType: DialogControlTypes = DialogControlTypes.text,
              options: Array<string>=new Array<string>(),
              isDisabled: boolean=false)
  {
    super(formState, validatorOrOpts, asyncValidator);
    this.controlType = controlType;
    this.label = label;
    this.tooltip = tooltip;
    this.options = options;
    this.isDisabled = isDisabled;
    if (this.isDisabled){
      this.disable();
    }
  }
}
