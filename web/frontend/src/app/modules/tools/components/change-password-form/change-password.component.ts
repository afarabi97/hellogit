import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ErrorMessageClass, ObjectUtilitiesClass, SuccessMessageClass } from '../../../../classes';
import {
  COMMON_VALIDATORS,
  CONFIRM_DIALOG_OPTION,
  DIALOG_MIN_WIDTH_400PX,
  DIALOG_WIDTH_800PX,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR
} from '../../../../constants/cvah.constants';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { ConfirmDialogComponent } from '../../../global-components/components/confirm-dialog/confirm-dialog.component';
import { PasswordMessageComponent } from '../../../global-components/components/password-message/password-message.component';
import { PASSWORD_CONFIRM_DIALOG } from '../../constants/tools.constant';
import { KitPasswordInterface } from '../../interfaces/kit-password.interface';
import { ToolsService } from '../../services/tools.service';

/**
 * Component allows user to change the kit password
 *
 * @export
 * @class ChangePasswordFormComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-change-password-form',
  templateUrl: './change-password.component.html',
  styleUrls: [
    './change-password.component.scss'
  ]
})
export class ChangePasswordFormComponent implements OnInit {
  // Used for passing form group to html
  change_kit_password_form_group: FormGroup;

  /**
   * Creates an instance of ChangePasswordFormComponent.
   *
   * @param {FormBuilder} form_builder_
   * @param {MatDialog} mat_dialog_
   * @param {ToolsService} tools_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof ChangePasswordFormComponent
   */
  constructor(private form_builder_: FormBuilder,
              private mat_dialog_: MatDialog,
              private tools_service_: ToolsService,
              private mat_snackbar_service_: MatSnackBarService) { }

  /**
   * Used for initial setup
   *
   * @memberof ChangePasswordFormComponent
   */
  ngOnInit(): void {
    this.initialize_change_kit_password_form_group_();
  }

  /**
   * Used for opening password rules dialog window
   *
   * @memberof ChangePasswordFormComponent
   */
  open_password_rules_dialog(): void {
    this.mat_dialog_.open(PasswordMessageComponent, {
      minWidth: DIALOG_MIN_WIDTH_400PX
    });
  }

  /**
   * Used for re evaluating password and re password form controls
   *
   * @private
   * @memberof ChangePasswordFormComponent
   */
  re_evaluate(): void {
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(this.change_kit_password_form_group)) {
      this.change_kit_password_form_group.get('root_password').updateValueAndValidity();
      this.change_kit_password_form_group.get('re_password').updateValueAndValidity();
    }
  }

  /**
   * Used for displaying error message for a form field
   *
   * @param {(FormControl | AbstractControl)} form_control
   * @return {string}
   * @memberof ChangePasswordFormComponent
   */
  get_error_message(form_control: FormControl | AbstractControl): string {
    return form_control.errors ? form_control.errors.error_message : '';
  }

  /**
   * Used for displaying a dialog window to let the operator
   * know that they are changing the password
   *
   * @memberof ChangePasswordFormComponent
   */
  update_button_click(): void {
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_800PX,
      disableClose: true,
      data: PASSWORD_CONFIRM_DIALOG
    });

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (response === CONFIRM_DIALOG_OPTION) {
            this.api_change_kit_password_();
          }
        });
  }

  /**
   * Used for initializing the form group
   *
   * @private
   * @memberof ChangePasswordFormComponent
   */
  private initialize_change_kit_password_form_group_(): void {
    const change_kit_password_form_group: FormGroup = this.form_builder_.group({
      root_password: new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.root_password, COMMON_VALIDATORS.required)]))
    });
    change_kit_password_form_group.addControl('re_password', new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.re_password,
                                                                                                                       { parentControl: change_kit_password_form_group.get('root_password') })])));

    this.change_kit_password_form_group = change_kit_password_form_group;
  }

  /**
   * Used for making api rest call to change kit password
   *
   * @private
   * @memberof ChangePasswordFormComponent
   */
  private api_change_kit_password_(): void {
    const kit_password: KitPasswordInterface = this.change_kit_password_form_group.getRawValue() as KitPasswordInterface;
    delete kit_password['re_password'];

    this.tools_service_.change_kit_password(kit_password)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          this.mat_snackbar_service_.displaySnackBar(response.success_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = `changing kit password`;
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }
}
