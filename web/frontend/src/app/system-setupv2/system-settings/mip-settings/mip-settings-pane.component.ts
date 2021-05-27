import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { validateFromArray } from '../../../validators/generic-validators.validator';
import { kitSettingsValidators } from '../../validators/kit-setup-validators';
import { KitSettingsService } from '../../services/kit-settings.service';
import { MatSnackBarService } from "../../../services/mat-snackbar.service"
import { GeneralSettings, MipSettings, KitStatus } from '../../models/kit';
import { UserService } from '../../../services/user.service';
import { WebsocketService } from '../../../services/websocket.service';

@Component({
  selector: 'app-mip-settings-pane',
  templateUrl: './mip-settings-pane.component.html',
  styleUrls: ['./mip-settings-pane.component.scss']
})

export class MIPSettingsPaneComponent implements OnInit {
  mipForm: FormGroup;
  isCardVisible: boolean;
  controllerMaintainer: boolean;
  default_operator_type = "cpt";

  @Input()
  hasTitle: boolean;

  @Input() generalSettings: Partial<GeneralSettings>;
  @Input() kitStatus: Partial<KitStatus>;

  constructor(public _WebsocketService:WebsocketService,
              private kitSettingsSrv: KitSettingsService,
              private userService: UserService,
              private matSnackBarService: MatSnackBarService) {
    this.hasTitle = true;
    this.controllerMaintainer = this.userService.isControllerMaintainer();
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
      'luks_re_password': luks_re_password,
      'operator_type': new FormControl(mipForm ? mipForm.operator_type : this.default_operator_type)
    });

    // Since re_password is dependent on password, the formcontrol for password must exist first. Then we can add the dependency for validation
    const root_verify = Validators.compose([
      validateFromArray(kitSettingsValidators.password,
        { parentControl: this.mipForm.get('re_password') })
    ])
    const re_verify = Validators.compose([
      validateFromArray(kitSettingsValidators.re_password,
        { parentControl: this.mipForm.get('password') })
    ])
    const user_verify = Validators.compose([
      validateFromArray(kitSettingsValidators.password,
        { parentControl: this.mipForm.get('user_password') })
    ])
    const user_re_verify = Validators.compose([
      validateFromArray(kitSettingsValidators.re_password,
        { parentControl: this.mipForm.get('user_re_password') })
    ])
    const luks_verify = Validators.compose([
      validateFromArray(kitSettingsValidators.password,
        { parentControl: this.mipForm.get('luks_re_password') })
    ])
    const luks_re_verify = Validators.compose([
      validateFromArray(kitSettingsValidators.re_password,
        { parentControl: this.mipForm.get('luks_password') })
    ])
    password.setValidators(root_verify);
    re_password.setValidators(re_verify);
    user_password.setValidators(user_verify);
    user_re_password.setValidators(user_re_verify);
    luks_password.setValidators(luks_verify);
    luks_re_password.setValidators(luks_re_verify);
  }

  reEvaluate(event: KeyboardEvent){
    if (this.mipForm){
      this.mipForm.get('password').updateValueAndValidity();
      this.mipForm.get('re_password').updateValueAndValidity();
      this.mipForm.get('luks_password').updateValueAndValidity();
      this.mipForm.get('luks_re_password').updateValueAndValidity();
    }
  }

  private socketRefresh(){
    this._WebsocketService.getSocket().on('kit-status-change', (data: KitStatus) => {
      this.kitStatus = data;
      this.checkJob();
    });
  }

  checkJob(){
    if(!this.kitStatus.general_settings_configured){
      this.mipForm.disable();
    }
    else{
      this.mipForm.enable();
    }
  }

  ngOnInit() {
    this.socketRefresh();
    this.createFormGroup();
    this.kitSettingsSrv.getMipSettings().subscribe((data: MipSettings) => {
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

  toggleCard(){
    this.isCardVisible = !this.isCardVisible;
  }

  getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  public saveMipSettings() {
    this.kitSettingsSrv.updateMipSettings(this.mipForm.getRawValue()).subscribe((data) => {

        this.matSnackBarService.displaySnackBar("MIP Settings Successfully Saved");
    });

  }
}
