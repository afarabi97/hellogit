import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { UserService } from '../../../../services/user.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { KitSettingsService } from '../../../../services/kit-settings.service';
import { VmwareDataInterface } from '../../interfaces/vmware-data.interface';
import { vmwareSettingsValidators } from '../../validators/vmware-settings.validator';

@Component({
    selector: 'app-vmware-settings',
    templateUrl: './vmware-settings.component.html'
})
export class VMWareSettingsComponent implements OnInit {
  @Input() hasTitle: boolean;
    vmwareSettings: FormGroup;
    showForm: boolean = false;
    isCardVisible: boolean;
    controllerMaintainer: boolean;
    isTestVmwareSettingsBtnEnabled: boolean;
    isSaveVmwareSettingsBtnEnabled: boolean;
    vmwareData: Partial<VmwareDataInterface> = {};

    constructor(private matSnackBarSrv: MatSnackBarService,
                private userService: UserService,
                private kitSettingsSvc: KitSettingsService) {
                  this.isTestVmwareSettingsBtnEnabled = true;
                  this.isSaveVmwareSettingsBtnEnabled = true;
                  this.hasTitle = true;
                  this.controllerMaintainer = this.userService.isControllerMaintainer();
    }

    ngOnInit() {
      this.createFormGroup();
      this.inputControl(true);
      this.kitSettingsSvc.getESXiSettings().subscribe((data) => {
        if (data){
          this.createFormGroup(data);
          if (data['ip_address'] && data['username'] && data['password']){
            this.kitSettingsSvc.testESXiSettings(this.vmwareSettings.value).subscribe(vmwareTestResults => {
              this.isTestVmwareSettingsBtnEnabled = true;
              if (vmwareTestResults){
                this.vmwareData = vmwareTestResults;
                this.inputControl(false);
              }
            });
          }
        }
      });
    }

    reEvaluate(event: KeyboardEvent){
      if (this.vmwareSettings){
        this.vmwareSettings.get('password').updateValueAndValidity();
        this.vmwareSettings.get('re_password').updateValueAndValidity();
      }
    }

    toggleCard(){
      this.isCardVisible = !this.isCardVisible;
    }

    isVMwareChecked(){
      if (this.vmwareSettings){
        return this.vmwareSettings.get('vcenter').value;
      }
      return false;
    }

    getErrorMessage(control: FormControl | AbstractControl): string {
      return control.errors ? control.errors.error_message : '';
    }

    testVMWareConfiguration(){
      this.vmwareSettings.get('folder').reset();
      this.vmwareSettings.get('datacenter').reset();
      this.vmwareSettings.get('cluster').reset();
      this.isTestVmwareSettingsBtnEnabled = false;
      this.matSnackBarSrv.displaySnackBar('Testing VMWare settings please wait.');
      this.kitSettingsSvc.testESXiSettings(this.vmwareSettings.value).subscribe(data => {
        this.isTestVmwareSettingsBtnEnabled = true;
        if (data){
          this.vmwareData = data;
          this.inputControl(false);
          this.matSnackBarSrv.displaySnackBar('VMWare settings tested successfully.');
        }
      }, err => {
        this.isTestVmwareSettingsBtnEnabled = true;
        this.matSnackBarSrv.displaySnackBar(err.error['message']);
      });
    }

    saveVMWareConfiguration(){
      this.isSaveVmwareSettingsBtnEnabled = false;
      this.matSnackBarSrv.displaySnackBar('Saving VMWare settings please wait.');
      this.kitSettingsSvc.saveESXiSettings(this.vmwareSettings.value).subscribe(data => {
        this.isSaveVmwareSettingsBtnEnabled = true;
        if (data){
          this.matSnackBarSrv.displaySnackBar('VMWare settings saved successfully.');
        }
      }, err => {
        this.isSaveVmwareSettingsBtnEnabled = true;
        console.error(err);
        this.matSnackBarSrv.displaySnackBar('VMWare settings failed to save.');
      });
    }

    inputControl(disable: boolean){
      const folder = this.vmwareSettings.get('folder');
      const datacenter = this.vmwareSettings.get('datacenter');
      const cluster = this.vmwareSettings.get('cluster');
      const portgroup = this.vmwareSettings.get('portgroup');
      const datastore = this.vmwareSettings.get('datastore');
      if (disable){
        folder.disable();
        datacenter.disable();
        cluster.disable();
        portgroup.disable();
        datastore.disable();
      } else{
        folder.enable();
        datacenter.enable();
        cluster.enable();
        portgroup.enable();
        datastore.enable();
      }
    }

    changeView() {
      this.showForm = !this.showForm;
    }

    private createFormGroup(vmwareSettingsForm?){
      const password = new FormControl(vmwareSettingsForm ? vmwareSettingsForm.password : '');
      const re_password = new FormControl(vmwareSettingsForm ? vmwareSettingsForm.password : '');

      this.vmwareSettings = new FormGroup({
        'ip_address': new FormControl(vmwareSettingsForm ? vmwareSettingsForm.ip_address : '',
                                      Validators.compose([validateFromArray(vmwareSettingsValidators.ip_address)])),
        'username': new FormControl(vmwareSettingsForm ? vmwareSettingsForm.username : '',
                                    Validators.compose([validateFromArray(vmwareSettingsValidators.username)])),
        'password': password,
        're_password': re_password,
        'datastore': new FormControl(vmwareSettingsForm ? vmwareSettingsForm.datastore : ''),
        'vcenter': new FormControl(vmwareSettingsForm ? vmwareSettingsForm.vcenter : false),
        'folder': new FormControl(vmwareSettingsForm ? vmwareSettingsForm.folder : ''),
        'portgroup': new FormControl(vmwareSettingsForm ? vmwareSettingsForm.portgroup : ''),
        'datacenter': new FormControl(vmwareSettingsForm ? vmwareSettingsForm.datacenter : ''),
        'cluster': new FormControl(vmwareSettingsForm ? vmwareSettingsForm.cluster : '')
      });

      // Since re_password is dependent on root_password, the formcontrol for root_password must exist first. Then we can add the dependency for validation
      const root_verify = Validators.compose([validateFromArray(vmwareSettingsValidators.password, { parentControl: this.vmwareSettings.get('re_password') })]);
      const re_verify = Validators.compose([validateFromArray(vmwareSettingsValidators.re_password, { parentControl: this.vmwareSettings.get('password') })]);
      password.setValidators(root_verify);
      re_password.setValidators(re_verify);

    }
}
