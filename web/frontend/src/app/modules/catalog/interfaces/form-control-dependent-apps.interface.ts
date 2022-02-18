import { FormGroup } from '@angular/forms';

import { CheckboxDependentApp } from './checkbox-dependent-app.interface';

/**
 * Interface defines the Form Control Dependent Apps
 *
 * @export
 * @interface FormControlDependentApps
 */
export interface FormControlDependentApps {
  form_controls_form_group: FormGroup;
  checkbox_dependent_apps: CheckboxDependentApp;
}
