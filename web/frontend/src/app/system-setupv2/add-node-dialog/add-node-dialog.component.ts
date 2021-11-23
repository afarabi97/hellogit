import { Component, Inject, OnInit, ViewChild  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { COMMON_VALIDATORS, PXE_TYPES } from '../../constants/cvah.constants';
import { validateFromArray } from 'src/app/validators/generic-validators.validator';
import { addNodeValidators, kickStartTooltips } from '../validators/kit-setup-validators';
import { KitSettingsService } from '../services/kit-settings.service';
import { GeneralSettings, KitStatus } from '../models/kit';
import { SnackbarWrapper } from '../../classes/snackbar-wrapper';
import { VirtualNodeFormComponent } from '../virtual-node-form/virtual-node-form.component';

export interface DeploymentOption {
  value: string;
  text: string;
  disabled: boolean;
}

@Component({
  selector: 'add-node-dialog',
  templateUrl: 'add-node-dialog.component.html',
  styleUrls: ['add-node-dialog.component.css'],
})
export class AddNodeDialogComponent implements OnInit {
  @ViewChild('virtualNodeForm') virtualNodeForm: VirtualNodeFormComponent;
  isRaid: boolean;
  isNodeType: boolean;
  isCreateDuplicate: boolean;
  nodeForm: FormGroup;
  deploymentOptions: DeploymentOption[];
  kitStatus: Partial<KitStatus> = {};
  pxe_types: string[] = PXE_TYPES;
  availableIPs: string[] = [];
  settings: Partial<GeneralSettings> = {};
  nodeType: string;

  //Validation
  validationHostnames: string[] = [];
  validationIPs: string[] = [];
  validationMacs: string[] = [];
  constructor( public dialogRef: MatDialogRef<AddNodeDialogComponent>,
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
      pxe_type: this.nodeForm ? this.nodeForm.value.pxe_type : new FormControl(),

      // Virtual form fields
      virtual_cpu: new FormControl(),
      virtual_mem: new FormControl(),
      virtual_os: new FormControl(),
      virtual_data: new FormControl(),
    });
  }

  updateNodeStatus() {
    const nodesHostnames = [];
    const nodesIP = [];
    const nodesMacAddress = [];

    this.kitSettingsSrv.getKitStatus().subscribe(data => {
      this.kitStatus = data;
    });

    this.kitSettingsSrv.getGeneralSettings().subscribe((data: GeneralSettings) => {
      this.settings = data;
      this.kitSettingsSrv.getUnusedIPAddresses(this.settings.controller_interface, this.settings.netmask).subscribe((data2: string[]) => {
        this.availableIPs = data2;
      });
      this.kitSettingsSrv.getUsedIPAddresses(this.settings.controller_interface, this.settings.netmask).subscribe((data2: string[]) => {
        for (const d of data2){
          nodesIP.push(d);
        }
      });
    });

    this.kitSettingsSrv.getNodes().subscribe((data: Node[]) => {
      for (const node of data){
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
    this.onCreateNode();
  }

  onCreateNode(): void {
    this.kitSettingsSrv.addNode(this.nodeForm.value).subscribe(data => {
      this.snackbar.showSnackBar(this.nodeForm.value.hostname + ' node created successfully.', -1, 'Dismiss');
      if (this.isCreateDuplicate) {
        this.onDuplicateNode();
      } else {
        this.dialogRef.close();
      }
    },
    err => {
      this.snackbar.showSnackBar(err.error["post_validation"], -1, 'Dismiss');
        console.error(err);
    });
  }

  onDuplicateNode(): void {
    const prevHost = this.nodeForm.value.hostname;
    const prevIP = this.nodeForm.value.ip_address;
    const prevVirtualCpu = this.nodeForm.get('virtual_cpu').value;
    const prevVirtualMem = this.nodeForm.get('virtual_mem').value;
    const prevVirtualOS = this.nodeForm.get('virtual_os').value;
    const prevVirtualData = this.nodeForm.get('virtual_data').value;
    let version = prevHost.match('[0-9]+$');
    this.initializeForm();

    if (version){
      const hostname = prevHost.substr(0, prevHost.length - version[0].length);
      version = parseInt(version[0], 10);
      version++;
      this.nodeForm.get('hostname').setValue(hostname + version);
    } else {
      this.nodeForm.get('hostname').setValue(prevHost + '1');
    }

    let newIP;
    for (const ip in this.availableIPs){
      if (this.availableIPs[ip] === prevIP){
        newIP = this.availableIPs[parseInt(ip, 10)+1];
        if (!newIP || (newIP.split('.'))[3] === '255') {
          newIP = this.availableIPs.shift();
        }
      }
    }
    this.nodeForm.get('ip_address').setValue(newIP);

    this.nodeForm.get('virtual_cpu').setValue(prevVirtualCpu);
    this.nodeForm.get('virtual_mem').setValue(prevVirtualMem);
    this.nodeForm.get('virtual_os').setValue(prevVirtualOS);
    this.nodeForm.get('virtual_data').setValue(prevVirtualData);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onNodeTypeChange(event: MatRadioChange){
    if (!event) {
      return;
    }

    if (event.value === 'Server' || event.value === 'Sensor' || event.value === 'Service') {
      this.nodeType = event.value;
      this.isNodeType = true;
    }

    this.deploymentOptions = [];
    this.deploymentOptions.push({text: 'Baremetal', value: 'Baremetal', disabled: false});
    if(this.kitStatus.esxi_settings_configured){
      this.deploymentOptions.push({text: 'Virtual Machine', value: 'Virtual', disabled: false});
    }
    else{
      this.deploymentOptions.push({text: 'Virtual Machine', value: 'Virtual', disabled: true});
    }
    if (event.value === 'Sensor'){
      this.deploymentOptions.push({text: 'ISO Remote Sensor Download', value: 'Iso', disabled: false});
    }
    this.virtualNodeForm.setDefaultValues(this.nodeType);
  }

  setBaremetalValidation(event: MatRadioChange){
    if (!event) {
      return;
    }

    this.updateNodeStatus();
    const mac_address = this.nodeForm.get('mac_address');
    const data_drives = this.nodeForm.get('data_drives');
    const boot_drives = this.nodeForm.get('boot_drives');
    const pxe_type = this.nodeForm.get('pxe_type');
    const raid_drives = this.nodeForm.get('raid_drives');

    if (event.value === 'Baremetal'){
      mac_address.setValidators(Validators.compose([validateFromArray(addNodeValidators.mac_address,
        { uniqueArray: this.validationMacs })]));
      data_drives.setValidators(Validators.compose([validateFromArray(addNodeValidators.data_drives)]));
      boot_drives.setValidators(Validators.compose([validateFromArray(addNodeValidators.boot_drives)]));
      pxe_type.setValidators(Validators.compose([validateFromArray(addNodeValidators.pxe_type)]));
      raid_drives.setValidators(Validators.compose([validateFromArray(addNodeValidators.raid_drives)]));
    } else {
      mac_address.setValidators(null);
      data_drives.setValidators(null);
      boot_drives.setValidators(null);
      pxe_type.setValidators(null);
      raid_drives.setValidators(null);
    }

    mac_address.updateValueAndValidity();
    data_drives.updateValueAndValidity();
    boot_drives.updateValueAndValidity();
    pxe_type.updateValueAndValidity();
    raid_drives.updateValueAndValidity();
  }

  onDeploymentTypeChange(event: MatRadioChange){
    if (!event) {
      return;
    }

    this.updateNodeStatus();
    this.setBaremetalValidation(event);
    this.virtualNodeForm.setDefaultValues(this.nodeType);
    this.virtualNodeForm.setVirtualFormValidation(event);
  }

  isBaremetalDeployment(): boolean {
    if(this.nodeForm && this.nodeForm.get('deployment_type')){
      return this.nodeForm.get('deployment_type').value === 'Baremetal';
    }
    return false;
  }

  isVirtualMachineDeployment(): boolean {
    if(this.nodeForm && this.nodeForm.get('deployment_type')){
      return this.nodeForm.get('deployment_type').value === 'Virtual';
    }
    return false;
  }

  isISOSensorDeployment(): boolean {
    if(this.nodeForm && this.nodeForm.get('deployment_type')){
      return this.nodeForm.get('deployment_type').value === 'Iso';
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
