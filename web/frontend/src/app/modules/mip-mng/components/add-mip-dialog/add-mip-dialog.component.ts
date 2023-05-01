import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import {
  ErrorMessageClass,
  GeneralSettingsClass,
  GenericJobAndKeyClass,
  NodeClass,
  ObjectUtilitiesClass,
  PostValidationClass,
  ValidationErrorClass
} from '../../../../classes';
import {
  BAREMETAL,
  COMMON_VALIDATORS,
  DEPLOYMENT_OPTIONS,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR_DISMISS,
  MIP,
  VIRTUAL
} from '../../../../constants/cvah.constants';
import { COMMON_TOOLTIPS } from '../../../../constants/tooltip.constant';
import { MatOptionInterface } from '../../../../interfaces';
import { KitSettingsService } from '../../../../services/kit-settings.service';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { addNodeValidators } from '../../../../validators/add-node.validator';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import {
  VirtualNodeFormComponent
} from '../../../global-components/components/virtual-node-form/virtual-node-form.component';

/**
 * Component used for mip node dialog
 *
 * @export
 * @class AddMipDialogComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-add-mip-dialog',
  templateUrl: 'add-mip-dialog.component.html',
  styleUrls: ['add-mip-dialog.component.scss'],
})
export class AddMipDialogComponent implements OnInit {
  // Used for retaining reference to virtual node form component
  @ViewChild('virtualNodeForm') private virtual_node_form_: VirtualNodeFormComponent;
  // Used for passing node form group to html
  node_form_group: FormGroup;
  // Used for holding on to available ips
  available_ips: string[];
  // Used for passing deployment options as mat options
  deployment_options: MatOptionInterface[];
  // Used for creating a duplicate of created node instance before
  private create_duplicate_: boolean;
  // Used for storing general settings used in retrieving unused ips
  private settings_: Partial<GeneralSettingsClass>;
  // Used for keep list of hostnames to not use
  private validation_hostnames_: string[];
  // Used for keeping a list of ips not to use
  private validation_ips_: string[];
  // Used for keeping a list of macs not to use
  private validation_macs_: string[];

  /**
   * Creates an instance of AddMipDialogComponent.
   *
   * @param {FormBuilder} form_builder_
   * @param {MatDialogRef<AddMipDialogComponent>} mat_dialog_ref_
   * @param {KitSettingsService} kit_settings_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof AddMipDialogComponent
   */
  constructor(private form_builder_: FormBuilder,
              private mat_dialog_ref_: MatDialogRef<AddMipDialogComponent>,
              private kit_settings_service_: KitSettingsService,
              private mat_snackbar_service_: MatSnackBarService) {
    this.available_ips = [];
    this.deployment_options = DEPLOYMENT_OPTIONS;
    this.settings_ = {};
    this.validation_hostnames_ = [];
    this.validation_ips_ = [];
    this.validation_macs_ = [];
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof AddMipDialogComponent
   */
  ngOnInit(): void {
    this.api_get_general_settings_();
    this.api_get_nodes_(true);
  }

  /**
   * Used for checking if deployment is virtual
   *
   * @return {boolean}
   * @memberof AddMipDialogComponent
   */
  is_virtual_machine_deployment(): boolean {
    return ObjectUtilitiesClass.notUndefNull(this.node_form_group) &&
           this.node_form_group.get('deployment_type') &&
           this.node_form_group.get('deployment_type').value === VIRTUAL;
  }

  /**
   * Used for checking if deployment is baremetal
   *
   * @return {boolean}
   * @memberof AddMipDialogComponent
   */
  is_baremetal_deployment(): boolean {
    return ObjectUtilitiesClass.notUndefNull(this.node_form_group) &&
           this.node_form_group.get('deployment_type') &&
           this.node_form_group.get('deployment_type').value === BAREMETAL;
  }

  /**
   * Used for making internal calls when deployment type changes
   *
   * @param {MatRadioChange} event
   * @memberof AddMipDialogComponent
   */
  change_deployment_type(event: MatRadioChange): void {
    this.api_get_nodes_();
    const mac_address: AbstractControl = this.node_form_group.get('mac_address');
    if (event.value === BAREMETAL) {
      mac_address.setValidators(Validators.compose([validateFromArray(addNodeValidators.mac_address,
                                                                      { uniqueArray: this.validation_macs_ })]));
    } else {
      mac_address.clearValidators();
    }
    mac_address.markAsPristine();
    mac_address.markAsUntouched();
    mac_address.updateValueAndValidity();

    /* istanbul ignore else */
    if (this.is_virtual_machine_deployment()) {
      this.virtual_node_form_.set_default_values(MIP);
      this.virtual_node_form_.set_virtual_form_validation(event);
    }
  }

  /**
   * Used for retrieving the error message for a form control
   *
   * @param {AbstractControl} control
   * @return {string}
   * @memberof AddMipDialogComponent
   */
  get_error_message(control: AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  /**
   * Used retrieving a tooltip for a form control
   *
   * @param {string} input_name
   * @return {string}
   * @memberof AddMipDialogComponent
   */
  get_tooltip(input_name: string): string {
    return COMMON_TOOLTIPS[input_name];
  }

  /**
   * Used for closing the mat dialog
   *
   * @memberof AddMipDialogComponent
   */
  cancel(): void {
    this.mat_dialog_ref_.close();
  }

  /**
   * Used for adding a mip or closing and passing node form group
   *
   * @memberof AddMipDialogComponent
   */
  add(): void {
    if (this.create_duplicate_) {
      this.api_add_mip_(this.node_form_group.get('hostname').value);
    } else {
      this.mat_dialog_ref_.close(this.node_form_group);
    }
  }

  /**
   * Used for change the variable for create_duplicate_
   *
   * @param {MatCheckboxChange} event
   * @memberof AddMipDialogComponent
   */
  duplicate_node_change(event: MatCheckboxChange): void {
    this.create_duplicate_ = event.checked;
  }

  /**
   * Used for initializing node form group
   *
   * @private
   * @param {FormGroup} [previous_node_form_group]
   * @memberof AddMipDialogComponent
   */
  private initialize_node_form_group_(previous_node_form_group?: FormGroup): void {
    const node_form_group: FormGroup = this.form_builder_.group({
      hostname: new FormControl(undefined, Validators.compose([validateFromArray(addNodeValidators.hostname,
                                                                                 { uniqueArray: this.validation_hostnames_ })])),
      ip_address: new FormControl(undefined, Validators.compose([validateFromArray(addNodeValidators.ip_address,
                                                                                   { uniqueArray: this.validation_ips_ })])),
      deployment_type: new FormControl(ObjectUtilitiesClass.notUndefNull(previous_node_form_group) ? previous_node_form_group.get('deployment_type').value : undefined,
                                       Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      // Baremetal form fields
      mac_address: new FormControl(ObjectUtilitiesClass.notUndefNull(previous_node_form_group) ? previous_node_form_group.get('mac_address').value : undefined,
                                   Validators.compose([validateFromArray(addNodeValidators.mac_address,
                                                                         { uniqueArray: this.validation_macs_ })])),
      // Virtual form fields
      virtual_cpu: new FormControl(ObjectUtilitiesClass.notUndefNull(previous_node_form_group) ? previous_node_form_group.get('virtual_cpu').value : undefined),
      virtual_mem: new FormControl(ObjectUtilitiesClass.notUndefNull(previous_node_form_group) ? previous_node_form_group.get('virtual_mem').value : undefined),
      virtual_os: new FormControl(ObjectUtilitiesClass.notUndefNull(previous_node_form_group) ? previous_node_form_group.get('virtual_os').value : undefined)
    });
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(previous_node_form_group) &&
        ObjectUtilitiesClass.notUndefNull(previous_node_form_group.get('deployment_type').value === VIRTUAL)) {
      node_form_group.get('mac_address').setValidators(null);
    }
    this.set_node_form_group_(node_form_group);
  }

  /**
   * Used for setting node form group
   *
   * @private
   * @param {FormGroup} node_form_group
   * @memberof AddMipDialogComponent
   */
  private set_node_form_group_(node_form_group: FormGroup): void {
    this.node_form_group = node_form_group;
  }

  /**
   * Used for constructing message displayed in a snackbar for post validation object
   *
   * @private
   * @param {object} post_validation
   * @param {string[]} post_validation_keys
   * @return {string}
   * @memberof AddMipDialogComponent
   */
  private construct_post_validation_error_message_(post_validation: object, post_validation_keys: string[]): string {
    let message: string = '';
    post_validation_keys.forEach((key: string, index: number) => {
      const errors: string[] = post_validation[key];
      errors.forEach((error: string, index_error: number) => {
        message += `${key}:     ${error}`;
        /* istanbul ignore else */
        if (index_error !== (errors.length - 1)) {
          message += `\n`;
        }
      });
      /* istanbul ignore else */
      if (index !== (post_validation_keys.length - 1)) {
        message += `\n\n`;
      }
    });

    return message;
  }

  /**
   * Used for making api rest call to get general settings
   *
   * @private
   * @memberof AddMipDialogComponent
   */
  private api_get_general_settings_(): void {
    this.kit_settings_service_.getGeneralSettings()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GeneralSettingsClass) => {
          this.settings_ = response;
          this.api_get_unused_ip_addresses_();
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving general settings';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get unused ip addresses
   *
   * @private
   * @memberof AddMipDialogComponent
   */
  private api_get_unused_ip_addresses_(): void {
    this.kit_settings_service_.getUnusedIPAddresses(this.settings_.controller_interface, this.settings_.netmask)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string[]) => {
          this.available_ips = response;
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving unused ip addresses';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get nodes
   *
   * @private
   * @param {boolean} [call_initialize_node_form_group=false]
   * @memberof AddMipDialogComponent
   */
  private api_get_nodes_(call_initialize_node_form_group: boolean = false): void {
    this.kit_settings_service_.getNodes()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: NodeClass[]) => {
          this.validation_hostnames_ = [];
          this.validation_ips_ = [];
          this.validation_macs_ = [];
          for (const node of response) {
            this.validation_hostnames_.push(node.hostname.split('.')[0]);
            this.validation_ips_.push(node.ip_address);
            this.validation_macs_.push(node.mac_address);
          }
          /* istanbul ignore else */
          if (call_initialize_node_form_group) {
            this.initialize_node_form_group_();
          }
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving nodes';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to add mip
   *
   * @private
   * @param {string} hostname
   * @memberof AddMipDialogComponent
   */
  private api_add_mip_(hostname: string): void {
    this.kit_settings_service_.addMip(this.node_form_group.value)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          this.available_ips = this.available_ips.filter((ip: string) => ip !== this.node_form_group.get('ip_address').value);
          this.validation_ips_.push(this.node_form_group.get('ip_address').value);
          this.validation_hostnames_.push(this.node_form_group.get('hostname').value);
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(this.node_form_group.get('mac_address').value)) {
            this.validation_macs_.push(this.node_form_group.get('mac_address').value);
          }
          this.initialize_node_form_group_(this.node_form_group);
          const message: string = `started node creation job for ${hostname}.`;
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR_DISMISS);
        },
        (error: ErrorMessageClass | ValidationErrorClass | PostValidationClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else if (error instanceof ValidationErrorClass) {
            const field_keys: string[] = Object.keys(error.messages);
            let error_message: string = '';

            field_keys.forEach((key: string, key_index: number) => {
              error.messages[key].forEach((message: string, error_message_index: number) => {
                error_message += `${key}: ${message}`;

                if (((error.messages[key].length - 1) < error_message_index) && ((field_keys.length - 1) < key_index)) {
                  error_message += '\n';
                }
              });
              this.mat_snackbar_service_.displaySnackBar(error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            });
          } else if (error instanceof PostValidationClass) {
            if (error.post_validation instanceof Array) {
              let error_message: string;
              const post_validation_length: number = error.post_validation.length - 1;
              error.post_validation.forEach((message: string, index: number) => {
                error_message += message;
                /* istanbul ignore else */
                if (index < post_validation_length) {
                  error_message += '\n';
                }
              });
              this.mat_snackbar_service_.displaySnackBar(error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            } else if (typeof error.post_validation === 'object') {
              const post_validation: object = error.post_validation;
              const post_validation_keys: string[] = Object.keys(post_validation);
              const message: string = this.construct_post_validation_error_message_(post_validation, post_validation_keys);
              this.mat_snackbar_service_.displaySnackBar(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            } else {
              const message: string = 'Post validation message was not returned in correct format';
              this.mat_snackbar_service_.displaySnackBar(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            }
          } else {
            const message: string = 'adding mip';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }
}
