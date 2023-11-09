import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { GeneralSettingsClass, KitStatusClass, MipSettingsClass, ObjectUtilitiesClass } from '../../../../classes';
import { COMMON_VALIDATORS } from '../../../../constants/cvah.constants';
import { KitStatusInterface } from '../../../../interfaces';
import { KitSettingsService } from '../../../../services/kit-settings.service';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { UserService } from '../../../../services/user.service';
import { WebsocketService } from '../../../../services/websocket.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { PasswordMessageComponent } from '../../../global-components/components/password-message/password-message.component';
import { kitSettingsValidators } from '../../validators/kit-settings.validator';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy({ checkProperties: true })
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

  re_evaluate(): void {
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(this.mipForm)) {
      this.mipForm.get('password').updateValueAndValidity();
      this.mipForm.get('re_password').updateValueAndValidity();
      this.mipForm.get('user_password').updateValueAndValidity();
      this.mipForm.get('user_re_password').updateValueAndValidity();
      this.mipForm.get('luks_password').updateValueAndValidity();
      this.mipForm.get('luks_re_password').updateValueAndValidity();
    }
  }

  private createFormGroup(mip_settings?: MipSettingsClass) {
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

    this.mipForm = mip_settings_form_group;
  }

  private socketRefresh(){
    this._WebsocketService.getSocket().on('kit-status-change', (data: KitStatusInterface) => {
      this.kitStatus = new KitStatusClass(data);
      this.checkJob();
    });
  }
}
