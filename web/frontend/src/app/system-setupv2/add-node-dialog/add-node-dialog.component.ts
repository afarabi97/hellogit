import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { COMMON_VALIDATORS } from 'src/app/frontend-constants';
import { validateFromArray } from 'src/app/validators/generic-validators.validator';
import { addNodeValidators, kickStartTooltips } from '../validators/kit-setup-validators'
import { PXE_TYPES } from '../../frontend-constants';
import { KitSettingsService } from '../services/kit-settings.service';
import { Settings, GeneralSettings } from '../models/kit';
import { SnackbarWrapper } from '../../classes/snackbar-wrapper';

export interface DeploymentOption {
  value: string;
  text: string;
}

@Component({
  selector: 'add-node-dialog',
  templateUrl: 'add-node-dialog.component.html',
  styleUrls: ['add-node-dialog.component.css'],
})
export class AddNodeDialog implements OnInit {
  isRaid: boolean;
  isNodeType: boolean;
  isCreateDuplicate: boolean;
  nodeForm: FormGroup;
  deploymentOptions: DeploymentOption[];
  pxe_types: string[] = PXE_TYPES;
  availableIPs: string[] = [];
  settings: Partial<GeneralSettings> = {};
  //Validation
  validationHostnames: string[] = [];
  validationIPs: string[] = [];
  validationMacs: string[] = [];

  constructor( public dialogRef: MatDialogRef<AddNodeDialog>,
               private formBuilder: FormBuilder,
               private kitSettingsSrv: KitSettingsService,
               private snackbar: SnackbarWrapper,
               @Inject(MAT_DIALOG_DATA) public pcap_name: any) {
    //TODO pass in unused IP Addresses
    this.isRaid = false;
    this.isNodeType = false;
    dialogRef.disableClose = true;
  }

  ngOnInit(){
    this.initializeForm();
    this.kitSettingsSrv.getGeneralSettings().subscribe((data: GeneralSettings) => {
      this.settings = data;
      this.kitSettingsSrv.getUnusedIPAddresses(this.settings.controller_interface, this.settings.netmask).subscribe((data: string[]) => {
        this.availableIPs = data;
      });
    });
  }

  initializeForm() {
    this.updateNodeStatus();
    this.nodeForm = this.formBuilder.group({
      hostname: new FormControl(undefined, Validators.compose([validateFromArray(addNodeValidators.hostname,
        { uniqueArray: this.validationHostnames })])),
      ip_address: new FormControl(undefined, Validators.compose([validateFromArray(addNodeValidators.ip_address,
        { uniqueArray: this.validationIPs })])),
      node_type: this.nodeForm ? this.nodeForm.value.node_type :
        new FormControl(undefined, Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      deployment_type: this.nodeForm ? this.nodeForm.value.deployment_type :
        new FormControl(undefined, Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      // Baremetal form fields
      mac_address: new FormControl(),
      data_drives: new FormControl('sdb'),
      boot_drives: new FormControl('sda'),
      raid_drives: new FormControl('sda,sdb'),
      os_raid: new FormControl(false),
      os_raid_root_size: new FormControl(50),
      pxe_type: this.nodeForm ? this.nodeForm.value.pxe_type : new FormControl()
    });
  }

  updateNodeStatus() {
    var nodesHostnames = [];
    var nodesIP = [];
    var nodesMacAddress = [];

    this.kitSettingsSrv.getNodes().subscribe((data: Node[]) => {
      for (var node of data){
        nodesHostnames.push(node['hostname'].split('.')[0]);
        nodesIP.push(node['ip_address']);
        nodesMacAddress.push(node['mac_address']);
      }
    });
    this.validationHostnames = nodesHostnames;
    this.validationIPs = nodesIP;
    this.validationMacs = nodesMacAddress;
  }

  onSubmit() {
    if (this.isCreateDuplicate){
      this.onCreateNode();
      this.onDuplicateNode();
    } else {
      this.dialogRef.close(this.nodeForm);
    }
  }

  onCreateNode(): void {
    console.log(this.nodeForm.value);
    this.snackbar.showSnackBar(this.nodeForm.value.hostname + ' node created successfully.', -1, 'Dismiss');
    this.kitSettingsSrv.addNode(this.nodeForm.value).subscribe(data => {})
    err => {
        console.error(err);
    };
  }

  onDuplicateNode(): void {
    var prevHost = this.nodeForm.value.hostname;
    var prevIP = this.nodeForm.value.ip_address;
    var version = prevHost.match('[0-9]+$');
    this.initializeForm();

    if (version){
      var hostname = prevHost.substr(0, prevHost.length - version[0].length);
      version = parseInt(version[0], 10);
      version++;
      this.nodeForm.get('hostname').setValue(hostname + version);
    } else {
      this.nodeForm.get('hostname').setValue(prevHost + '1');
    }

    var newIP;
    for (var ip in this.availableIPs){
      if (this.availableIPs[ip] === prevIP){
        newIP = this.availableIPs[parseInt(ip)+1];
        if (!newIP || (newIP.split('.'))[3] === '255')
          newIP = this.availableIPs.shift();
      }
    }
    this.nodeForm.get('ip_address').setValue(newIP);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onNodeTypeChange(event: MatRadioChange){
    if (!event)
      return;

    if (!this.isNodeType && (event.value === "Server" || event.value === "Sensor" || event.value === "Service"))
      this.isNodeType = true;


    //this.nodeForm.get('deployment_type').setValue("");
    this.deploymentOptions = [];
    if (event.value === "Server"){
      this.deploymentOptions.push({text: "Baremetal", value: "Baremetal"})
      this.deploymentOptions.push({text: "Virtual Machine", value: "Virtual"})
    } else if (event.value === "Sensor"){
      this.deploymentOptions.push({text: "Baremetal", value: "Baremetal"})
      this.deploymentOptions.push({text: "Virtual Machine", value: "Virtual"})
      this.deploymentOptions.push({text: "ISO Remote Sensor Download", value: "Iso"})
    } else if (event.value === "Service"){
      this.deploymentOptions.push({text: "Baremetal", value: "Baremetal"})
      this.deploymentOptions.push({text: "Virtual Machine", value: "Virtual"})
    }
  }

  onDeploymentTypeChange(event: MatRadioChange){
    if (!event)
      return;

    this.updateNodeStatus();
    const mac_address = this.nodeForm.get('mac_address');
    const data_drives = this.nodeForm.get('data_drives');
    const boot_drives = this.nodeForm.get('boot_drives');
    const pxe_type = this.nodeForm.get('pxe_type');
    const raid_drives = this.nodeForm.get('raid_drives');
    // const os_raid_root_size = this.nodeForm.get('os_raid_root_size');

    if (event.value === "Baremetal"){
      mac_address.setValidators(Validators.compose([validateFromArray(addNodeValidators.mac_address,
        { uniqueArray: this.validationMacs })]));
      data_drives.setValidators(Validators.compose([validateFromArray(addNodeValidators.data_drives)]));
      boot_drives.setValidators(Validators.compose([validateFromArray(addNodeValidators.boot_drives)]));
      pxe_type.setValidators(Validators.compose([validateFromArray(addNodeValidators.pxe_type)]));
      raid_drives.setValidators(Validators.compose([validateFromArray(addNodeValidators.raid_drives)]));
      // os_raid_root_size.setValidators(Validators.compose([validateFromArray(addNodeValidators.os_raid_root_size)]));
    } else {
      mac_address.setValidators(null);
      data_drives.setValidators(null);
      boot_drives.setValidators(null);
      pxe_type.setValidators(null);
      raid_drives.setValidators(null);
      // os_raid_root_size.setValidators(null);
    }

    mac_address.updateValueAndValidity();
    data_drives.updateValueAndValidity();
    boot_drives.updateValueAndValidity();
    pxe_type.updateValueAndValidity();
    raid_drives.updateValueAndValidity();
    // os_raid_root_size.updateValueAndValidity();
  }

  isBaremetalDeployment(): boolean {
    if(this.nodeForm && this.nodeForm.get('deployment_type')){
      return this.nodeForm.get('deployment_type').value === "Baremetal";
    }
    return false;
  }

  isVirtualMachineDeployment(): boolean {
    if(this.nodeForm && this.nodeForm.get('deployment_type')){
      return this.nodeForm.get('deployment_type').value === "Virtual";
    }
    return false;
  }

  isISOSensorDeployment(): boolean {
    if(this.nodeForm && this.nodeForm.get('deployment_type')){
      return this.nodeForm.get('deployment_type').value === "Iso";
    }
    return false;
  }

  public getErrorMessage(control: AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  checkRaidChanged(event: MatCheckboxChange){
    const checked: boolean = event.checked;
    const boot_drives = this.nodeForm.get('boot_drives');
    const data_drives = this.nodeForm.get('data_drives');
    const raid_drive = this.nodeForm.get('raid_drives');
    const os_raid_root_size = this.nodeForm.get('os_raid_root_size');
    if (checked){
      this.isRaid = true;
      data_drives.disable();
      boot_drives.disable();
      raid_drive.enable();
      os_raid_root_size.enable();
    } else {
      this.isRaid = false;
      data_drives.enable();
      boot_drives.enable();
      raid_drive.disable();
      os_raid_root_size.disable();
    }
  }

  checkDuplicate(event: MatCheckboxChange){
    this.isCreateDuplicate = event.checked;
  }


  getTooltip(inputName: string): string {
    return kickStartTooltips[inputName];
  }
}
