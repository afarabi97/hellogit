import { FormControl } from '@angular/forms';

import { DialogControlTypesEnum } from '../enums/dialog-control-types.enum';
import { DialogFormControlConfigClass } from './dialog-form-control-config.class';


/**
 * Class defines the Dialog Form Control
 *
 * @export
 * @class DialogFormControlClass
 * @extends {FormControl}
 * @implements {DialogFormControlConfigClass}
 */
export class DialogFormControlClass extends FormControl implements DialogFormControlConfigClass {
  controlType: DialogControlTypesEnum;
  label: string;
  tooltip: string;
  options: Array<string>;
  isDisabled: boolean;

  /**
   * Creates an instance of DialogFormControlClass.
   *
   * @param {DialogFormControlConfigClass} dialog_form_control_config_class
   * @memberof DialogFormControlClass
   */
  constructor(dialog_form_control_config_class: DialogFormControlConfigClass) {
    super(dialog_form_control_config_class.formState,
          dialog_form_control_config_class.validatorOrOpts,
          dialog_form_control_config_class.asyncValidator);

    this.controlType = dialog_form_control_config_class.controlType;
    this.label = dialog_form_control_config_class.label;
    this.tooltip = dialog_form_control_config_class.tooltip;
    this.options = dialog_form_control_config_class.options;
    this.isDisabled = dialog_form_control_config_class.isDisabled;
    /* istanbul ignore else */
    if (this.isDisabled) {
      this.disable();
    }
  }
}
