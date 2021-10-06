import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { validateFromArray } from 'src/app/validators/generic-validators.validator';
import { addNodeValidators, kickStartTooltips } from '../validators/kit-setup-validators';
import { MIP_PXE_TYPES, COMMON_VALIDATORS } from '../../constants/cvah.constants';
import { KitSettingsService } from '../services/kit-settings.service';
import { GeneralSettings } from '../models/kit';
import { SnackbarWrapper } from '../../classes/snackbar-wrapper';
import { MatRadioChange } from '@angular/material/radio';
import { VirtualNodeFormComponent } from '../virtual-node-form/virtual-node-form.component';

export interface DeploymentOption {
  value: string;
  text: string;
}

@Component({
  selector: 'add-mip-dialog',
  templateUrl: 'add-mip-dialog.component.html',
  styleUrls: ['add-mip-dialog.component.css'],
})
export class AddMipDialogComponent implements OnInit {
  @ViewChild('virtualNodeForm') virtualNodeForm: VirtualNodeFormComponent;

  isCreateDuplicate: boolean;
  nodeForm: FormGroup;
  pxe_types: string[] = MIP_PXE_TYPES;
  availableIPs: string[] = [];
  settings: Partial<GeneralSettings> = {};

  //Validation
  validationHostnames: string[] = [];
  validationIPs: string[] = [];
  validationMacs: string[] = [];
  deploymentOptions: DeploymentOption[] = [];

  constructor( public dialogRef: MatDialogRef<AddMipDialogComponent>,
               private formBuilder: FormBuilder,
               private kitSettingsSrv: KitSettingsService,
               private snackbar: SnackbarWrapper,
               @Inject(MAT_DIALOG_DATA) public pcap_name: any) {
    //TODO pass in unused IP Addresses
    dialogRef.disableClose = true;
  }

  ngOnInit(){
    this.initializeForm();
    this.kitSettingsSrv.getGeneralSettings().subscribe((data: GeneralSettings) => {
      this.settings = data;
      this.kitSettingsSrv.getUnusedIPAddresses(this.settings.controller_interface, this.settings.netmask).subscribe((data2: string[]) => {
        this.availableIPs = data2;
      });
    });
    this.deploymentOptions.push({text: 'Baremetal', value: 'Baremetal'});
    this.deploymentOptions.push({text: 'Virtual Machine', value: 'Virtual'});
  }

  initializeForm() {
    this.updateNodeStatus();
    this.nodeForm = this.formBuilder.group({
      hostname: new FormControl(undefined, Validators.compose([validateFromArray(addNodeValidators.hostname,
        { uniqueArray: this.validationHostnames })])),
      ip_address: new FormControl(undefined, Validators.compose([validateFromArray(addNodeValidators.ip_address,
        { uniqueArray: this.validationIPs })])),
      // Baremetal form fields
      mac_address: new FormControl(undefined, Validators.compose([validateFromArray(addNodeValidators.mac_address,
        { uniqueArray: this.validationMacs })])),
      pxe_type: this.nodeForm ? this.nodeForm.value.pxe_type : new FormControl(),
      deployment_type: this.nodeForm ? this.nodeForm.value.deployment_type :
        new FormControl(undefined, Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),

      // Virtual form fields
      virtual_cpu: new FormControl(),
      virtual_mem: new FormControl(),
      virtual_os: new FormControl()
    });
  }

  isVirtualMachineDeployment(): boolean {
    if(this.nodeForm && this.nodeForm.get('deployment_type')){
      return this.nodeForm.get('deployment_type').value === 'Virtual';
    }
    return false;
  }

  isBaremetalDeployment(): boolean {
    if(this.nodeForm && this.nodeForm.get('deployment_type')){
      return this.nodeForm.get('deployment_type').value === 'Baremetal';
    }
    return false;
  }

  onDeploymentTypeChange(event: MatRadioChange){
    if (!event) {
      return;
    }

    this.updateNodeStatus();
    const mac_address = this.nodeForm.get('mac_address');
    const pxe_type = this.nodeForm.get('pxe_type');

    if (event.value === 'Baremetal'){
      mac_address.setValidators(Validators.compose([validateFromArray(addNodeValidators.mac_address,
        { uniqueArray: this.validationMacs })]));
      pxe_type.setValidators(Validators.compose([validateFromArray(addNodeValidators.pxe_type)]));
    } else {
      mac_address.setValidators(null);
      pxe_type.setValidators(null);
    }

    mac_address.updateValueAndValidity();
    pxe_type.updateValueAndValidity();

    this.virtualNodeForm.setVirtualFormValidation(event);
    this.virtualNodeForm.setDefaultValues("MIP");
  }

  updateNodeStatus() {
    const nodesHostnames = [];
    const nodesIP = [];
    const nodesMacAddress = [];

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
    if (this.isCreateDuplicate){
      this.onCreateNode();
      this.onDuplicateNode();
    } else {
      this.dialogRef.close(this.nodeForm);
    }
  }

  onCreateNode(): void {
    this.snackbar.showSnackBar(this.nodeForm.value.hostname + ' node created successfully.', -1, 'Dismiss');
    this.kitSettingsSrv.addMip(this.nodeForm.value).subscribe(data => {},
    err => {
        console.error(err);
    });
  }

  onDuplicateNode(): void {
    const prevHost = this.nodeForm.value.hostname;
    const prevIP = this.nodeForm.value.ip_address;
    let version = prevHost.match('[0-9]+$');
    const prevVirtualCpu = this.nodeForm.get('virtual_cpu').value;
    const prevVirtualMem = this.nodeForm.get('virtual_mem').value;
    const prevVirtualOS = this.nodeForm.get('virtual_os').value;
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
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public getErrorMessage(control: AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  checkDuplicate(event: MatCheckboxChange){
    this.isCreateDuplicate = event.checked;
  }

  getTooltip(inputName: string): string {
    return kickStartTooltips[inputName];
  }
}
