import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { debounceTime } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { ArchiveSaveDialogComponent } from '../../archive-save-dialog/archive-save-dialog.component';
import { ArchiveRestoreDialogComponent } from '../../archive-restore-dialog/archive-restore-dialog.component';
import { ArchiveService } from '../../services/archive.service';
import { SnackbarWrapper } from '../../classes/snackbar-wrapper';
import { CTRL_SELECTED, KICKSTART_ID } from '../../frontend-constants';
import { KickstartService } from '../services/kickstart.service';
import { kickStartTooltips, kickstart_validators } from './kickstart-form';
import { AllValidationErrors, FormGroupControls, getFormValidationErrors, validateFromArray } from '../../validators/generic-validators.validator';
import { isIpv4InSubnet } from '../../globals';
import { SystemSetupService } from '../services/system-setup.service';
import { WeaponSystemNameService} from '../../services/weapon-system-name.service';
import { UserService } from '../../user.service';
import { TIMEZONES2 } from '../../date-time-picker/date-time.component';

@Component({
  selector: 'app-kickstart-form',
  templateUrl: './kickstart.component.html',
  styleUrls: ['./kickstart.component.scss']
})
export class KickstartComponent implements OnInit {
  public availableIPs: string[] = [];
  public controllers: any[] = [];
  private defaultDisk: string;
  public dhcp_range_options: string[] = [];
  private default_ipv4_settings;
  public kickStartFormGroup: FormGroup;
  public loading: boolean;
  public system_name: string;
  public controllerAdmin: boolean;
  public timeZones = TIMEZONES2;
  public min_systems: number = 0;

  constructor(private archiveSrv: ArchiveService,
    private fb: FormBuilder,
    private kickStartSrv: KickstartService,
    private matDialog: MatDialog,
    private snackbarWrapper: SnackbarWrapper,
    private title: Title,
    private systemSetupSrv: SystemSetupService,
    private sysNameSrv: WeaponSystemNameService,
    private userService: UserService) {
      this.title.setTitle("Kickstart Configuration");
      this.setupKickstartForm();
      this.controllerAdmin = this.userService.isControllerAdmin();
  }

  ngOnInit() {
  }

  private setupKickstartForm() {
    this.system_name = this.sysNameSrv.getSystemName();
    this.initKickStartForm();
    this.initializeView();
  }

  private initializeView(): void {
    this.loading = true;
    if (this.system_name == 'DIP' || this.system_name == 'GIP') {
      this.min_systems = 2;
      this.initDIP();
    }

    if (this.system_name == 'MIP') {
      this.min_systems = 1;
      this.initMIP();
    }
  }

  private initDIP() {
    forkJoin({
      localhost: this.kickStartSrv.gatherDeviceFacts("localhost"),
      kickstart: this.kickStartSrv.getKickstartForm()
    }).subscribe(data => {
      this.loading = false;
      if (data['localhost']) {
        this.default_ipv4_settings = data['localhost']['default_ipv4_settings'];
        this.controllers = data['localhost']["interfaces"].filter(controller => controller['ip_address']);
        this.defaultDisk = data['localhost']["disks"][0].name;
      }
      if (data['kickstart']) {
        this.openIPChangedModal(data['kickstart'].controller_interface[0]);
        this.initKickStartForm(data['kickstart']);
      }
    });
  }

  private initMIP() {
    forkJoin({
      localhost: this.kickStartSrv.gatherDeviceFacts("localhost"),
      kickstart: this.kickStartSrv.getMIPKickstartForm()
    }).subscribe(data => {
      this.loading = false;
      if (data['localhost']) {
        this.default_ipv4_settings = data['localhost']['default_ipv4_settings'];
        this.controllers = data['localhost']["interfaces"].filter(controller => controller['ip_address']);
        this.defaultDisk = data['localhost']["disks"][0].name;
      }
      if (data['kickstart']) {
        this.initKickStartForm(data['kickstart']);
      }
    });
  }

  /**
   * returns a string with the DHCP range
   *
   * @returns {string}
   * @memberof KickstartFormComponent
   */
  public dhcpInputEvent(): string {
    if (this.kickStartFormGroup.get('dhcp_range').value == null) {
      return;
    }
    const kubernetes_value = this.kickStartFormGroup.get('dhcp_range').value;
    const octet_1 = kubernetes_value.split('.')[0] + '.';
    const octet_2 = kubernetes_value.split('.')[1] + '.';
    const octet_3 = kubernetes_value.split('.')[2] + '.';
    let octet_4 = parseInt(kubernetes_value.split('.')[3], 10);
    let dhcp_range_start = "";

    if (isNaN(octet_4)) {
      return CTRL_SELECTED;
    } else {
      while (octet_4 > 0) {
        // The magic number 16 correlates to a /28. We're basically looking for
        // the first subnet which matches a /28 and that will end up being the
        // base address for the range. If the number is evenly divisible by 16
        // that means we've found the base of the address range and 15 beyond that
        // is the maximum range.
        if (octet_4 % 16 === 0) {
          break;
        } else {
          octet_4 -= 1;
        }
      }
      // You can't have an address of 0 so Metallb will actually increment this by
      // 1 in this case.
      if (octet_4 === 0) {
        octet_4 = 1;
        dhcp_range_start = octet_1 + octet_2 + octet_3 + String(octet_4);
        return `DHCP range will be: ${dhcp_range_start} - ${String(octet_4 + 14)}`;
      } else {
        dhcp_range_start = octet_1 + octet_2 + octet_3 + String(octet_4);
        return `DHCP range will be: ${dhcp_range_start} - ${String(octet_4 + 15)}`;
      }
    }
  }

  /**
   * sets availableIPs to the reponse from api for unused IPS
   *
   * @memberof KickstartFormComponent
   */
  public getOpenIP(): void {
    let mng_ip = this.kickStartFormGroup.get('controller_interface').value[0];
    let netmask = this.kickStartFormGroup.get('netmask');
    if (mng_ip.length === 0 || netmask.invalid) {
      return;
    }
    this.kickStartSrv.getUnusedIPAddresses(mng_ip, netmask.value).subscribe((data: string[]) => {
      this.availableIPs = data;
    });
  }

  /**
   * Sets KickstartFormGroup to a new FormGroup
   *
   * @param {*} [kickstartForm]
   * @memberof KickstartFormComponent
   */
  private initKickStartForm(kickstartForm?): void {
    this.kickStartFormGroup = this.newkickStartForm(kickstartForm);
    if (this.kickStartFormGroup.get('dhcp_range').value) {
      this.dhcp_range_options = [this.kickStartFormGroup.get('dhcp_range').value];
    }
    // add one noode to the formArray at this point because uniqueArray needs to exist for validation reference
    const nodesFormArray = this.kickStartFormGroup.get('nodes') as FormArray;
    if (kickstartForm) {
      kickstartForm.nodes.map((node, index) => {
        nodesFormArray.push(this.newNodeFormGroup(node, index));
      });
    } else {
      nodesFormArray.push(this.newNodeFormGroup(undefined, 0));
      nodesFormArray.push(this.newNodeFormGroup(undefined, 1));
    }
    const controller_interface = this.kickStartFormGroup.get('controller_interface') as FormArray;
    if (kickstartForm) {
      if (controller_interface.at(0).dirty && this.kickStartFormGroup.get('netmask').touched && this.kickStartFormGroup.get('netmask').valid) {
        this.getAvaliableIPBlock(this.kickStartFormGroup);
      }
      if (controller_interface.at(0).valid && this.kickStartFormGroup.get('netmask').valid) {
        this.getAvaliableIPBlock(this.kickStartFormGroup);
        this.getOpenIP();
      }
      this.kickStartFormGroup.disable();
    }
  }

  /**
   * returns a new KickStartFromGroup
   *
   * @param {*} [kickstartForm]
   * @returns {FormGroup}
   * @memberof KickstartFormComponent
   */
  private newkickStartForm(kickstartForm?): FormGroup {
    const root_password = new FormControl(kickstartForm ? kickstartForm.root_password : '');
    const re_password = new FormControl(kickstartForm ? kickstartForm.re_password : '', );

    const kickstartFormGroup = this.fb.group({
      controller_interface: this.fb.array([new FormControl(kickstartForm ? kickstartForm.controller_interface[0] : '', Validators.compose([validateFromArray(kickstart_validators.controller_interface)]))]),
      root_password: root_password,
      re_password: re_password,
      nodes: this.fb.array([]),
      netmask: new FormControl(kickstartForm ? kickstartForm.netmask : '255.255.255.0', Validators.compose([validateFromArray(kickstart_validators.netmask)])),
      gateway: new FormControl(kickstartForm ? kickstartForm.gateway : '', Validators.compose([validateFromArray(kickstart_validators.gateway)]))
    });

    if (this.system_name === "DIP" || this.system_name === "GIP") {
      kickstartFormGroup.addControl('domain', new FormControl(kickstartForm ? kickstartForm.domain : '', Validators.compose([validateFromArray(kickstart_validators.domain)])));
      kickstartFormGroup.addControl('upstream_dns', new FormControl(kickstartForm ? kickstartForm.upstream_dns : '', Validators.compose([validateFromArray(kickstart_validators.upstream_dns)])));
      kickstartFormGroup.addControl('upstream_ntp', new FormControl(kickstartForm ? kickstartForm.upstream_ntp : '', Validators.compose([validateFromArray(kickstart_validators.upstream_ntp)])));
    }

    if (this.system_name === "MIP") {
      let luks_password_control = new FormControl(kickstartForm ? kickstartForm.luks_password : '', Validators.compose([validateFromArray(kickstart_validators.luks_password)]));
      let confirm_luks_password_control = new FormControl(kickstartForm ? kickstartForm.confirm_luks_password : '', Validators.compose([validateFromArray(kickstart_validators.confirm_luks_password, { parentControl: luks_password_control })]));

      kickstartFormGroup.addControl('luks_password', luks_password_control);
      kickstartFormGroup.addControl('confirm_luks_password', confirm_luks_password_control);

      kickstartFormGroup.addControl('dns', new FormControl(kickstartForm ? kickstartForm.dns : '', Validators.compose([validateFromArray(kickstart_validators.dns)])));
    }

    // since re_password is dependent on root_password, the formcontrol for root_password must exist first. Then we can add the dependency for validation
    const root_verify = Validators.compose([validateFromArray(kickstart_validators.root_password, { parentControl: kickstartFormGroup.get('re_password') })])
    const re_verify = Validators.compose([validateFromArray(kickstart_validators.re_password, { parentControl: kickstartFormGroup.get('root_password') })])
    root_password.setValidators(root_verify);
    re_password.setValidators(re_verify);

    kickstartFormGroup.addControl('dhcp_range', new FormControl(kickstartForm ? kickstartForm.dhcp_range : '', Validators.compose([validateFromArray(kickstart_validators.dhcp_range, { parentFormGroup: kickstartFormGroup })])));
    // reset the dhcp range when on change
    let controller_interface = kickstartFormGroup.get('controller_interface') as FormArray;
    this.onControllerChanges(kickstartFormGroup, controller_interface);
    this.onNetmaskChanges(kickstartFormGroup, controller_interface);
    return kickstartFormGroup;
  }

  reEvaluate(event: KeyboardEvent){
    if (this.kickStartFormGroup){
      this.kickStartFormGroup.get('root_password').updateValueAndValidity();
      this.kickStartFormGroup.get('re_password').updateValueAndValidity();
    }
  }

  /**
   * On controller_interface change, get available IP Blocks when controller_interface and netmask are VALID.
   *
   * @param {FormGroup} kickstartFormGroup
   * @param {FormArray} controller_interface
   * @memberof KickstartFormComponent
   */
  private onControllerChanges(kickstartFormGroup: FormGroup, controller_interface: FormArray): void {
    // reset the dhcp range when on change
    controller_interface.at(0).valueChanges.pipe(debounceTime(1500)).subscribe(value => {
      if (controller_interface.at(0).dirty && kickstartFormGroup.get('netmask').touched && kickstartFormGroup.get('netmask').valid) {
        this.getAvaliableIPBlock(kickstartFormGroup);
      }
    });
  }

  /**
   * On netmask changes, it will reset the dhcp_range. When controller_interface and netmask are VALID
   * it will request available IPs
   *
   * @param {FormGroup} kickstartFormGroup
   * @param {FormArray} controller_interface
   * @memberof KickstartFormComponent
   */
  private onNetmaskChanges(kickstartFormGroup: FormGroup, controller_interface: FormArray): void {
    // when netmask and controller_interface are valid, request the ipBlocks
    kickstartFormGroup.get('netmask').valueChanges.pipe(debounceTime(1500)).subscribe(value => {
      if (controller_interface.at(0).valid && kickstartFormGroup.get('netmask').valid) {
        this.getAvaliableIPBlock(kickstartFormGroup);
        this.getOpenIP();
      }
      if (kickstartFormGroup.get('netmask').invalid) {
        kickstartFormGroup.get('dhcp_range').reset();
      }
    });
  }

  /**
   * Makes an HTTP request for availableIPBlocks. Requires a valid controller_interface and netmask
   *
   * @param {*} kickstartFormGroup
   * @memberof KickstartFormComponent
   */
  private getAvaliableIPBlock(kickstartFormGroup): void {
    const controller_interface = kickstartFormGroup.get('controller_interface').value[0];
    const netmask = kickstartFormGroup.get('netmask').value
    this.kickStartSrv.getAvailableIPBlocks2(controller_interface, netmask).subscribe((ipblocks: string[]) => this.dhcp_range_options = ipblocks);
  }

  /**
   * Adds a new Node FormGroup to nodeArray
   *
   * @param {FormArray} nodeArray
   * @memberof KickstartFormComponent
   */
  public addNode(nodeArray: FormArray): void {
    nodeArray.push(this.newNodeFormGroup(undefined, nodeArray.length));
  }

  /**
   * returns a new Node FormGroup
   *
   * @param {*} [node]
   * @param {*} [index]
   * @returns {FormGroup}
   * @memberof KickstartFormComponent
   */
  private newNodeFormGroup(node?, index?): FormGroup {
    let nodes = this.kickStartFormGroup.get('nodes');

    let formGroup: FormGroup;

    if (this.system_name === "DIP" || this.system_name === "GIP") {
      let dip_group = this.fb.group({
        hostname: new FormControl(node ? node.hostname : '', Validators.compose([validateFromArray(kickstart_validators.hostname, { uniqueArray: nodes, formControlName: 'hostname', index: index })])),
        ip_address: new FormControl(node ? node.ip_address : '', Validators.compose([validateFromArray(kickstart_validators.ip_address, { uniqueArray: nodes, formControlName: 'ip_address', parentFormGroup: this.kickStartFormGroup, index: index })])),
        mac_address: new FormControl(node ? node.mac_address : '', Validators.compose([validateFromArray(kickstart_validators.mac_address, { uniqueArray: nodes, formControlName: 'mac_address', index: index })])),
        data_drive: new FormControl(node && node.data_drive ? node.data_drive : 'sdb', Validators.compose([validateFromArray(kickstart_validators.data_drive)])),
        boot_drive: new FormControl(node ? node.boot_drive : this.defaultDisk ? this.defaultDisk : 'sda', Validators.compose([validateFromArray(kickstart_validators.boot_drive)])),
        raid_drives: new FormControl(node && node.raid_drives ? node.raid_drives : 'sda,sdb', Validators.compose([validateFromArray(kickstart_validators.raid_drives)])),
        pxe_type: new FormControl(node ? node.pxe_type : 'BIOS', Validators.compose([validateFromArray(kickstart_validators.pxe_type)])),
        os_raid: new FormControl(node && node.os_raid != null ? node.os_raid : false),
        os_raid_root_size: new FormControl(node && node.os_raid_root_size != null ? node.os_raid_root_size : 50)
      });

      formGroup = dip_group;
    }

    if (this.system_name === "MIP") {
      let mip_group = this.fb.group({
        hostname: new FormControl(node ? node.hostname : '', Validators.compose([validateFromArray(kickstart_validators.hostname, { uniqueArray: nodes, formControlName: 'hostname', index: index })])),
        ip_address: new FormControl(node ? node.ip_address : '', Validators.compose([validateFromArray(kickstart_validators.ip_address, { uniqueArray: nodes, formControlName: 'ip_address', parentFormGroup: this.kickStartFormGroup, index: index })])),
        mac_address: new FormControl(node ? node.mac_address : '', Validators.compose([validateFromArray(kickstart_validators.mac_address, { uniqueArray: nodes, formControlName: 'mac_address', index: index })])),
        pxe_type: new FormControl(node ? node.pxe_type : 'NVMe', Validators.compose([validateFromArray(kickstart_validators.pxe_type)]))
      });

      formGroup = mip_group;
    }

    return formGroup;
  }

  /**
   * removes a formcontrol form nodeArray at index
   *
   * @param {FormArray} nodeArray
   * @param {number} index
   * @memberof KickstartFormComponent
   */
  public removeNode(nodeArray: FormArray, index: number): void {
    nodeArray.removeAt(index);
  }

  /**
   * removes a formcontrol form nodeArray at index
   *
   * @param {FormArray} nodeArray
   * @param {number} index
   * @memberof KickstartFormComponent
   */
  public duplicateNode(nodeArray: FormArray, index: number): void {
    let node = this.newNodeFormGroup(nodeArray.at(index).value, nodeArray.length);
    let hostname = node.get('hostname').value;
    let name_int = hostname.match(/(\d+)/);
    if(name_int != undefined) {
      let new_int = (parseInt(name_int[0]) + 1).toString();
      let hostname_arr = hostname.split('');
      hostname_arr.splice(name_int['index'],name_int[0].length,new_int)
      hostname = hostname_arr.join('');
    }
    let ip_array = node.get('ip_address').value.split('.');
    let last_octet = parseInt(ip_array[3]);
    if(last_octet < 255) {
      ip_array[3] = last_octet + 1;
    }
    node.patchValue({
      hostname: hostname,
      ip_address: ip_array.join('.'),
    });
    nodeArray.push(node);
  }


  /**
   *
   * @return {FormArray}
   * @memberof KickstartFormComponent
   */
  public nodesFormArray(): FormArray {
    return this.kickStartFormGroup.get('nodes') as FormArray;
  }

  /**
   * returns error_message for control
   *
   * @param {(FormControl | AbstractControl)} control
   * @returns {string}
   * @memberof KickstartFormComponent
   */
  public getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  /**
   * returns All the validations Errors from array FormGroupControls
   *
   * @param {FormGroupControls} controls
   * @returns {AllValidationErrors[]}
   * @memberof KickstartFormComponent
   */
  public getFormValidationErrors(controls: FormGroupControls): AllValidationErrors[] {
    return getFormValidationErrors(controls);
  }

  /**
   * Initializes a new KickstartFormGroup
   *
   * @memberof KickstartFormComponent
   */
  public clearKickstartFormGroup(): void {
    this.initKickStartForm();
  }

  /**
   * returns a tooltip from KickStartTooltips
   *
   * @param {string} inputName
   * @returns {string}
   * @memberof KickstartFormComponent
   */
  public getTooltip(inputName: string): string {
    return kickStartTooltips[inputName];
  }

  /**
   * Opens a ArchiveSaveDialogComponent in a MatDialog
   *
   * @memberof KickstartFormComponent
   */
  public openSaveArchive(): void {
    const data = {
      title: 'Kickstart',
      archive: {
        comment: '',
        config_id: KICKSTART_ID,
        form: this.kickStartFormGroup.getRawValue()
      }
    };
    const callbackfn = (response) => this.archiveSrv.archiveForm2(response).subscribe(archive => archive);
    this.openDialog(ArchiveSaveDialogComponent, data, callbackfn);
  }

  /**
   * Opens FormRestoreComponent in a MatDialog
   *
   * @memberof KickstartFormComponent
   */
  public openRestore(): void {
    this.archiveSrv.getArchivedForms(KICKSTART_ID).subscribe(archives => {
      let data = {
        title: 'Kickstart',
        config_id: KICKSTART_ID,
        display_columns: ['select', 'archived_date', 'comment', 'actions'],
        archives: archives
      };
      let callbackfn = (response) => this.initKickStartForm(response[0].form);
      this.openDialog(ArchiveRestoreDialogComponent, data, callbackfn);
    });
  }

  /**
   * Executes a Kickstart Form
   *
   * @memberof KickstartFormComponent
   */
  public onSubmit(): void {
    this.loading = true;
    if (this.system_name === "DIP" || this.system_name === "GIP") {
      this.systemSetupSrv.executeKickstart(this.kickStartFormGroup);
    }

    if (this.system_name === "MIP") {
      this.systemSetupSrv.executeMIPKickstart(this.kickStartFormGroup);
    }

  }

  /**
   * Opens a MatDialog with the component and data. Will run callbackfn on close.
   *
   * @param {*} component
   * @param {*} data
   * @param {*} callbackfn
   * @memberof KickstartFormComponent
   */
  private openDialog(component, data, callbackfn?): void {
    const dialogRef = this.matDialog.open(component, { data: data });
    dialogRef.afterClosed().subscribe(result => result ? callbackfn(result) : result);
  }

  /**
   * Opens the IP Change Modal in the event we have a controller IP change detection.
   *
   * @param oldIP - The current configuration IP address.
   */
  private openIPChangedModal(oldIP: string) {
    //The kickstartfomr interface selections was refreshed before we
    //Map an old form to an exisiting one.
    let openmodal = true;
    for (let newip of this.controllers) {
      if (oldIP === newip.ip_address) {
        openmodal = false;
        break;
      }
    }
    if (openmodal) {
      let networkIP = this.default_ipv4_settings['network'];
      let netmask = this.default_ipv4_settings['netmask'];
      let newIP = this.default_ipv4_settings['address'];
      if (isIpv4InSubnet(oldIP, networkIP, netmask)) {
        this.kickStartSrv.updateKickstartCtrlIP(newIP).subscribe(data => {
          if (data !== null && data['error_message']) {
            this.snackbarWrapper.showSnackBar('Failed to update IP Address on current Kickstart page', -1, 'Close');
          } else {
            // set new ip
            const interface_controller = this.kickStartFormGroup.get('interface_controller').value as FormArray;
            interface_controller.removeAt(0);
            interface_controller.push(new FormControl(newIP));

            this.snackbarWrapper.showSnackBar('Controller IP change detected! \
            Since the old controller IP is in the same subnet as the new IP we automatically \
            changed the Kickstart data so no action is necessary.', -1, 'Dismiss');
          }
        });
      } else {
        this.kickStartSrv.archiveConfigurationsAndClear().subscribe(() => {
          this.clearKickstartFormGroup();
          this.snackbarWrapper.showSnackBar('Controller IP change detected! \
          Since the old controller IP is not in the same subnet as the new IP we automatically \
          archived your old Kickstart and Kit configurations.  You will need to setup a new DIP \
          from scratch on this new IP range.', -1, 'Dismiss');
        });
      }
    }
  }

  /**
   * sets the gateway based on controller_interface
   *
   */
  public setGateway(): void {
    let controller_interface = this.kickStartFormGroup.get('controller_interface').value[0];
    let gateway = controller_interface.split('.');
    this.kickStartFormGroup.get('gateway').setValue(`${gateway[0]}.${gateway[1]}.${gateway[2]}.1`);
    this.getAvaliableIPBlock(this.kickStartFormGroup);
    this.getOpenIP();
  }

  public setDNS(): void {
    if (this.system_name === 'MIP') {
      let controller_interface = this.kickStartFormGroup.get('controller_interface').value[0];
      let gateway = controller_interface.split('.');
      this.kickStartFormGroup.get('dns').setValue(`${gateway[0]}.${gateway[1]}.${gateway[2]}.1`);
    }
  }

  public openConsole(){
    this.systemSetupSrv.openKickstartConsole();
  }

}
