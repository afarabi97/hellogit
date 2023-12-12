import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import {
  ErrorMessageClass,
  ObjectUtilitiesClass,
  PostValidationClass,
  ValidationErrorClass,
  VMWareDataClass,
  VMWareSettingsClass
} from '../../../../classes';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { VMWareDataInterface } from '../../../../interfaces';
import { KitSettingsService } from '../../../../services/kit-settings.service';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { ConfirmPasswordValidator } from '../../../../validators/confirm-password.validator';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { VMWARE_SETTINGS_VALIDATOR_CONFIGS } from '../../constants/system-settings.constant';

/**
 * Component used for vmware or exsi settings management
 *
 * @export
 * @class VMWareSettingsComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-vmware-settings',
  templateUrl: './vmware-settings.component.html'
})
export class VMWareSettingsComponent implements OnInit {
  // Used for passing form group to html
  vmware_settings_form_group: FormGroup;
  // Used for enabling buttons in html
  isTestVmwareSettingsBtnEnabled: boolean;
  isSaveVmwareSettingsBtnEnabled: boolean;
  // Used for passing lists of data to html for form selection
  vmware_data: Partial<VMWareDataInterface>;

  /**
   * Creates an instance of VMWareSettingsComponent.
   *
   * @param {ChangeDetectorRef} change_detector_ref_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {KitSettingsService} kit_settings_service_
   * @memberof VMWareSettingsComponent
   */
  constructor(private change_detector_ref_: ChangeDetectorRef,
              private mat_snackbar_service_: MatSnackBarService,
              private kit_settings_service_: KitSettingsService) {
    this.isTestVmwareSettingsBtnEnabled = true;
    this.isSaveVmwareSettingsBtnEnabled = true;
    this.vmware_data = {};
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof VMWareSettingsComponent
   */
  ngOnInit(): void {
    this.api_get_vmware_settings_();
  }

  /**
   * Used for checking to see if vmware form control value is true
   *
   * @return {boolean}
   * @memberof VMWareSettingsComponent
   */
  is_wmware_checked(): boolean {
    return ObjectUtilitiesClass.notUndefNull(this.vmware_settings_form_group) &&
           ObjectUtilitiesClass.notUndefNull(this.vmware_settings_form_group.get('vcenter').value) ? this.vmware_settings_form_group.get('vcenter').value : false;
  }

  /**
   * Used for displaying error message for a form field
   *
   * @param {AbstractControl} control
   * @return {string}
   * @memberof VMWareSettingsComponent
   */
  get_error_message(control: AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  /**
   * Click button used for setting variables and making private calls accessable to public html
   *
   * @memberof VMWareSettingsComponent
   */
  click_button_test_connection(): void {
    this.isTestVmwareSettingsBtnEnabled = false;
    this.mat_snackbar_service_.displaySnackBar('Testing VMWare settings please wait.');
    this.api_test_vmware_settings_();
  }

  /**
   * Click button used for setting variables and making private calls accessable to public html
   *
   * @memberof VMWareSettingsComponent
   */
  click_button_save(): void {
    this.isSaveVmwareSettingsBtnEnabled = false;
    this.mat_snackbar_service_.displaySnackBar('Saving VMWare settings please wait.');
    this.api_save_vmware_settings_();
  }

  /**
   * Used for initializing the form group
   *
   * @private
   * @param {VMWareSettingsClass} [vmware_settings]
   * @memberof VMWareSettingsComponent
   */
  private initialize_vmware_settings_form_group_(vmware_settings?: VMWareSettingsClass): void {
    const vmware_settings_form_group = new FormGroup({
                                                       'ip_address': new FormControl(ObjectUtilitiesClass.notUndefNull(vmware_settings) && ObjectUtilitiesClass.notUndefNull(vmware_settings.ip_address) ? vmware_settings.ip_address : '',
                                                                                     Validators.compose([validateFromArray(VMWARE_SETTINGS_VALIDATOR_CONFIGS.ip_address)])),
                                                       'username': new FormControl(ObjectUtilitiesClass.notUndefNull(vmware_settings) && ObjectUtilitiesClass.notUndefNull(vmware_settings.username) ? vmware_settings.username : '',
                                                                                   Validators.compose([validateFromArray(VMWARE_SETTINGS_VALIDATOR_CONFIGS.username)])),
                                                       'password': new FormControl(ObjectUtilitiesClass.notUndefNull(vmware_settings) && ObjectUtilitiesClass.notUndefNull(vmware_settings.password) ? vmware_settings.password : '',
                                                                                   Validators.compose([validateFromArray(VMWARE_SETTINGS_VALIDATOR_CONFIGS.password)])),
                                                       'password_confirm': new FormControl(ObjectUtilitiesClass.notUndefNull(vmware_settings) && ObjectUtilitiesClass.notUndefNull(vmware_settings.password) ? vmware_settings.password : ''),
                                                       'vcenter': new FormControl(ObjectUtilitiesClass.notUndefNull(vmware_settings) && ObjectUtilitiesClass.notUndefNull(vmware_settings.vcenter) ? vmware_settings.vcenter : false),
                                                       'folder': new FormControl(ObjectUtilitiesClass.notUndefNull(vmware_settings) && ObjectUtilitiesClass.notUndefNull(vmware_settings.folder) ? vmware_settings.folder : null),
                                                       'datacenter': new FormControl(ObjectUtilitiesClass.notUndefNull(vmware_settings) && ObjectUtilitiesClass.notUndefNull(vmware_settings.datacenter) ? vmware_settings.datacenter : null),
                                                       'cluster': new FormControl(ObjectUtilitiesClass.notUndefNull(vmware_settings) && ObjectUtilitiesClass.notUndefNull(vmware_settings.cluster) ? vmware_settings.cluster : null),
                                                       'portgroup': new FormControl(ObjectUtilitiesClass.notUndefNull(vmware_settings) && ObjectUtilitiesClass.notUndefNull(vmware_settings.portgroup) ? vmware_settings.portgroup : null),
                                                       'datastore': new FormControl(ObjectUtilitiesClass.notUndefNull(vmware_settings) && ObjectUtilitiesClass.notUndefNull(vmware_settings.datastore) ? vmware_settings.datastore : null)
                                                     }, { validators: [ConfirmPasswordValidator.match('password','password_confirm')] });

    vmware_settings_form_group.get('password').valueChanges.subscribe(() => vmware_settings_form_group.get('password_confirm').updateValueAndValidity());
    vmware_settings_form_group.get('password_confirm').valueChanges.subscribe(() => vmware_settings_form_group.updateValueAndValidity());

    this.set_vmware_settings_form_group_(vmware_settings_form_group);
  }

  /**
   * Used for setting the form group
   *
   * @private
   * @param {FormGroup} vmware_settings_form_group
   * @memberof VMWareSettingsComponent
   */
  private set_vmware_settings_form_group_(vmware_settings_form_group: FormGroup): void {
    this.vmware_settings_form_group = vmware_settings_form_group;
  }

  /**
   * Used for disabling and enabling form group controls
   *
   * @private
   * @param {boolean} disable
   * @memberof VMWareSettingsComponent
   */
  private input_control_(disable: boolean): void {
    const folder = this.vmware_settings_form_group.get('folder');
    const datacenter = this.vmware_settings_form_group.get('datacenter');
    const cluster = this.vmware_settings_form_group.get('cluster');
    const portgroup = this.vmware_settings_form_group.get('portgroup');
    const datastore = this.vmware_settings_form_group.get('datastore');

    this.change_detector_ref_.detectChanges();

    if (disable) {
      folder.disable();
      datacenter.disable();
      cluster.disable();
      portgroup.disable();
      datastore.disable();
    } else {
      folder.enable();
      datacenter.enable();
      cluster.enable();
      portgroup.enable();
      datastore.enable();
    }
  }

  /**
   * Used for resetting values that do not affect status for test connection
   *
   * @private
   * @memberof VMWareSettingsComponent
   */
  private input_control_reset_(): void {
    const controls: AbstractControl[] = [
      this.vmware_settings_form_group.get('folder'),
      this.vmware_settings_form_group.get('datacenter'),
      this.vmware_settings_form_group.get('cluster'),
      this.vmware_settings_form_group.get('portgroup'),
      this.vmware_settings_form_group.get('datastore')
    ];

    controls.forEach((control: AbstractControl) => {
      /* istanbul ignore else */
      if (!ObjectUtilitiesClass.notUndefNull(control.value)) {
        control.reset();
      }
    });
  }

  /**
   * Used for constructing message displayed in a snackbar for post validation object
   *
   * @private
   * @param {object} post_validation
   * @param {string[]} post_validation_keys
   * @return {string}
   * @memberof VMWareSettingsComponent
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
   * Used for making api rest call to get vmware settings
   *
   * @private
   * @memberof VMWareSettingsComponent
   */
  private api_get_vmware_settings_(): void {
    this.kit_settings_service_.get_vmware_settings()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: VMWareSettingsClass) => {
          this.initialize_vmware_settings_form_group_(response);
          this.input_control_(true);
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response.ip_address) &&
              ObjectUtilitiesClass.notUndefNull(response.username) &&
              ObjectUtilitiesClass.notUndefNull(response.password)) {
            this.api_test_vmware_settings_(false, response);
          }
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving vmware settings';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to save vmware settings
   *
   * @private
   * @memberof VMWareSettingsComponent
   */
  private api_save_vmware_settings_(): void {
    const vmware_settings = this.vmware_settings_form_group.getRawValue();
    this.kit_settings_service_.save_vmware_settings(vmware_settings)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: boolean) => {
          this.initialize_vmware_settings_form_group_(vmware_settings);
          this.isSaveVmwareSettingsBtnEnabled = true;
          this.mat_snackbar_service_.displaySnackBar('VMWare settings saved successfully.');
        },
        (error: ValidationErrorClass | PostValidationClass | HttpErrorResponse) => {
          this.isSaveVmwareSettingsBtnEnabled = true;

          if (error instanceof ValidationErrorClass) {
            const field_keys: string[] = Object.keys(error.messages);
            let error_message: string = '';

            field_keys.forEach((key: string, key_index: number) => {
              error.messages[key].forEach((message: string, error_message_index: number) => {
                error_message += `${key}: ${message}`;
                /* istanbul ignore else */
                if (((error.messages[key].length - 1) > error_message_index) || ((field_keys.length - 1) > key_index)) {
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
            const message: string = 'saving esxi settings';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to test vmware settings
   *
   * @private
   * @param {boolean} [display_message=true]
   * @param {VMWareSettingsClass} [vmware_settings]
   * @memberof VMWareSettingsComponent
   */
  private api_test_vmware_settings_(display_message: boolean = true, vmware_settings?: VMWareSettingsClass): void {
    this.kit_settings_service_.test_vmware_settings(this.vmware_settings_form_group.getRawValue())
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: VMWareDataClass) => {
          this.isTestVmwareSettingsBtnEnabled = true;
          this.vmware_data = response;

          /* istanbul ignore else */
          if (display_message) {
            this.mat_snackbar_service_.displaySnackBar('VMWare settings tested successfully.');
          }

          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(vmware_settings)) {
            this.initialize_vmware_settings_form_group_(vmware_settings);
          } else {
            this.input_control_reset_();
          }
          this.input_control_(false);
        },
        (error: ErrorMessageClass | ValidationErrorClass | PostValidationClass | HttpErrorResponse) => {
          this.isTestVmwareSettingsBtnEnabled = true;

          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else if (error instanceof ValidationErrorClass) {
            const field_keys: string[] = Object.keys(error.messages);
            let error_message: string = '';

            field_keys.forEach((key: string, key_index: number) => {
              error.messages[key].forEach((message: string, error_message_index: number) => {
                error_message += `${key}: ${message}`;
                /* istanbul ignore else */
                if (((error.messages[key].length - 1) > error_message_index) || ((field_keys.length - 1) > key_index)) {
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
            const message: string = 'testing esxi settings';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }
}
