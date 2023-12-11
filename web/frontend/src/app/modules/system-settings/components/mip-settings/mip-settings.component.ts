import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import {
  ErrorMessageClass,
  KitStatusClass,
  MipSettingsClass,
  ObjectUtilitiesClass,
  PostValidationClass,
  SuccessMessageClass,
  ValidationErrorClass
} from '../../../../classes';
import {
  COMMON_VALIDATORS,
  DIALOG_WIDTH_400PX,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR
} from '../../../../constants/cvah.constants';
import { KitStatusInterface, MipSettingsInterface } from '../../../../interfaces';
import { KitSettingsService } from '../../../../services/kit-settings.service';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { WebsocketService } from '../../../../services/websocket.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { PasswordMessageComponent } from '../../../global-components/components/password-message/password-message.component';
import { kitSettingsValidators } from '../../validators/kit-settings.validator';

/**
 * Component used for saving mip settings
 *
 * @export
 * @class MIPSettingsComponent
 * @implements {OnInit}
 * @implements {OnChanges}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-mip-settings',
  templateUrl: './mip-settings.component.html',
  styleUrls: ['./mip-settings.component.scss']
})
export class MIPSettingsComponent implements OnInit, OnChanges {
  // Pasrent pass variable
  @Input() kit_status: Partial<KitStatusClass>;

  // Used for accepting user values to save as mip settings
  mip_settings_form_group: FormGroup;

  /**
   * Creates an instance of MIPSettingsComponent.
   *
   * @param {MatDialog} mat_dialog_
   * @param {KitSettingsService} kit_settings_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {WebsocketService} websocket_service_
   * @memberof MIPSettingsComponent
   */
  constructor(private mat_dialog_: MatDialog,
              private kit_settings_service_: KitSettingsService,
              private mat_snackbar_service_: MatSnackBarService,
              private websocket_service_: WebsocketService) {
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof MIPSettingsComponent
   */
  ngOnInit(): void {
    this.initialize_mip_settings_form_group_();
    this.websocket_get_socket_on_kit_status_change();
    this.api_get_mip_settings_();
  }

  /**
   * Listens for changes on inputs
   *
   * @memberof MIPSettingsComponent
   */
  ngOnChanges(): void {
    /* istanbul ignore else */
    if (this.mip_settings_form_group) {
      this.check_job_();
    }
  }

  /**
   * Used for re evaluating password and re password form controls
   *
   * @memberof MIPSettingsComponent
   */
  re_evaluate(): void {
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(this.mip_settings_form_group)) {
      this.mip_settings_form_group.get('password').updateValueAndValidity();
      this.mip_settings_form_group.get('re_password').updateValueAndValidity();
      this.mip_settings_form_group.get('user_password').updateValueAndValidity();
      this.mip_settings_form_group.get('user_re_password').updateValueAndValidity();
      this.mip_settings_form_group.get('luks_password').updateValueAndValidity();
      this.mip_settings_form_group.get('luks_re_password').updateValueAndValidity();
    }
  }

  /**
   * Used for retrieving the error message for a form control
   *
   * @param {AbstractControl} control
   * @return {string}
   * @memberof KitSettingsComponent
   */
  get_error_message(control: AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  /**
   * Used for saving a form group and removing values for save
   *
   * @memberof MIPSettingsComponent
   */
  click_button_save(): void {
    this.api_update_mip_settings_();
  }

  /**
   * Used for opening a dialog window that show password rules
   *
   * @memberof KitSettingsComponent
   */
  open_password_dialog_window(): void {
    this.mat_dialog_.open(PasswordMessageComponent,
                          { minWidth: DIALOG_WIDTH_400PX });
  }

  /**
   * Used for setting up a form group
   *
   * @private
   * @param {MipSettingsClass} [mip_settings]
   * @memberof MIPSettingsComponent
   */
  private initialize_mip_settings_form_group_(mip_settings?: MipSettingsClass) {
    const mip_settings_form_group: FormGroup = new FormGroup({
                                                               'password': new FormControl(ObjectUtilitiesClass.notUndefNull(mip_settings?.password) ? mip_settings.password : '',
                                                                                           Validators.compose([validateFromArray(kitSettingsValidators.root_password,
                                                                                                                                 COMMON_VALIDATORS.required)])),
                                                               'user_password': new FormControl(ObjectUtilitiesClass.notUndefNull(mip_settings?.user_password) ? mip_settings.user_password : '',
                                                                                                Validators.compose([validateFromArray(kitSettingsValidators.root_password,
                                                                                                                                      COMMON_VALIDATORS.required)])),
                                                               'luks_password': new FormControl(ObjectUtilitiesClass.notUndefNull(mip_settings?.luks_password) ? mip_settings.luks_password : '',
                                                                                                Validators.compose([validateFromArray(kitSettingsValidators.root_password,
                                                                                                                                      COMMON_VALIDATORS.required)])),
                                                             });
    mip_settings_form_group.addControl('re_password', new FormControl(ObjectUtilitiesClass.notUndefNull(mip_settings?.password) ? mip_settings.password : '',
                                                                      Validators.compose([validateFromArray(kitSettingsValidators.re_password,
                                                                                                            { parentControl: mip_settings_form_group.get('password') })])));
    mip_settings_form_group.addControl('user_re_password', new FormControl(ObjectUtilitiesClass.notUndefNull(mip_settings?.user_password) ? mip_settings.user_password : '',
                                                                           Validators.compose([validateFromArray(kitSettingsValidators.re_password,
                                                                                                                 { parentControl: mip_settings_form_group.get('user_password') })])));
    mip_settings_form_group.addControl('luks_re_password', new FormControl(ObjectUtilitiesClass.notUndefNull(mip_settings?.luks_password) ? mip_settings.luks_password : '',
                                                                           Validators.compose([validateFromArray(kitSettingsValidators.re_password,
                                                                                                                 { parentControl: mip_settings_form_group.get('luks_password') })])));

    this.mip_settings_form_group = mip_settings_form_group;
  }

  /**
   * Used for checking a value in kit status to signal disabling and enabling mip settings form group
   *
   * @memberof MIPSettingsComponent
   */
  private check_job_(): void {
    if (!this.kit_status.general_settings_configured) {
      this.mip_settings_form_group.disable();
    } else {
      this.mip_settings_form_group.enable();
    }
  }

  /**
   * Used for constructing message displayed in a snackbar for post validation object
   *
   * @private
   * @param {object} post_validation
   * @param {string[]} post_validation_keys
   * @return {string}
   * @memberof MIPSettingsComponent
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
   * Used for setting up a websocket listener for kit-status-change
   *
   * @private
   * @memberof MIPSettingsComponent
   */
  private websocket_get_socket_on_kit_status_change(): void {
    this.websocket_service_.getSocket()
                           .on('kit-status-change',
                               (data: KitStatusInterface) => {
                                 this.kit_status = new KitStatusClass(data);
                                 this.check_job_();
                               });
  }

  /**
   * Used for making api rest call to get mip settings
   *
   * @private
   * @memberof MIPSettingsComponent
   */
  private api_get_mip_settings_(): void {
    this.kit_settings_service_.get_mip_settings()
                              .pipe(untilDestroyed(this))
                              .subscribe(
                                (response: MipSettingsClass) => {
                                  this.initialize_mip_settings_form_group_(response);
                                },
                                (error: ErrorMessageClass | HttpErrorResponse) => {
                                  if (error instanceof ErrorMessageClass) {
                                    this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                  } else {
                                    const message: string = 'retrieving mip settings';
                                    this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                  }
                                });
  }

  /**
   * Used for making api rest call to update mip settings
   *
   * @private
   * @memberof MIPSettingsComponent
   */
  private api_update_mip_settings_(): void {
    const mip_settings: Object = new Object(this.mip_settings_form_group.getRawValue());
    delete mip_settings['re_password'];
    delete mip_settings['user_re_password'];
    delete mip_settings['luks_re_password'];

    this.kit_settings_service_.update_mip_settings(mip_settings as MipSettingsInterface)
                              .pipe(untilDestroyed(this))
                              .subscribe(
                                (response: SuccessMessageClass) => {
                                  const message: string = 'saved Mip settings';
                                  this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
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
                                    const message: string = 'adding mip';
                                    this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                  }
                                });
  }
}
