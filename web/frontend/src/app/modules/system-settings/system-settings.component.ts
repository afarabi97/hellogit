import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import {
  ControllerInfoClass,
  ErrorMessageClass,
  GeneralSettingsClass,
  KitSettingsClass,
  KitStatusClass
} from '../../classes';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../constants/cvah.constants';
import { KitSettingsService } from '../../services/kit-settings.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { SYSTEM_SETTINGS_TITLE } from './constants/system-settings.constant';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss']
})
export class SystemSettingsComponent implements OnInit {
  // Used for retaining copy of general settings and passing to child components
  general_settings: Partial<GeneralSettingsClass> = {};
  // Used for retaining copy of kit settings and passing to child components
  kit_settings: KitSettingsClass;
  // Used for retaining copy of kit status and passing to child components
  kit_status: Partial<KitStatusClass> = {};
  // Used for retaining copy of controller info and passing to child components
  controller_info: Partial<ControllerInfoClass> = {};
  // Used for retaining copy of disable add button to turn on/off sections of html
  disable_add_kit_button: boolean;

  /**
   * Creates an instance of SystemSettingsComponent.
   *
   * @param {Title} title_
   * @param {KitSettingsService} kit_settings_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof SystemSettingsComponent
   */
  constructor(private title_: Title,
              private kit_settings_service_: KitSettingsService,
              private mat_snackbar_service_: MatSnackBarService) {
    this.disable_add_kit_button = true;
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof SystemSettingsComponent
   */
  ngOnInit() {
    this.title_.setTitle(SYSTEM_SETTINGS_TITLE);
    this.api_get_general_settings_();
    this.api_get_kit_status_();
    this.api_get_controller_info_();
    this.api_get_kit_settings_();
  }

  /**
   * Used for updating the general settings with passed value from child component
   *
   * @param {GeneralSettingsClass} value
   * @memberof SystemSettingsComponent
   */
  update_general_settings(value: GeneralSettingsClass): void {
    this.general_settings = value;
  }

  /**
   * Used for updating kit settings with passed value from child component
   *
   * @param {KitSettingsClass} value
   * @memberof SystemSettingsComponent
   */
  update_kit_settings(value: KitSettingsClass): void {
    this.kit_settings = value;
  }

  /**
   * Used for updating disable_add_kit_button with passed event from child component
   *
   * @param {boolean} event
   * @memberof SystemSettingsComponent
   */
  update_add_kit_button(event: boolean): void {
    this.disable_add_kit_button = event;
  }

  /**
   * Used for passing is gip value to child components
   *
   * @return {boolean}
   * @memberof SystemSettingsComponent
   */
  check_is_gip(): boolean {
    return this.kit_settings?.is_gip;
  }

  /**
   * Used for making api rest call to get general settings
   *
   * @private
   * @memberof SystemSettingsComponent
   */
  private api_get_general_settings_(): void {
    this.kit_settings_service_.get_general_settings()
                              .pipe(untilDestroyed(this))
                              .subscribe(
                                (response: GeneralSettingsClass) => {
                                  this.general_settings = response;
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
   * Used for making api rest call to get kit status
   *
   * @private
   * @memberof SystemSettingsComponent
   */
  private api_get_kit_status_(): void {
    this.kit_settings_service_.get_kit_status()
                              .pipe(untilDestroyed(this))
                              .subscribe(
                                (response: KitStatusClass) => {
                                  this.kit_status = response;
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
   * Used for making api rest call to get controller infor
   *
   * @private
   * @memberof SystemSettingsComponent
   */
  private api_get_controller_info_(): void {
    this.kit_settings_service_.get_controller_info()
                              .pipe(untilDestroyed(this))
                              .subscribe(
                                (response: ControllerInfoClass) => {
                                  this.controller_info = response;
                                },
                                (error: HttpErrorResponse) => {
                                  const message: string = 'retrieving controller info';
                                  this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                });
  }

  /**
   * Used for making api rest call to get kit settings
   *
   * @private
   * @memberof SystemSettingsComponent
   */
  private api_get_kit_settings_(): void {
    this.kit_settings_service_.get_kit_settings()
                              .pipe(untilDestroyed(this))
                              .subscribe(
                                (response: KitSettingsClass) => {
                                  this.kit_settings = response;
                                  this.disable_add_kit_button = false;
                                },
                                (error: ErrorMessageClass | HttpErrorResponse) => {
                                  if (error instanceof ErrorMessageClass) {
                                    this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                  } else {
                                    const message: string = 'retrieving kit settings';
                                    this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                  }
                                });
  }
}
