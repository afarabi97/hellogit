import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ErrorMessageClass, KitTokenClass, ObjectUtilitiesClass, SuccessMessageClass } from '../../../../classes';
import { DIALOG_WIDTH_400PX, DIALOG_WIDTH_800PX, MAT_SNACKBAR_CONFIGURATION_60000_DUR, MAT_SNACKBAR_CONFIGURATION_60000_DUR_OK } from '../../../../constants/cvah.constants';
import { KitTokenInterface } from '../../../../interfaces';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { KIT_TOKEN_TABLE_COLUMNS } from '../../constants/system-settings.constant';
import { CopyTokenDialogDataInterface } from '../../interfaces';
import { KitTokenSettingsService } from '../../services/kit-token-settings.service';
import { AddKitTokenDialogComponent } from './components/add-kit-token-dialog/add-kit-token-dialog.component';
import { CopyTokenDialogComponent } from './components/copy-token-dialog/copy-token-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Component used for saving kit token settings
 *
 * @export
 * @class KitTokenSettingsComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-kit-token-settings',
  templateUrl: './kit-token-settings.component.html',
})
export class KitTokenSettingsComponent implements OnInit {
  // Parent passed inputs
  @Input() gip_build: boolean;
  @Input() disable_add_kit_button: boolean;
  // Child ref to mat table
  @ViewChild('KitTokenTable') private kit_token_table_: MatTable<KitTokenClass>;
  // Used for passing columns to kit token table
  kit_token_table_columns: string[];
  // Used for passing kit tokens to table for display
  kit_tokens: KitTokenClass[];

  /**
   * Creates an instance of KitTokenSettingsComponent.
   *
   * @param {MatDialog} mat_dialog_
   * @param {KitTokenSettingsService} kit_token_settings_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof KitTokenSettingsComponent
   */
  constructor(private mat_dialog_: MatDialog,
              private kit_token_settings_service_: KitTokenSettingsService,
              private mat_snackbar_service_: MatSnackBarService) {
    this.kit_token_table_columns = KIT_TOKEN_TABLE_COLUMNS;
    this.kit_tokens = [];
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof KitTokenSettingsComponent
   */
  ngOnInit(): void {
    this.api_get_kit_tokens_();
  }

  /**
   * Used for passing disabled to add kit button
   *
   * @return {boolean}
   * @memberof KitTokenSettingsComponent
   */
  disabled_button_add_kit(): boolean {
    return !this.gip_build || this.disable_add_kit_button;
  }

  /**
   * Usedf for handeling click button delete
   *
   * @param {KitTokenClass} kit_token
   * @memberof KitTokenSettingsComponent
   */
  click_button_delete(kit_token: KitTokenClass): void {
    this.api_delete_kit_token_(kit_token);
  }

  /**
   * Used for opening the copy token dialog
   *
   * @param {KitTokenClass} kit_token
   * @memberof KitTokenSettingsComponent
   */
  open_copy_token_dialog(kit_token: KitTokenClass): void {
    const copy_token_dialog_data: CopyTokenDialogDataInterface = {
      title: `Kit Token: ${kit_token.ipaddress}`,
      token: kit_token.token
    };

    this.mat_dialog_.open(CopyTokenDialogComponent,
                          { minWidth: DIALOG_WIDTH_400PX, disableClose: true, data: copy_token_dialog_data });
  }

  /**
   * Used for opening the add kit token dialog
   *
   * @memberof KitTokenSettingsComponent
   */
  open_add_kit_token_dialog(): void {
    const mat_dialog_ref: MatDialogRef<AddKitTokenDialogComponent, any> = this.mat_dialog_.open(AddKitTokenDialogComponent,
                                                                                                { width: DIALOG_WIDTH_800PX, disableClose: true });
    mat_dialog_ref.afterClosed()
                  .pipe(untilDestroyed(this))
                  .subscribe(
                    (response: KitTokenInterface) => {
                      /* istanbul ignore else */
                      if (ObjectUtilitiesClass.notUndefNull(response)) {
                        this.api_create_kit_token_(response);
                      }
                    });
  }

  /**
   * Used for making api rest call to get get kit tokens
   *
   * @private
   * @memberof KitTokenSettingsComponent
   */
  private api_get_kit_tokens_(): void {
    this.kit_token_settings_service_.get_kit_tokens()
                                    .pipe(untilDestroyed(this))
                                    .subscribe(
                                      (response: KitTokenClass[]) => {
                                        this.kit_tokens = response;
                                      },
                                      (error: ErrorMessageClass | HttpErrorResponse) => {
                                        if (error instanceof ErrorMessageClass) {
                                          this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                        } else {
                                          const message: string = 'retrieving kit tokens';
                                          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                        }
                                      });
  }

  /**
   * Used for making api rest call to create kit token
   *
   * @private
   * @param {KitTokenInterface} kit_token
   * @memberof KitTokenSettingsComponent
   */
  private api_create_kit_token_(kit_token: KitTokenInterface) {
    this.kit_token_settings_service_.create_kit_token(kit_token)
                                    .pipe(untilDestroyed(this))
                                    .subscribe(
                                      (response: KitTokenClass) => {
                                          this.kit_tokens.push(response);
                                          this.kit_token_table_.renderRows();
                                          const message: string = `Token Generated for Kit ${kit_token.ipaddress}`;
                                          this.mat_snackbar_service_.displaySnackBar(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR_OK);
                                      },
                                      (error: ErrorMessageClass | HttpErrorResponse) => {
                                        if (error instanceof ErrorMessageClass) {
                                          this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                        } else {
                                          const message: string = 'creating kit token';
                                          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                        }
                                      });
  }

  /**
   * Used for making api rest call to delete kit token
   *
   * @private
   * @param {KitTokenClass} kit_token
   * @memberof KitTokenSettingsComponent
   */
  private api_delete_kit_token_(kit_token: KitTokenClass): void {
    this.kit_token_settings_service_.delete_kit_token(kit_token.kit_token_id)
                                    .pipe(untilDestroyed(this))
                                    .subscribe(
                                      (response: SuccessMessageClass) => {
                                        this.mat_snackbar_service_.generate_return_success_snackbar_message(response.success_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR_OK);
                                        this.kit_tokens = this.kit_tokens.filter((kt: KitTokenClass) => kt.kit_token_id !== kit_token.kit_token_id);
                                      },
                                      (error: ErrorMessageClass | HttpErrorResponse) => {
                                        if (error instanceof ErrorMessageClass) {
                                          this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                        } else {
                                          const message: string = 'deleting kit token';
                                          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                        }
                                      });
  }
}
