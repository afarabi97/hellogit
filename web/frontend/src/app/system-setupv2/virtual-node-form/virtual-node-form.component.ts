import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, Validators } from '@angular/forms';
import { addNodeValidators, kickStartTooltips } from '../validators/kit-setup-validators';
import { MatRadioChange } from '@angular/material/radio';
import { validateFromArray } from 'src/app/validators/generic-validators.validator';


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
export class VirtualNodeFormComponent implements OnInit {
  // Unique ID passed from parent component to create unique element ids
  @Input() nodeForm: FormGroup;
  @Input() isVisible: boolean;


  ngOnInit() {

  }

  getTooltip(inputName: string): string {
    return kickStartTooltips[inputName];
  }

  public getErrorMessage(control: AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  public setDefaultValues(nodeType: string){
    if (nodeType === "Server"){
      this.nodeForm.get('virtual_cpu').setValue(16);
      this.nodeForm.get('virtual_mem').setValue(32);
      this.nodeForm.get('virtual_os').setValue(100);
      this.nodeForm.get('virtual_data').setValue(500);
    } else if (nodeType === "Sensor"){
      this.nodeForm.get('virtual_cpu').setValue(16);
      this.nodeForm.get('virtual_mem').setValue(16);
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
    }
  }

  public setVirtualFormValidation(event: MatRadioChange){
    const virtual_cpu = this.nodeForm.get('virtual_cpu');
    const virtual_mem = this.nodeForm.get('virtual_mem');
    const virtual_os = this.nodeForm.get('virtual_os');
    const virtual_data = this.nodeForm.get('virtual_data');

    if (event.value === "Virtual"){
      virtual_cpu.setValidators(Validators.compose([validateFromArray(addNodeValidators.virtual_cpu)]));
      virtual_mem.setValidators(Validators.compose([validateFromArray(addNodeValidators.virtual_mem)]));
      virtual_os.setValidators(Validators.compose([validateFromArray(addNodeValidators.os_drive)]));
      if (virtual_data) {
        virtual_data.setValidators(Validators.compose([validateFromArray(addNodeValidators.data_drive)]));
      }
    } else {
      virtual_cpu.setValidators(null);
      virtual_mem.setValidators(null);
      virtual_os.setValidators(null);
      if (virtual_data) {
        virtual_data.setValidators(null);
      }
    }

    virtual_cpu.updateValueAndValidity();
    virtual_mem.updateValueAndValidity();
    virtual_os.updateValueAndValidity();
    if (virtual_data) {
      virtual_data.updateValueAndValidity();
    }
  }

  hasDataDrive(): boolean {
    return this.nodeForm.get('virtual_data') !== null;
  }
}
