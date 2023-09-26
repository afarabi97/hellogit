import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ErrorMessageClass, HiveSettingsClass, ObjectUtilitiesClass } from '../../../../classes';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { HiveSettingsInterface } from '../../../../interfaces';
import { GlobalHiveSettingsService } from '../../../../services/global-hive-settings.service';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { HiveSettingsService } from '../../services/hive-settings.service';

/**
 * Component used for saving hive settings
 *
 * @export
 * @class HiveSettingsComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-hive-settings',
  templateUrl: './hive-settings.component.html'
})
export class HiveSettingsComponent implements OnInit {
  // Used for tieing form group to html form group inputs
  hive_settings_form_group: FormGroup;

  /**
   * Creates an instance of HiveSettingsComponent.
   *
   * @param {FormBuilder} form_builder_
   * @param {GlobalHiveSettingsService} global_hive_settings_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {HiveSettingsService} hive_settings_service_
   * @memberof HiveSettingsComponent
   */
  constructor(private form_builder_: FormBuilder,
              private global_hive_settings_service_: GlobalHiveSettingsService,
              private mat_snackbar_service_: MatSnackBarService,
              private hive_settings_service_: HiveSettingsService) { }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof HiveSettingsComponent
   */
  ngOnInit(): void {
    this.api_get_hive_settings_();
  }

  /**
   * Used for opeing a confirm dialog window for saving hive settings
   *
   * @memberof HiveSettingsComponent
   */
  click_button_save(): void {
    this.api_save_hive_settings_(this.hive_settings_form_group.getRawValue() as HiveSettingsInterface);
  }

  /**
   * Used for setting the hive settings form group
   *
   * @private
   * @param {FormGroup} hive_settings_form_group
   * @memberof HiveSettingsComponent
   */
  private set_hive_settings_form_group_(hive_settings_form_group: FormGroup): void {
    this.hive_settings_form_group = hive_settings_form_group;
  }

  /**
   * Used for making api rest call to get hive settings
   *
   * @private
   * @memberof HiveSettingsComponent
   */
  private api_get_hive_settings_(): void {
    this.global_hive_settings_service_.get_hive_settings()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: HiveSettingsClass) => {
          const hive_settings_form_group: FormGroup = this.form_builder_.group({
            admin_api_key: new FormControl((ObjectUtilitiesClass.notUndefNull(response) &&
                                            ObjectUtilitiesClass.notUndefNull(response.admin_api_key)) ? response.admin_api_key : '',
                                           Validators.compose([Validators.minLength(32), Validators.maxLength(32), Validators.required])),
            org_admin_api_key: new FormControl((ObjectUtilitiesClass.notUndefNull(response) &&
                                                ObjectUtilitiesClass.notUndefNull(response.org_admin_api_key)) ? response.org_admin_api_key : '',
                                               Validators.compose([Validators.minLength(32), Validators.maxLength(32), Validators.required]))
          });
          this.set_hive_settings_form_group_(hive_settings_form_group);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving hive settings';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to save hive settings
   *
   * @private
   * @param {HiveSettingsInterface} hive_settings_interface
   * @memberof HiveSettingsComponent
   */
  private api_save_hive_settings_(hive_settings_interface: HiveSettingsInterface): void {
    this.hive_settings_service_.save_hive_settings(hive_settings_interface)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: HiveSettingsClass) => {
          const message: string = ' saved Hive API Key.';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'saving Hive API key for an unknown reason. Please check the /var/log/tfplenum logs for more information';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }
}
