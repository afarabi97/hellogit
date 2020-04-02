import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { AllValidationErrors, getFormValidationErrors, FormGroupControls } from '../validators/generic-validators.validator';

@Component({
  selector: 'app-mip-config-validation',
  templateUrl: './mip-config-validation.component.html',
  styleUrls: ['./mip-config-validation.component.scss'],
  host: {
    'class': 'app-mip-config-validation'
  }
})
export class MIPConfigValidationComponent {
    @Input() form: FormGroup;

    public getFormValidationErrors(controls: FormGroupControls): AllValidationErrors[] {
        return getFormValidationErrors(controls);
    }
}
