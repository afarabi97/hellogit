import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { GeneralSettingsClass, KitStatusClass } from '../../../../classes';
import { COMMON_TOOLTIPS } from '../../../../constants/tooltip.constant';
import { KitStatusInterface } from '../../../../interfaces';
import { UserService } from '../../../../services/user.service';
import { WebsocketService } from '../../../../services/websocket.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { KitSettingsService } from '../../../../services/kit-settings.service';
import { kitSettingsValidators } from '../../validators/kit-settings.validator';

@Component({
  selector: 'app-general-settings-pane',
  templateUrl: './general-settings-pane.component.html'
})
export class GeneralSettingsPaneComponent implements OnInit, OnChanges {
  @Input() hasTitle: boolean;
  @Input() generalSettings: Partial<GeneralSettingsClass>;
  @Input() kitStatus: Partial<KitStatusClass>;
  @Input() controllerInfo: any = {};
  @Output() public getGeneralSettings = new EventEmitter<any>();
  generalSettingsForm: FormGroup;
  dhcp_range_options: string[] = [];
  unused_ip_addresses: string[] = [];
  job_id: string;
  isReadOnly: boolean = true;
  dhcp_used_ips: string = '';
  showForm: boolean = false;
  isCardVisible: boolean;
  controllerMaintainer: boolean;
  jobRunning: boolean = false;
  buttonToolTip: string = '';

  constructor(public _WebsocketService:WebsocketService,
              private kitSettingsSrv: KitSettingsService,
              private userService: UserService,
              private router: Router
              ) {
    this.hasTitle = true;
    this.controllerMaintainer = this.userService.isControllerMaintainer();
    this.job_id = null;
  }

  ngOnInit() {
    this.socketRefresh();
    this.createFormGroup();
  }

  ngOnChanges(){
    if(this.generalSettings){
      this.job_id = this.generalSettings.job_id;
      this.createFormGroup(this.generalSettings);
      this.checkJob();
    }
    if (this.kitStatus.control_plane_deployed) {
      this.generalSettingsForm.get('domain').disable();
      this.generalSettingsForm.get('dhcp_range').disable();
    }
    if(this.controllerInfo){
      this.gatherControllerFacts();
    }
  }

  toggleCard(){
    this.isCardVisible = !this.isCardVisible;
  }

  checkJob(){
    if (this.job_id){
      this.kitSettingsSrv.getJob(this.job_id).subscribe(data => {
        if (data && data['status'] === 'started'){
          this.jobRunning = true;
          this.buttonToolTip = 'Job is running...';
          this.generalSettingsForm.disable();
        } else{
          this.jobRunning = false;
          this.buttonToolTip = '';
          this.generalSettingsForm.enable();
          if (this.kitStatus.control_plane_deployed) {
            this.generalSettingsForm.get('domain').disable();
            this.generalSettingsForm.get('dhcp_range').disable();
          }
        }
      },
      () => {
        window.location.reload();
      });
    }
  }

  getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  getTooltip(inputName: string): string {
    return COMMON_TOOLTIPS[inputName];
  }

  saveSettings() {
    this.generalSettings = this.generalSettingsForm.getRawValue();
    this.kitSettingsSrv.updateGeneralSettings(this.generalSettings).subscribe((data) => {
      const job_id = data['job_id'];
      this.job_id = job_id;
      this.generalSettings.job_id = job_id;
      this.generalSettingsForm.disable();
      this.checkJob();
      this.getGeneralSettings.emit(this.generalSettings);
    });
  }

  openPreviousJob() {
    const job_id = this.job_id;
    this.router.navigate([`/stdout/${job_id}`]);
  }

  checkDhcpRange() {
    const subnet = '255.255.255.224';
    if (this.generalSettingsForm) {
      if (this.generalSettingsForm.get('dhcp_range').valid) {
        const dhcp_range = this.generalSettingsForm.get('dhcp_range').value;
        this.kitSettingsSrv.getUsedIPAddresses(dhcp_range, subnet).subscribe(data => {
          let ips = data.toString();
          ips = ips.split(',').join('\n');
          this.dhcp_used_ips = ips;
        });
      }
    }
  }

  private createFormGroup(generalSettingsForm?) {
    this.generalSettingsForm = new FormGroup({
      'domain': new FormControl(generalSettingsForm ? generalSettingsForm.domain : '',
        Validators.compose([validateFromArray(kitSettingsValidators.domain)])),
      'controller_interface': new FormControl(generalSettingsForm ? generalSettingsForm.controller_interface : ''),
      'netmask': new FormControl(generalSettingsForm ? generalSettingsForm.netmask : '255.255.255.0',
        Validators.compose([validateFromArray(kitSettingsValidators.netmask)])),
      'gateway': new FormControl(generalSettingsForm ? generalSettingsForm.gateway : '',
        Validators.compose([validateFromArray(kitSettingsValidators.gateway)])),
      'dhcp_range': new FormControl(generalSettingsForm ? generalSettingsForm.dhcp_range : '',
        Validators.compose([validateFromArray(kitSettingsValidators.dhcp_range)]))
    });
  }

  private socketRefresh(){
    this._WebsocketService.getSocket().on('kit-status-change', (data: KitStatusInterface) => {
      this.kitStatus = new KitStatusClass(data);
      this.checkJob();
    });
  }

  private gatherControllerFacts() {
      this.generalSettingsForm.get('controller_interface').setValue(this.controllerInfo['ip_address']);
      this.generalSettingsForm.get('gateway').setValue(this.controllerInfo['gateway']);
      this.generalSettingsForm.get('netmask').setValue(this.controllerInfo['netmask']);
      this.dhcp_range_options = this.controllerInfo['cidrs'];
      this.unused_ip_addresses = this.controllerInfo['cidrs'];
  }
}
