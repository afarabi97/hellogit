import { Component, Input } from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';

import { validateFromArray } from '../../validators/generic-validators.validator';
import { addNodeValidators, kickStartTooltips } from '../validators/kit-setup-validators';

@Component({
  selector: 'virtual-node-form',
  templateUrl: './virtual-node-form.component.html',
  styles: [`
    mat-form-field{
        width:100%
    }
    .mat-form-field {
      margin-bottom: 15px;
    }
  `]
})
export class VirtualNodeFormComponent {
  // Unique ID passed from parent component to create unique element ids
  @Input() nodeForm: FormGroup;
  @Input() isVisible: boolean;

  getTooltip(inputName: string): string {
    return kickStartTooltips[inputName];
  }

  public getErrorMessage(control: AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  public setDefaultValues(nodeType: string){
    if ((nodeType === "Server") || (nodeType === "Sensor")){
      this.nodeForm.get('virtual_cpu').setValue(16);
      this.nodeForm.get('virtual_mem').setValue(32);
      this.nodeForm.get('virtual_os').setValue(100);
      this.nodeForm.get('virtual_data').setValue(500);
    } else if (nodeType === "Service"){
      this.nodeForm.get('virtual_cpu').setValue(16);
      this.nodeForm.get('virtual_mem').setValue(24);
      this.nodeForm.get('virtual_os').setValue(100);
      this.nodeForm.get('virtual_data').setValue(500);
    } else if (nodeType === "MIP") {
      this.nodeForm.get('virtual_cpu').setValue(8);
      this.nodeForm.get('virtual_mem').setValue(8);
      this.nodeForm.get('virtual_os').setValue(500);
    } else if (nodeType == "MinIO") {
      this.nodeForm.get('virtual_cpu').setValue(8);
      this.nodeForm.get('virtual_mem').setValue(8);
      this.nodeForm.get('virtual_os').setValue(100);
      this.nodeForm.get('virtual_data').setValue(10000);
    }
  }

  public setVirtualFormValidation(event: MatRadioChange){
    const virtual_cpu = this.nodeForm.get('virtual_cpu');
    const virtual_mem = this.nodeForm.get('virtual_mem');
    const virtual_os = this.nodeForm.get('virtual_os');
    const virtual_data = this.nodeForm.get('virtual_data');

    if (event.value === "Virtual") {
      virtual_cpu.setValidators(Validators.compose([validateFromArray(addNodeValidators.virtual_cpu)]));
      virtual_mem.setValidators(Validators.compose([validateFromArray(addNodeValidators.virtual_mem)]));
      virtual_os.setValidators(Validators.compose([validateFromArray(addNodeValidators.os_drive)]));
      if (virtual_data) {
        virtual_data.setValidators(Validators.compose([validateFromArray(addNodeValidators.data_drive)]));
      }
    } else {
      virtual_cpu.clearValidators();
      virtual_mem.clearValidators();
      virtual_os.clearValidators();
      if (virtual_data) {
        virtual_data.clearValidators();
      }
    }

    virtual_cpu.markAsPristine();
    virtual_cpu.markAsUntouched();
    virtual_cpu.updateValueAndValidity();
    virtual_mem.markAsPristine();
    virtual_mem.markAsUntouched();
    virtual_mem.updateValueAndValidity();
    virtual_os.markAsPristine();
    virtual_os.markAsUntouched();
    virtual_os.updateValueAndValidity();
    if (virtual_data) {
      virtual_data.markAsPristine();
      virtual_data.markAsUntouched();
      virtual_data.updateValueAndValidity();
    }
  }

  hasDataDrive(): boolean {
    return this.nodeForm.get('virtual_data') !== null;
  }
}
