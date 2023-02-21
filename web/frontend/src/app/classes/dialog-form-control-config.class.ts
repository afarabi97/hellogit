import { AbstractControlOptions, AsyncValidatorFn, ValidatorFn } from '@angular/forms';

import { DialogControlTypesEnum } from '../enums/dialog-control-types.enum';

/**
 * Class defines the Dialog Form Control Config
 *
 * @export
 * @class DialogFormControlConfigClass
 */
export class DialogFormControlConfigClass {
  label: string;
  formState?: any;
  validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null;
  asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null;
  tooltip: string;
  controlType: DialogControlTypesEnum;
  options: string[];
  isDisabled: boolean;

  /**
   * Creates an instance of DialogFormControlConfigClass.
   *
   * @memberof DialogFormControlConfigClass
   */
  constructor() {
    this.tooltip = null;
    this.options = [];
    this.isDisabled = false;
    this.controlType = DialogControlTypesEnum.text;
  }
}
