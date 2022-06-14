import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { GeneralSettingsClass, KitStatusClass, MipSettingsClass } from '../../../../classes';
import { PasswordMessageComponent } from '../../../../components/password-message/password-message.component';
import { KitStatusInterface } from '../../../../interfaces';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { UserService } from '../../../../services/user.service';
import { WebsocketService } from '../../../../services/websocket.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { KitSettingsService } from '../../../../services/kit-settings.service';
import { kitSettingsValidators } from '../../validators/kit-settings.validator';

@Component({
  selector: 'app-mip-settings-pane',
  templateUrl: './mip-settings-pane.component.html',
  styleUrls: ['./mip-settings-pane.component.scss']
})

export class MIPSettingsPaneComponent implements OnInit, OnChanges {
  @Input() hasTitle: boolean;
  @Input() generalSettings: Partial<GeneralSettingsClass>;
  @Input() kitStatus: Partial<KitStatusClass>;
  mipForm: FormGroup;
  isCardVisible: boolean;
  controllerMaintainer: boolean;

  constructor(public _WebsocketService:WebsocketService,
              private kitSettingsSrv: KitSettingsService,
              private userService: UserService,
              private matSnackBarService: MatSnackBarService,
              private dialog: MatDialog) {
    this.hasTitle = true;
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  ngOnInit() {
    this.socketRefresh();
    this.createFormGroup();
    this.kitSettingsSrv.getMipSettings().subscribe((data: MipSettingsClass) => {
      if (data){
        this.createFormGroup(data);
      }
    });
  }

  ngOnChanges(){
    if (this.mipForm){
      this.checkJob();
    }
  }

  reEvaluate(event: KeyboardEvent){
    if (this.mipForm){
      this.mipForm.get('password').updateValueAndValidity();
      this.mipForm.get('re_password').updateValueAndValidity();
      this.mipForm.get('luks_password').updateValueAndValidity();
      this.mipForm.get('luks_re_password').updateValueAndValidity();
    }
  }

  checkJob(){
    if(!this.kitStatus.general_settings_configured){
      this.mipForm.disable();
    } else{
      this.mipForm.enable();
    }
  }

  toggleCard(){
    this.isCardVisible = !this.isCardVisible;
  }

  getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  saveMipSettings() {
    this.kitSettingsSrv.updateMipSettings(this.mipForm.getRawValue()).subscribe((data) => {

        this.matSnackBarService.displaySnackBar('MIP Settings Successfully Saved');
    });

  }

  passwordDialog() {
    this.dialog.open(PasswordMessageComponent,{
      minWidth: '400px'
    });
  }

  private createFormGroup(mipForm?) {
    const password = new FormControl(mipForm ? mipForm.password : '');
    const re_password = new FormControl(mipForm ? mipForm.password : '');
    const user_password = new FormControl(mipForm ? mipForm.user_password : '');
    const user_re_password = new FormControl(mipForm ? mipForm.user_password : '');
    const luks_password = new FormControl(mipForm ? mipForm.luks_password : '');
    const luks_re_password = new FormControl(mipForm ? mipForm.luks_password : '');

    this.mipForm = new FormGroup({
      'password': password,
      're_password': re_password,
      'user_password': user_password,
      'user_re_password': user_re_password,
      'luks_password': luks_password,
      'luks_re_password': luks_re_password
    });

    // Since re_password is dependent on password, the formcontrol for password must exist first. Then we can add the dependency for validation
    const root_verify = Validators.compose([
      validateFromArray(kitSettingsValidators.password,
        { parentControl: this.mipForm.get('re_password') })
    ]);
    const re_verify = Validators.compose([
      validateFromArray(kitSettingsValidators.re_password,
        { parentControl: this.mipForm.get('password') })
    ]);
    const user_verify = Validators.compose([
      validateFromArray(kitSettingsValidators.password,
        { parentControl: this.mipForm.get('user_password') })
    ]);
    const user_re_verify = Validators.compose([
      validateFromArray(kitSettingsValidators.re_password,
        { parentControl: this.mipForm.get('user_re_password') })
    ]);
    const luks_verify = Validators.compose([
      validateFromArray(kitSettingsValidators.password,
        { parentControl: this.mipForm.get('luks_re_password') })
    ]);
    const luks_re_verify = Validators.compose([
      validateFromArray(kitSettingsValidators.re_password,
        { parentControl: this.mipForm.get('luks_password') })
    ]);
    password.setValidators(root_verify);
    re_password.setValidators(re_verify);
    user_password.setValidators(user_verify);
    user_re_password.setValidators(user_re_verify);
    luks_password.setValidators(luks_verify);
    luks_re_password.setValidators(luks_re_verify);
  }

  private socketRefresh(){
    this._WebsocketService.getSocket().on('kit-status-change', (data: KitStatusInterface) => {
      this.kitStatus = new KitStatusClass(data);
      this.checkJob();
    });
  }
}
