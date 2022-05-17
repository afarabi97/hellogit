import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { ErrorMessageClass, SuccessMessageClass } from '../../../../classes';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { PasswordMessageComponent } from '../../../../components/password-message/password-message.component';
import { COMMON_VALIDATORS, MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { ConfirmDialogMatDialogDataInterface } from '../../../../interfaces';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { UserService } from '../../../../services/user.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { KitPasswordInterface } from '../../interfaces/kit-password.interface';
import { ToolsService } from '../../services/tools.service';

const DIALOG_WIDTH = '800px';

export const target_config_validators = {
  required: [
    { error_message: 'Required field', validatorFn: 'required' }
  ],
  url: [
    { error_message: 'Required field', validatorFn: 'required' },
    { error_message: `Link must start with either 'http://' or 'https://' without quotation marks.`,
      validatorFn: 'pattern', ops: { pattern: /^(http:[/][/])|(https:[/][/])/ } }
  ]
};

@Component({
  selector: 'app-change-password-form',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordFormComponent implements OnInit {

  changePasswordForm: FormGroup;
  isCardVisible: boolean;
  controllerMaintainer: boolean;

  constructor(private toolsSrv: ToolsService,
              private dialog: MatDialog,
              private formBuilder: FormBuilder,
              private mat_snackbar_service_: MatSnackBarService,
              private userService: UserService) {
    this.isCardVisible = false;
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  toggleCard(){
    this.isCardVisible = !this.isCardVisible;
  }

  ngOnInit() {
    this.changePasswordForm = this.formBuilder.group({
      root_password: new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.root_password)]) )
    });
    this.changePasswordForm.addControl('re_password',
                                       new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.re_password,
                                                                               { parentControl: this.changePasswordForm.get('root_password') })] )));
  }

  onSubmit(){
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: 'Kit password change',
      message: 'Are you sure you want to change the Kits password? \
                Doing this will change the root password for all servers and sensors in the Kubernetes cluster.',
      option1: 'Cancel',
      option2: 'Confirm'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: confirm_dialog,
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === confirm_dialog.option2) {
        this.changePassword();
      }
    });
  }

  getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  passwordDialog() {
    this.dialog.open(PasswordMessageComponent,{
      minWidth: '400px'
    });
  }

  private changePassword() {
    const kit_password: KitPasswordInterface = this.changePasswordForm.getRawValue();
    delete kit_password["re_password"];

    this.toolsSrv.change_kit_password(kit_password)
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
