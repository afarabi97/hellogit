import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { validateFromArray } from '../../../validators/generic-validators.validator';
import { kitSettingsValidators, kickStartTooltips } from '../../validators/kit-setup-validators';
import { KitSettingsService } from '../../services/kit-settings.service';
import { Settings, GeneralSettings, KitStatus } from '../../models/kit';
import { UserService } from '../../../services/user.service';
import { WebsocketService } from '../../../services/websocket.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatDialog } from "@angular/material/dialog";
import { PasswordMessageComponent } from '../../../components/password-message/password-message.component'

@Component({
  selector: 'app-kit-settings-pane',
  templateUrl: './kit-settings-pane.component.html',
  styleUrls: ['./kit-settings-pane.component.scss']
})

export class KitSettingsPaneComponent implements OnInit {
  kitForm: FormGroup;
  dhcp_range_options: string[] = [];
  kubernetes_ip_options: string[];
  unused_ip_addresses: string[] = [];
  job_id: string;
  is_gip: boolean = false;
  cidr_ranges: any = {};
  isReadOnly: boolean = true;
  dhcp_used_ips: string = "";
  kube_svc_used_ips: string = "";
  showForm: boolean = false;
  isCardVisible: boolean;
  controllerMaintainer: boolean;
  dhcp_range: string = "";
  //general_settings: Partial<GeneralSettings> = {};
  //kitStatus: Partial<KitStatus> = {};
  kitButtonToolTip: string = "";
  kitJobRunning: boolean = false;

  @Input()
  hasTitle: boolean;

  @Input() generalSettings: Partial<GeneralSettings> = {};
  @Input() kitSettings: Partial<Settings> = {};
  @Input() kitStatus: Partial<KitStatus> = {};
  @Input() controllerInfo: any = {};

  constructor(public _WebsocketService:WebsocketService,
              private kitSettingsSrv: KitSettingsService,
              private userService: UserService,
              private router: Router,
              private dialog: MatDialog
              ) {
    this.hasTitle = true;
    this.controllerMaintainer = this.userService.isControllerMaintainer();
    this.job_id = null;
  }

  private createFormGroup(kitForm?) {
    const is_gip = new FormControl(kitForm ? kitForm.is_gip : '');
    const password = new FormControl(kitForm ? kitForm.password : '');
    const re_password = new FormControl(kitForm ? kitForm.password : '');

    this.kitForm = new FormGroup({
      'password': password,
      're_password': re_password,
      'upstream_ntp': new FormControl(kitForm ? kitForm.upstream_ntp : null,
        Validators.compose([validateFromArray(kitSettingsValidators.upstream_ntp)])),
      'upstream_dns': new FormControl(kitForm ? kitForm.upstream_dns : null,
        Validators.compose([validateFromArray(kitSettingsValidators.upstream_dns)])),
      'kubernetes_services_cidr': new FormControl(kitForm ? kitForm.kubernetes_services_cidr : '',
        Validators.compose([validateFromArray(kitSettingsValidators.kubernetes_services_cidr)])),
      'is_gip': is_gip
    });

  // Since re_password is dependent on password, the formcontrol for password must exist first. Then we can add the dependency for validation
  const root_verify = Validators.compose([
    validateFromArray(kitSettingsValidators.password,
      { parentControl: this.kitForm.get('re_password') })
  ])
  const re_verify = Validators.compose([
    validateFromArray(kitSettingsValidators.re_password,
      { parentControl: this.kitForm.get('password') })
  ])
  password.setValidators(root_verify);
  re_password.setValidators(re_verify);
}

  reEvaluate(event: KeyboardEvent) {
    if (this.kitForm) {
      this.kitForm.get('password').updateValueAndValidity();
      this.kitForm.get('re_password').updateValueAndValidity();
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
      this.kitForm.disable();
    }
    else{
      this.kitForm.enable();
    }
    if (this.job_id){
      this.kitSettingsSrv.getJob(this.job_id).subscribe(data => {
        if (data && data['status'] === 'started'){
          this.kitJobRunning = true;
          this.kitButtonToolTip = "Job is running...";
          this.kitForm.disable();
        }
        else{
          this.kitJobRunning = false;
          this.kitButtonToolTip = "";
          this.kitForm.enable();
          if (this.kitStatus.control_plane_deployed) {
            this.kitForm.get('kubernetes_services_cidr').disable();
            this.kitForm.get('password').disable();
            this.kitForm.get('re_password').disable();
          }
        }
      });
    }
  }

  ngOnInit() {
    this.socketRefresh();
    this.createFormGroup();
  }

  toggleCard(){
    this.isCardVisible = !this.isCardVisible;
  }

  ngOnChanges(){
    if(this.kitSettings && this.kitSettings != null){
      this.job_id = this.kitSettings.job_id
      this.createFormGroup(this.kitSettings);
      this.checkJob();
    }
    if(this.controllerInfo){
      this.gatherControllerFacts();
    }
  }

  private gatherControllerFacts() {
      this.dhcp_range_options = this.controllerInfo["cidrs"]
      this.unused_ip_addresses = this.controllerInfo["cidrs"];
      this.kubernetes_ip_options = this.controllerInfo["cidrs"];
      this.cidr_ranges = this.controllerInfo["cidr_ranges"];

      if(this.generalSettings && this.unused_ip_addresses){
        this.setKubernetes(this.generalSettings.dhcp_range);
      }
  }

  getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  public getTooltip(inputName: string): string {
    return kickStartTooltips[inputName];
  }

  /**
* Triggered everytime a user adds input to the Kubernetes CIDR input
*
* @param event - A Keyboard event.
*/
  public kubernetesInputEvent(): string {
    const kubernetes_value = this.kitForm.get('kubernetes_services_cidr').value;
    if (this.cidr_ranges[kubernetes_value] == undefined) {
      return ""
    }
    return `Kubernetes services range will be: ${this.cidr_ranges[kubernetes_value]["first"]} - ${this.cidr_ranges[kubernetes_value]["last"]}`;
  }

  public saveKitSettings() {
    this.kitSettings = this.kitForm.getRawValue();
    this.kitSettingsSrv.updateKitSettings(this.kitForm.getRawValue()).subscribe((data) => {
      const job_id = data['job_id'];
      this.job_id = job_id;
      this.kitSettings.job_id = job_id;
      this.kitForm.disable();
      this.checkJob();
    });
  }

  public openPreviousJob() {
    const job_id = this.job_id;
    this.router.navigate([`/stdout/${job_id}`]);
  }

  setKubernetes(dhcp_range) {
    this.kubernetes_ip_options = JSON.parse(JSON.stringify(this.unused_ip_addresses));
    let index = this.kubernetes_ip_options.indexOf(dhcp_range)
    if (index != -1) {
      this.kubernetes_ip_options.splice(index, 1);
    }
  }

  isGIPChecked(event: MatSlideToggleChange){
    if (event.checked){
      this.kitForm.get('is_gip').setValue(true);
    }
  }

  checkKubeSvcRange() {
    const subnet = "255.255.255.224"
    if (this.kitForm) {
      if (this.kitForm.get('kubernetes_services_cidr').valid) {
        let kubernetes_services_cidr = this.kitForm.get('kubernetes_services_cidr').value
        this.kitSettingsSrv.getUsedIPAddresses(kubernetes_services_cidr, subnet).subscribe(data => {
          let ips = data.toString();
          ips = ips.split(",").join("\n")
          this.kube_svc_used_ips = ips;
        })
      }
    }
  }

passwordDialog() {
    this.dialog.open(PasswordMessageComponent,{
      minWidth: "400px"
    });
  }
}
