import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { COMMON_VALIDATORS } from '../../constants/cvah.constants';
import { UserService } from '../../services/user.service';
import { validateFromArray } from '../../validators/generic-validators.validator';
import { ToolsService } from '../services/tools.service';
import { ConfirmDialogMatDialogDataInterface } from '../../interfaces';
import { PasswordMessageComponent } from '../../components/password-message/password-message.component';

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
              private snackBar: MatSnackBar,
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

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, 'Close', { duration: duration_seconds * 1000});
  }

  private changePassword() {
    this.toolsSrv.changeKitPassword(this.changePasswordForm.getRawValue()).subscribe(
      data => {
        this.displaySnackBar(data['message']);
      },
      error => {
        console.error(error);
        if (error.status === 404 || error.status === 409) {
          this.displaySnackBar(error.error['message']);
        } else if (error.status === 403) {
          this.displaySnackBar('Authentication failure. Check the ssh key on the controller.');
        } else {
          this.displaySnackBar('An unknown error occured.');
        }
      }
    );
  }
}
