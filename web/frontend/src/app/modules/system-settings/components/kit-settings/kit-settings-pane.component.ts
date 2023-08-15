import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import {
  BackgroundJobClass,
  GeneralSettingsClass,
  KitSettingsClass,
  KitStatusClass,
  ObjectUtilitiesClass
} from '../../../../classes';
import { COMMON_TOOLTIPS } from '../../../../constants/tooltip.constant';
import { KitSettingsInterface, KitStatusInterface, ServerStdoutMatDialogDataInterface } from '../../../../interfaces';
import { GlobalJobService } from '../../../../services/global-job.service';
import { KitSettingsService } from '../../../../services/kit-settings.service';
import { UserService } from '../../../../services/user.service';
import { WebsocketService } from '../../../../services/websocket.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { PasswordMessageComponent } from '../../../global-components/components/password-message/password-message.component';
import { ServerStdoutComponent } from '../../../server-stdout/server-stdout.component';
import { kitSettingsValidators } from '../../validators/kit-settings.validator';

@Component({
  selector: 'app-kit-settings-pane',
  templateUrl: './kit-settings-pane.component.html',
  styleUrls: ['./kit-settings-pane.component.scss']
})
export class KitSettingsPaneComponent implements OnInit, OnChanges {
  @Input() hasTitle: boolean;
  @Input() generalSettings: Partial<GeneralSettingsClass> = {};
  @Input() kitStatus: Partial<KitStatusClass> = {};
  @Input() controllerInfo: any = {};
  @Input() kitSettings: KitSettingsClass;
  @Output() getSettings = new EventEmitter<KitSettingsClass>();
  @Output() update_disable_buttons = new EventEmitter<boolean>();

  kitForm: FormGroup;
  dhcp_range_options: string[] = [];
  kubernetes_ip_options: string[] = [];
  unused_ip_addresses: string[] = [];
  job_id: string;
  cidr_ranges: any = {};
  isReadOnly: boolean = true;
  dhcp_used_ips: string = '';
  kube_svc_used_ips: string = '';
  showForm: boolean = false;
  isCardVisible: boolean;
  controllerMaintainer: boolean;
  dhcp_range: string = '';
  kitButtonToolTip: string = '';
  kitJobRunning: boolean = false;

  constructor(private websocket_service_: WebsocketService,
              private global_job_service_: GlobalJobService,
              private kitSettingsSrv: KitSettingsService,
              private userService: UserService,
              private dialog: MatDialog,
              private chanage_detector_ref_: ChangeDetectorRef) {
    this.hasTitle = true;
    this.controllerMaintainer = this.userService.isControllerMaintainer();
    this.job_id = null;
  }

  ngOnInit() {
    this.socketRefresh();
  }

  ngAfterViewInit(): void {
    this.chanage_detector_ref_.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const kit_settings_changes: SimpleChange = changes['kitSettings'];
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(kit_settings_changes) &&
        (kit_settings_changes.currentValue !== kit_settings_changes.previousValue || !ObjectUtilitiesClass.notUndefNull(kit_settings_changes.currentValue))) {
      this.createFormGroup();
      this.checkJob();
    }
    if (ObjectUtilitiesClass.notUndefNull(this.kitStatus)) {
      this.checkJob();
    }
    if (this.controllerInfo){
      this.gatherControllerFacts();
    }
  }

  reEvaluate(event: KeyboardEvent) {
    if (this.kitForm) {
      this.kitForm.get('password').updateValueAndValidity();
      this.kitForm.get('re_password').updateValueAndValidity();
    }
  }

  checkJob(){
    this.job_id = ObjectUtilitiesClass.notUndefNull(this.kitSettings) ? this.kitSettings.job_id : null;
    if (!this.kitForm){
      return;
    }

    if(this.kitStatus.general_settings_configured){
      this.kitForm.enable();
      this.update_disable_buttons.emit(false);
    } else{
      this.kitForm.disable();
      this.update_disable_buttons.emit(true);
    }

    if (this.job_id && this.kitStatus.general_settings_configured){
      this.global_job_service_.job_get(this.job_id).subscribe((data: BackgroundJobClass) => {
        if (data && data['status'] === 'started'){
          this.kitJobRunning = true;
          this.kitButtonToolTip = 'Job is running...';
          this.kitForm.disable();
          this.update_disable_buttons.emit(true);
        } else{
          this.kitJobRunning = false;
          this.kitButtonToolTip = '';
          this.kitForm.enable();
          this.update_disable_buttons.emit(false);
          this.getSettings.emit(this.kitSettings);
          if (this.kitStatus.control_plane_deployed) {
            this.kitForm.get('kubernetes_services_cidr').disable();
            this.kitForm.get('password').disable();
            this.kitForm.get('re_password').disable();
          }
        }
      });
    }
  }

  toggleCard(){
    this.isCardVisible = !this.isCardVisible;
  }

  getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  getTooltip(inputName: string): string {
    return COMMON_TOOLTIPS[inputName];
  }

  /**
  * Triggered everytime a user adds input to the Kubernetes CIDR input
  *
  * @param event - A Keyboard event.
  */
  kubernetesInputEvent(): string {
    const kubernetes_value = this.kitForm.get('kubernetes_services_cidr').value;
    if (this.cidr_ranges[kubernetes_value] === undefined) {
      return '';
    }
    return `Kubernetes services range will be: ${this.cidr_ranges[kubernetes_value]['first']} - ${this.cidr_ranges[kubernetes_value]['last']}`;
  }

  saveKitSettings() {
    if (!this.kitForm.get('upstream_ntp').value){
      this.kitForm.get('upstream_ntp').setValue(null);
    }
    if (!this.kitForm.get('upstream_dns').value){
      this.kitForm.get('upstream_dns').setValue(null);
    }

    const form = new Object(this.kitForm.getRawValue());
    form['is_gip'] = form['is_gip'] === "GIP";
    this.kitSettings = new KitSettingsClass(form as KitSettingsInterface);

    this.kitSettingsSrv.updateKitSettings(form).subscribe((data) => {
      const job_id = data['job_id'];
      this.job_id = job_id;
      this.kitSettings.job_id = job_id;
      this.kitForm.disable();
      this.checkJob();
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

  setKubernetes(dhcp_range) {
    this.kubernetes_ip_options = JSON.parse(JSON.stringify(this.unused_ip_addresses));
    for (let x=0; x<this.kubernetes_ip_options.length; x++) {
      if (this.kubernetes_ip_options[x].endsWith(".32")) {
        this.kubernetes_ip_options.splice(x, 1);
      }
    }
    const index = this.kubernetes_ip_options.indexOf(dhcp_range);
    if (index !== -1) {
      this.kubernetes_ip_options.splice(index, 1);
    }
  }

  checkKubeSvcRange() {
    const subnet = '255.255.255.224';
    if (this.kitForm) {
      if (this.kitForm.get('kubernetes_services_cidr').valid) {
        const kubernetes_services_cidr = this.kitForm.get('kubernetes_services_cidr').value;
        this.kitSettingsSrv.getUsedIPAddresses(kubernetes_services_cidr, subnet).subscribe(data => {
          let ips = data.toString();
          ips = ips.split(',').join('\n');
          this.kube_svc_used_ips = ips;
        });
      }
    }
  }

  passwordDialog() {
    this.dialog.open(PasswordMessageComponent,{
      minWidth: '400px'
    });
  }

  private createFormGroup() {
    this.kitForm = new FormGroup({
      'password': new FormControl(ObjectUtilitiesClass.notUndefNull(this.kitSettings) &&
                                  ObjectUtilitiesClass.notUndefNull(this.kitSettings.password) ? this.kitSettings.password : ''),
      're_password': new FormControl(ObjectUtilitiesClass.notUndefNull(this.kitSettings) &&
                                     ObjectUtilitiesClass.notUndefNull(this.kitSettings.password) ? this.kitSettings.password : ''),
      'upstream_ntp': new FormControl(ObjectUtilitiesClass.notUndefNull(this.kitSettings) &&
                                      ObjectUtilitiesClass.notUndefNull(this.kitSettings.upstream_ntp) ? this.kitSettings.upstream_ntp : null,
                                      Validators.compose([validateFromArray(kitSettingsValidators.upstream_ntp)])),
      'upstream_dns': new FormControl(ObjectUtilitiesClass.notUndefNull(this.kitSettings) &&
                                      ObjectUtilitiesClass.notUndefNull(this.kitSettings.password) ? this.kitSettings.upstream_dns : null,
                                      Validators.compose([validateFromArray(kitSettingsValidators.upstream_dns)])),
      'kubernetes_services_cidr': new FormControl(ObjectUtilitiesClass.notUndefNull(this.kitSettings) &&
                                                  ObjectUtilitiesClass.notUndefNull(this.kitSettings.kubernetes_services_cidr) ? this.kitSettings.kubernetes_services_cidr : '',
                                                  Validators.compose([validateFromArray(kitSettingsValidators.kubernetes_services_cidr)])),
      'is_gip': new FormControl(ObjectUtilitiesClass.notUndefNull(this.kitSettings) &&
                                ObjectUtilitiesClass.notUndefNull(this.kitSettings.is_gip) &&
                                (this.kitSettings.is_gip === true) ? "GIP": "DIP")
    });

    // Since re_password is dependent on password, the formcontrol for password must exist first. Then we can add the dependency for validation
    const root_verify = Validators.compose([
      validateFromArray(kitSettingsValidators.password,
        { parentControl: this.kitForm.get('re_password') })
    ]);
    const re_verify = Validators.compose([
      validateFromArray(kitSettingsValidators.re_password,
        { parentControl: this.kitForm.get('password') })
    ]);
    this.kitForm.get('password').setValidators(root_verify);
    this.kitForm.get('re_password').setValidators(re_verify);
  }

  private socketRefresh(){
    this.websocket_service_.getSocket().on('kit-status-change', (data: KitStatusInterface) => {
      this.kitStatus = new KitStatusClass(data);
      this.checkJob();
    });
  }

  private gatherControllerFacts() {
      this.dhcp_range_options = this.controllerInfo['cidrs'];
      this.unused_ip_addresses = this.controllerInfo['cidrs'];
      this.kubernetes_ip_options = this.controllerInfo['cidrs'];
      this.cidr_ranges = this.controllerInfo['cidr_ranges'];

      if(this.generalSettings && this.unused_ip_addresses){
        this.setKubernetes(this.generalSettings.dhcp_range);
      }
  }
}
