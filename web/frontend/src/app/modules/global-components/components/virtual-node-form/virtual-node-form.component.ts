import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';

import { ObjectUtilitiesClass } from '../../../../classes';
import { CONTROL_PLANE, MINIO, MIP, SENSOR, SERVER, SERVICE, VIRTUAL } from '../../../../constants/cvah.constants';
import { COMMON_TOOLTIPS } from '../../../../constants/tooltip.constant';
import { addNodeValidators } from '../../../../validators/add-node.validator';
import { validateFromArray } from '../../../../validators/generic-validators.validator';

/**
 * Used for displaying virtual values within a node form group
 *
 * @export
 * @class VirtualNodeFormComponent
 */
@Component({
  selector: 'cvah-virtual-node-form',
  templateUrl: './virtual-node-form.component.html',
  styleUrls: ['./virtual-node-form.component.scss']
})
export class VirtualNodeFormComponent {
  // Parent passed values
  @Input() node_form_group: FormGroup;
  @Input() is_visible: boolean;

  /**
   * Used for displaying a tooltip for a form control
   *
   * @param {string} input_name
   * @return {string}
   * @memberof VirtualNodeFormComponent
   */
  get_tooltip(input_name: string): string {
    return COMMON_TOOLTIPS[input_name];
  }

  /**
   * Used for returning an error message for a form control
   *
   * @param {AbstractControl} control
   * @return {string}
   * @memberof VirtualNodeFormComponent
   */
  get_error_message(control: AbstractControl): string {
    return ObjectUtilitiesClass.notUndefNull(control) &&
           ObjectUtilitiesClass.notUndefNull(control.errors) ? control.errors.error_message : '';
  }

  /**
   * Used for setting defulat values for form control values
   *
   * @param {string} node_type
   * @memberof VirtualNodeFormComponent
   */
  set_default_values(node_type: string): void {
    /* istanbul ignore else */
    if ((node_type === SERVER) || (node_type === SENSOR)) {
      this.set_virtual_group_values_(16, 32, 100, 500);
    } else if (node_type === SERVICE) {
      this.set_virtual_group_values_(16, 24, 100, 500);
    } else if (node_type === MIP) {
      this.set_virtual_group_values_(8, 8, 500, null);
    } else if (node_type === MINIO) {
      this.set_virtual_group_values_(8, 8, 100, 10000);
    } else if (node_type === CONTROL_PLANE) {
      this.set_virtual_group_values_(8, 8, 50, null);
    }
  }

  /**
   * Used for setting defulat validators for form control values
   *
   * @param {MatRadioChange} event
   * @memberof VirtualNodeFormComponent
   */
  set_virtual_form_validation(event: MatRadioChange): void {
    const virtual_cpu: AbstractControl = this.node_form_group.get('virtual_cpu');
    const virtual_mem: AbstractControl = this.node_form_group.get('virtual_mem');
    const virtual_os: AbstractControl = this.node_form_group.get('virtual_os');
    const virtual_data: AbstractControl = this.node_form_group.get('virtual_data');

    if (event.value === VIRTUAL) {
      virtual_cpu.setValidators(Validators.compose([validateFromArray(addNodeValidators.virtual_cpu)]));
      virtual_mem.setValidators(Validators.compose([validateFromArray(addNodeValidators.virtual_mem)]));
      virtual_os.setValidators(Validators.compose([validateFromArray(addNodeValidators.virtual_os_drive)]));
      /* istanbul ignore else */
      if (ObjectUtilitiesClass.notUndefNull(virtual_data)) {
        virtual_data.setValidators(Validators.compose([validateFromArray(addNodeValidators.virtual_data_drive)]));
      }
    } else {
      virtual_cpu.clearValidators();
      virtual_mem.clearValidators();
      virtual_os.clearValidators();
      /* istanbul ignore else */
      if (ObjectUtilitiesClass.notUndefNull(virtual_data)) {
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
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(virtual_data)) {
      virtual_data.markAsPristine();
      virtual_data.markAsUntouched();
      virtual_data.updateValueAndValidity();
    }
  }

  /**
   * Used for checking if form group contains form control 'virtual_data'
   *
   * @return {boolean}
   * @memberof VirtualNodeFormComponent
   */
  has_data_drive(): boolean {
    return ObjectUtilitiesClass.notUndefNull(this.node_form_group.get('virtual_data'));
  }

  /**
   * Used for setting the virtual form control values for node_form_group
   *
   * @private
   * @param {number} cpu_cores
   * @param {number} memory_size
   * @param {number} os_drive_size
   * @param {(number | null)} data_drive_size
   * @memberof VirtualNodeFormComponent
   */
  private set_virtual_group_values_(cpu_cores: number, memory_size: number, os_drive_size: number, data_drive_size: number | null): void {
    this.node_form_group.get('virtual_cpu').setValue(cpu_cores);
    this.node_form_group.get('virtual_mem').setValue(memory_size);
    this.node_form_group.get('virtual_os').setValue(os_drive_size);
    if (ObjectUtilitiesClass.notUndefNull(data_drive_size)) {
      this.node_form_group.setControl('virtual_data', new FormControl(data_drive_size));
    } else {
      this.node_form_group.setControl('virtual_data', null);
    }
  }
}
