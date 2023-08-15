import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { BackgroundJobClass, GeneralSettingsClass, KitStatusClass, ObjectUtilitiesClass } from '../../../../classes';
import { COMMON_TOOLTIPS } from '../../../../constants/tooltip.constant';
import { KitStatusInterface, ServerStdoutMatDialogDataInterface } from '../../../../interfaces';
import { GlobalJobService } from '../../../../services/global-job.service';
import { KitSettingsService } from '../../../../services/kit-settings.service';
import { UserService } from '../../../../services/user.service';
import { WebsocketService } from '../../../../services/websocket.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { ServerStdoutComponent } from '../../../server-stdout/server-stdout.component';
import { kitSettingsValidators } from '../../validators/kit-settings.validator';

@Component({
  selector: 'app-general-settings-pane',
  templateUrl: './general-settings-pane.component.html'
})
export class GeneralSettingsPaneComponent implements OnInit, OnChanges {
  @Input() hasTitle: boolean;
  @Input() generalSettings: Partial<GeneralSettingsClass>;
  @Input() kitStatus: Partial<KitStatusClass>;
  @Input() controllerInfo: any;
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
              private global_job_service_: GlobalJobService,
              private kitSettingsSrv: KitSettingsService,
              private userService: UserService,
              private dialog: MatDialog) {
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
      this.global_job_service_.job_get(this.job_id).subscribe((data: BackgroundJobClass) => {
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

  openPreviousJob(): void {
    const server_stdout_mat_dialog_data: ServerStdoutMatDialogDataInterface = {
      job_id: this.job_id
    };
    this.dialog.open(ServerStdoutComponent, {
      height: '90vh',
      width: '75vw',
      data: server_stdout_mat_dialog_data
    });
  }

  private createFormGroup(generalSettingsForm?) {
    this.generalSettingsForm = new FormGroup({
      'domain': new FormControl(generalSettingsForm ? generalSettingsForm.domain : '',
        Validators.compose([validateFromArray(kitSettingsValidators.domain)])),
      'controller_interface': new FormControl(generalSettingsForm ? generalSettingsForm.controller_interface : ''),
      'netmask': new FormControl(generalSettingsForm ? generalSettingsForm.netmask : '255.255.255.0',
        Validators.compose([validateFromArray(kitSettingsValidators.netmask)])),
      'gateway': new FormControl(generalSettingsForm ? generalSettingsForm.gateway : '',
        Validators.compose([validateFromArray(kitSettingsValidators.gateway)]))
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
