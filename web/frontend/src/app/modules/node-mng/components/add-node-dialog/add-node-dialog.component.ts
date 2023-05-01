import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import {
  ErrorMessageClass,
  GeneralSettingsClass,
  GenericJobAndKeyClass,
  KitSettingsClass,
  KitStatusClass,
  NodeClass,
  ObjectUtilitiesClass,
  PostValidationClass
} from '../../../../classes';
import {
  BAREMETAL,
  COMMON_VALIDATORS,
  CONTROL_PLANE,
  DEPLOYMENT_OPTIONS_NODE,
  ISO,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR_DISMISS,
  MINIO,
  SENSOR,
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
import { AddNodeMatDialogDataInterface } from '../../interfaces/add-node-mat-dialog-data.interface';

/**
 * Component used for displaying form fields to add a node
 *
 * @export
 * @class AddNodeDialogComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-add-node-dialog',
  templateUrl: 'add-node-dialog.component.html',
  styleUrls: ['add-node-dialog.component.scss']
})
export class AddNodeDialogComponent implements OnInit {
  // Used for retaining reference to virtual node form component
  @ViewChild('virtualNodeForm') private virtual_node_form_: VirtualNodeFormComponent;
  // Used for passing node form group to html
  node_form_group: FormGroup;
  // Used for detecting if node exists and only one allowed at a single time
  control_plane_node_detected: boolean;
  minio_node_detected: boolean;
  // Will need LTAC added
  // ltac_node_detected: boolean;
  // Used for holding on to available ips
  available_ips: string[];
  // Used for holding the node type for further analysis
  node_type: string;
  // Used for passing deployment options as mat options
  deployment_options: MatOptionInterface[];
  // Used for creating a duplicate of created node instance before
  private create_duplicate_: boolean;
  // Used for storing general settings used in retrieving unused ips
  private settings_: Partial<GeneralSettingsClass>;
  // Used for holding to kit status
  private kit_status_: Partial<KitStatusClass>;
  // Used for holding on to kit settings
  private kit_settings_: KitSettingsClass;
  // Used for recieving and holding nodes from parent component
  private nodes_: NodeClass[];
  // Used for keep list of hostnames to not use
  private validation_hostnames_: string[];
  // Used for keeping a list of ips not to use
  private validation_ips_: string[];
  // Used for keeping a list of k8 ips not to use
  private validation_k8_ips_: string[];
  // Used for keeping a list of macs not to use
  private validation_macs_: string[];

  /**
   * Creates an instance of AddNodeDialogComponent.
   *
   * @param {MatDialogRef<AddNodeDialogComponent>} mat_dialog_ref_
   * @param {FormBuilder} form_builder_
   * @param {KitSettingsService} kit_settings_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof AddNodeDialogComponent
   */
  constructor(private mat_dialog_ref_: MatDialogRef<AddNodeDialogComponent>,
              private form_builder_: FormBuilder,
              @Inject(MAT_DIALOG_DATA) mat_dialog_data: AddNodeMatDialogDataInterface,
              private kit_settings_service_: KitSettingsService,
              private mat_snackbar_service_: MatSnackBarService) {
    this.kit_settings_ = mat_dialog_data.kit_settings;
    this.nodes_ = mat_dialog_data.nodes;
    this.minio_node_detected = false;
    // Will need LTAC added
    // this.ltac_node_detected = false;
    this.control_plane_node_detected = false;
    this.deployment_options = [];
    this.create_duplicate_ = false;
    this.settings_ = {};
    this.kit_status_ = {};
    this.validation_hostnames_ = [];
    this.validation_ips_ = [];
    this.validation_k8_ips_ = [];
    this.validation_macs_ = [];
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof AddNodeDialogComponent
   */
  ngOnInit(): void {
    this.update_node_type_radio_options_();
    this.save_k8_ips_();
    this.api_get_kit_status_();
  }

  /**
   * Used for triggering actions on node type change event
   *
   * @param {MatRadioChange} event
   * @memberof AddNodeDialogComponent
   */
  change_node_type(event: MatRadioChange): void {
    this.node_type = event.value;
    this.node_form_group.get('node_type').markAsTouched();
    this.deployment_options = [];
    this.deployment_options.push(DEPLOYMENT_OPTIONS_NODE[0]);
    if (this.kit_status_.esxi_settings_configured) {
      this.deployment_options.push(DEPLOYMENT_OPTIONS_NODE[1]);
    } else {
      this.deployment_options.push(DEPLOYMENT_OPTIONS_NODE[2]);
    }
    /* istanbul ignore else */
    if (event.value === SENSOR) {
      this.deployment_options.push(DEPLOYMENT_OPTIONS_NODE[3]);
    }
    // Will need LTAC added
    /* istanbul ignore else */
    if (event.value === CONTROL_PLANE || event.value === MINIO) {
      this.create_duplicate_ = false;
    }
    /* istanbul ignore else */
    if (this.is_virtual_machine_deployment()) {
      this.virtual_node_form_.set_default_values(this.node_type);
      this.virtual_node_form_.set_virtual_form_validation(event);
    }
  }

  /**
   * Used for triggering actions on deployment type change event
   *
   * @param {MatRadioChange} event
   * @memberof AddNodeDialogComponent
   */
  change_deployment_type(event: MatRadioChange): void {
    this.api_get_unused_ip_addresses_();
    this.set_baremetal_validation_(event);
    /* istanbul ignore else */
    if (event.value === VIRTUAL) {
      this.virtual_node_form_.set_default_values(this.node_type);
      this.virtual_node_form_.set_virtual_form_validation(event);
    }
  }

  /**
   * Used for checking to see if deployment type is baremetal
   *
   * @return {boolean}
   * @memberof AddNodeDialogComponent
   */
  is_baremetal_deployment(): boolean {
    return ObjectUtilitiesClass.notUndefNull(this.node_form_group) &&
           this.node_form_group.get('deployment_type') &&
           this.node_form_group.get('deployment_type').value === BAREMETAL;
  }

  /**
   * Used for checking to see if deployment type is virtual machine
   *
   * @return {boolean}
   * @memberof AddNodeDialogComponent
   */
  is_virtual_machine_deployment(): boolean {
    return ObjectUtilitiesClass.notUndefNull(this.node_form_group) &&
           this.node_form_group.get('deployment_type') &&
           this.node_form_group.get('deployment_type').value === VIRTUAL;
  }

  /**
   * Used for checking to see if deployment type is iso sensor
   *
   * @return {boolean}
   * @memberof AddNodeDialogComponent
   */
  is_iso_sensor_deployment(): boolean {
    return ObjectUtilitiesClass.notUndefNull(this.node_form_group) &&
           this.node_form_group.get('deployment_type') &&
           this.node_form_group.get('deployment_type').value === ISO;
  }

  /**
   * Used for retrieving the error message for a form control
   *
   * @param {AbstractControl} control
   * @return {string}
   * @memberof AddNodeDialogComponent
   */
  get_error_message(control: AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  /**
   * Used retrieving a tooltip for a form control
   *
   * @param {string} inputName
   * @return {string}
   * @memberof AddNodeDialogComponent
   */
  get_tooltip(inputName: string): string {
    return COMMON_TOOLTIPS[inputName];
  }

  /**
   * Used for closing the mat dialog
   *
   * @memberof AddNodeDialogComponent
   */
  cancel(): void {
    this.mat_dialog_ref_.close();
  }

  /**
   * Used for passing private call to html
   *
   * @memberof AddNodeDialogComponent
   */
  add(): void {
    this.api_add_node_();
  }

  /**
   * Used for checking to make sure node type is not CONTROL_PLANE, MINIO, and LTAC
   * Will need LTAC added
   *
   * @return {boolean}
   * @memberof AddNodeDialogComponent
   */
  check_not_node_type(): boolean {
    return this.node_type !== CONTROL_PLANE && this.node_type !== MINIO;
  }

  /**
   * Used for setting create_duplicate_ = event value
   *
   * @param {MatCheckboxChange} event
   * @memberof AddNodeDialogComponent
   */
  change_duplicate_node(event: MatCheckboxChange): void {
    this.create_duplicate_ = event.checked;
  }

  /**
   * Used for initializing the node form group
   *
   * @private
   * @param {FormGroup} [previous_node_form_group]
   * @memberof AddNodeDialogComponent
   */
  private initialize_node_form_group_(previous_node_form_group?: FormGroup): void {
    const node_form_group: FormGroup = this.form_builder_.group({
      hostname: new FormControl(ObjectUtilitiesClass.notUndefNull(previous_node_form_group) ? previous_node_form_group.get('hostname').value : undefined,
                                Validators.compose([validateFromArray(addNodeValidators.hostname,
                                                                      { uniqueArray: this.validation_hostnames_ })])),
      ip_address: new FormControl(undefined, Validators.compose([validateFromArray(addNodeValidators.ip_address,
                                                                                   { uniqueArray: this.validation_ips_ })])),
      node_type: new FormControl(ObjectUtilitiesClass.notUndefNull(previous_node_form_group) ? previous_node_form_group.get('node_type').value : undefined,
                                 Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      deployment_type: new FormControl(ObjectUtilitiesClass.notUndefNull(previous_node_form_group) ? previous_node_form_group.get('deployment_type').value : undefined,
                                       Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      // Baremetal form fields
      mac_address: new FormControl(undefined),
      raid0_override: new FormControl(false),
      // Virtual form fields
      virtual_cpu: new FormControl(ObjectUtilitiesClass.notUndefNull(previous_node_form_group) ? previous_node_form_group.get('virtual_cpu').value : undefined),
      virtual_mem: new FormControl(ObjectUtilitiesClass.notUndefNull(previous_node_form_group) ? previous_node_form_group.get('virtual_mem').value : undefined),
      virtual_os: new FormControl(ObjectUtilitiesClass.notUndefNull(previous_node_form_group) ? previous_node_form_group.get('virtual_os').value : undefined),
      virtual_data: new FormControl(ObjectUtilitiesClass.notUndefNull(previous_node_form_group) ? previous_node_form_group.get('virtual_data').value : undefined)
    });
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(previous_node_form_group)) {
      node_form_group.get('node_type').markAsTouched();
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
   * Used for updating node type radio options
   *
   * @private
   * @memberof AddNodeDialogComponent
   */
  private update_node_type_radio_options_(): void {
    // set control plane, minio and ltac detected so user can not create more than 1
    this.nodes_.forEach((node: NodeClass) => {
      /* istanbul ignore else */
      if (node.node_type === CONTROL_PLANE) {
        this.control_plane_node_detected = true;
      }
      /* istanbul ignore else */
      if (node.node_type === MINIO) {
        this.minio_node_detected = true;
      }
      // Will need LTAC added
      /* istanbul ignore else */
      // if (node.node_type === LTAC) {
      //   this.ltac_node_detected = true;
      // }
    });
  }

  /**
   * Used for setting baremetal validation
   *
   * @private
   * @param {MatRadioChange} event
   * @memberof AddNodeDialogComponent
   */
  private set_baremetal_validation_(event: MatRadioChange): void {
    const mac_address: AbstractControl = this.node_form_group.get('mac_address');

    if (event.value === BAREMETAL) {
      mac_address.setValidators(Validators.compose([validateFromArray(addNodeValidators.mac_address,
                                                                      { uniqueArray: this.validation_macs_ })]));
    } else {
      mac_address.clearValidators();
    }
    this.reset_form_control_(mac_address);
  }

  private reset_form_control_(form_control: AbstractControl): void {
    form_control.markAsPristine();
    form_control.markAsUntouched();
    form_control.updateValueAndValidity();
  }

  /**
   * Used for constructing message displayed in a snackbar for post validation object
   *
   * @private
   * @param {object} post_validation
   * @param {string[]} post_validation_keys
   * @return {string}
   * @memberof AddNodeDialogComponent
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
   * Used for excluding k8s ips from valid ips
   *
   * @private
   * @memberof AddNodeDialogComponent
   */
  private save_k8_ips_(): void {
    this.validation_k8_ips_ = [];
    const k8s_ip: string[] = this.kit_settings_.kubernetes_services_cidr.split('.');
    const start_ip: number = parseInt(k8s_ip[3], 10);
    for (let i = start_ip; i < start_ip + 32; i++) {
      this.validation_k8_ips_.push(k8s_ip[0] + '.' + k8s_ip[1] + '.' + k8s_ip[2] + '.' + i.toString());
    }
  }

  /**
   * Used for setting validation for hostnames, ips, and mac addresses
   *
   * @private
   * @memberof AddNodeDialogComponent
   */
  private update_available_hostname_ip_and_mac_addresses_(): void {
    if (!this.settings_ || !this.settings_.controller_interface || !this.node_type) {
      return;
    } else {
      const hostname: AbstractControl = this.node_form_group.get('hostname');
      const ip_address: AbstractControl = this.node_form_group.get('ip_address');
      const mac_address: AbstractControl = this.node_form_group.get('mac_address');

      hostname.clearValidators();
      hostname.setValidators(Validators.compose([validateFromArray(addNodeValidators.hostname,
                                                                   { uniqueArray: this.validation_hostnames_ })]));
      ip_address.clearValidators();
      ip_address.setValidators(Validators.compose([validateFromArray(addNodeValidators.ip_address,
                                                                     { uniqueArray: this.validation_ips_ })]));
      ip_address.setValue(undefined);
      ip_address.markAsPristine();
      ip_address.markAsUntouched();
      ip_address.updateValueAndValidity();
      /* istanbul ignore else */
      if (this.is_baremetal_deployment()) {
        mac_address.clearValidators();
        mac_address.setValidators(Validators.compose([validateFromArray(addNodeValidators.mac_address,
                                                                        { uniqueArray: this.validation_macs_ })]));
        mac_address.setValue(undefined);
        mac_address.markAsPristine();
        mac_address.markAsUntouched();
        mac_address.updateValueAndValidity();
      }
      const index: number = this.settings_.controller_interface.lastIndexOf('.');
      const subnet: string = this.settings_.controller_interface.substring(0, index + 1);
      // Will need LTAC added
      const offset: number = (this.node_type === SENSOR || this.node_type === MINIO) ? 50 : 40;
      // Will need LTAC added
      const number_of_addrs: number = (this.node_type === SENSOR || this.node_type === MINIO) ? 46 : 10;
      const available_ips: string[] = [];

      for (let i = 0; i < number_of_addrs; i++) {
        const last_octet: number = i + offset;
        available_ips.push(subnet + last_octet.toString());
      }

      this.available_ips = available_ips.filter((avail_ip: string) => !this.validation_ips_.includes(avail_ip));
    }
  }

  /**
   * Used for making api rest call to get nodes
   *
   * @private
   * @param {boolean} [call_initialize_node_form_group=false]
   * @memberof AddNodeDialogComponent
   */
  private update_validation_refs_(call_initialize_node_form_group: boolean = false): void {
    this.validation_hostnames_ = [];
    this.validation_ips_ = [];
    this.validation_macs_ = [];
    for (const node of this.nodes_) {
      this.validation_hostnames_.push(node.hostname.split('.')[0]);
      this.validation_ips_.push(node.ip_address);
      this.validation_macs_.push(node.mac_address);
    }
    this.validation_ips_.concat(this.validation_k8_ips_);
    /* istanbul ignore else */
    if (call_initialize_node_form_group) {
      this.initialize_node_form_group_();
    } else {
      this.update_available_hostname_ip_and_mac_addresses_();
    }
  }

  /**
   * Used for making api rest call to get kit status
   *
   * @private
   * @memberof AddNodeDialogComponent
   */
  private api_get_kit_status_(): void {
    this.kit_settings_service_.getKitStatus()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: KitStatusClass) => {
          this.kit_status_ = response;
          this.api_get_general_settings_();
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving kit status';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get general settings
   *
   * @private
   * @memberof AddNodeDialogComponent
   */
  private api_get_general_settings_(): void {
    this.kit_settings_service_.getGeneralSettings()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GeneralSettingsClass) => {
          this.settings_ = response;
          this.api_get_unused_ip_addresses_(true);
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
   * @param {boolean} [initialize_node_form_group_after_call=false]
   * @memberof AddNodeDialogComponent
   */
  private api_get_unused_ip_addresses_(initialize_node_form_group_after_call: boolean = false): void {
    this.kit_settings_service_.getUnusedIPAddresses(this.settings_.controller_interface, this.settings_.netmask)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string[]) => {
          this.available_ips = response;
          this.update_validation_refs_(initialize_node_form_group_after_call);
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
   * Used for making api rest call to add node
   *
   * @private
   * @memberof AddNodeDialogComponent
   */
  private api_add_node_(): void {
    this.kit_settings_service_.addNode(this.node_form_group.value)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          if (this.create_duplicate_) {
            this.available_ips = this.available_ips.filter((ip: string) => ip !== this.node_form_group.get('ip_address').value);
            this.validation_ips_.push(this.node_form_group.get('ip_address').value);
            this.validation_hostnames_.push(this.node_form_group.get('hostname').value);
            /* istanbul ignore else */
            if (ObjectUtilitiesClass.notUndefNull(this.node_form_group.get('mac_address').value)) {
              this.validation_macs_.push(this.node_form_group.get('mac_address').value);
            }
            this.initialize_node_form_group_(this.node_form_group);
          } else {
            this.cancel();
          }
          const message: string = `started node creation job for ${this.node_form_group.get('hostname').value}.`;
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR_DISMISS);
        },
        (error: ErrorMessageClass | PostValidationClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
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
            const message: string = 'adding node';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }
}
