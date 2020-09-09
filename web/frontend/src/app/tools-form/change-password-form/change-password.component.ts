import { Component, OnInit } from '@angular/core';
import { ToolsService } from '../tools.service';
import { ConfirmDailogComponent } from '../../confirm-dailog/confirm-dailog.component'
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { COMMON_VALIDATORS } from '../../frontend-constants';
import { validateFromArray } from '../../validators/generic-validators.validator';
import { UserService } from '../../user.service';


const DIALOG_WIDTH = "800px";

export const target_config_validators = {
  required: [
    { error_message: 'Required field', validatorFn: 'required' }
  ],
  url: [
    { error_message: 'Required field', validatorFn: 'required' },
    { error_message: "Link must start with either 'http://' or 'https://' without quotation marks.",
      validatorFn: 'pattern', ops: { pattern: /^(http:[/][/])|(https:[/][/])/ } }
  ]
}

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

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  private insertInToArray(amended_passwords: Array<Object>, item: Object) {
    for (let i = 0; i < amended_passwords.length; i++){
      if (amended_passwords[i]["ip_address"] === item["ip_address"]){
        amended_passwords.splice(i, 1, item);
        return;
      }
    }
    amended_passwords.push(item);
  }

  private changePassword(amended_passwords: Array<Object>=[]){
    this.toolsSrv.changeKitPassword(this.changePasswordForm.getRawValue(), amended_passwords).subscribe(
      data => {
        this.displaySnackBar(data["message"]);
      },
      error => {
        if (error.error instanceof ErrorEvent) {
          console.error('An error occurred:', error.error.message);
          this.displaySnackBar("Oops! Something bad happend.");
        } else {
          if (error.status == 409) {
            this.displaySnackBar(error.error['message']);
          }
          if (error.status == 422) {
            this.displaySnackBar("Authentication failure. Check the ssh key on the controller.");
          }
          if (error.status == 500) {
            this.displaySnackBar(error.error['message']);
          }
        }
      }
    );
  }

  onSubmit(){
    const option2 = "Confirm";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: DIALOG_WIDTH,
      data: { "paneString": "Are you sure you want to change the Kits password? \
                             Doing this will change the root password for all servers and sensors in the Kubernetes cluster.",
              "paneTitle": "Kit password change", "option1": "Cancel", "option2": option2 },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        this.changePassword();
      }
    });
  }

  public getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }
}
