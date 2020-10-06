import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSelectChange } from '@angular/material';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { PolicyManagementService } from '../../policy-management/services/policy-management.service';
import { PcapService } from '../pcap.service';
import { HostInfo } from '../../policy-management/interface/rule.interface';
import { COMMON_VALIDATORS } from 'src/app/frontend-constants';
import { validateFromArray } from 'src/app/validators/generic-validators.validator';
import { SortingService } from '../../services/sorting.service';

@Component({
  selector: 'replay-pcap-dialog',
  templateUrl: 'replay-pcap-dialog.component.html',
  styleUrls: ['replay-pcap-dialog.component.css'],
})
export class ReplayPcapDialog implements OnInit {
  selectableSensors: Array<{ hostname: string, management_ip: string }>;
  pcapForm: FormGroup;
  selectableIfaces: Array<string>;

  constructor( public dialogRef: MatDialogRef<ReplayPcapDialog>,
               private formBuilder: FormBuilder,
               private policySrv: PolicyManagementService,
               private pcapSrv: PcapService,
               private sortSvc: SortingService,
               @Inject(MAT_DIALOG_DATA) public pcap_name: any) {
    this.selectableSensors = [];
    this.selectableIfaces = [];
  }

  ngOnInit(){
    this.policySrv.getSensorHostInfo().subscribe(data => {
      let hosts = data as Array<HostInfo>;
      this.selectableSensors = [];
      for (let host of hosts) {
        this.selectableSensors.push({hostname: host.hostname, management_ip: host.management_ip});
      }
      this.selectableSensors.sort(this.sortSvc.node_alphanum);
    });

    this.initializeForm();
  }

  initializeForm() {
    this.pcapForm = this.formBuilder.group({
      pcap: new FormControl(this.pcap_name),
      sensor: new FormControl(undefined, Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      ifaces: new FormControl(undefined, Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]))
    });

    this.pcapForm.get('pcap').disable();
  }

  onSubmit() {
    this.dialogRef.close(this.pcapForm);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public getErrorMessage(control: AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  changeIfaceValues(event: MatSelectChange){
    let hostname = "";
    for (let sensor of this.selectableSensors){
      if (sensor.management_ip === event.value){
        hostname = sensor.hostname;
        break;
      }
    }

    this.pcapSrv.getConfiguredIfaces(hostname).subscribe(data => {
      this.selectableIfaces = data as Array<string>;
      if (this.selectableIfaces === null || this.selectableIfaces.length === 0){
        this.pcapSrv.displaySnackBar("You cannot replay traffic on the selected Sensor because Zeek and Suricata are not installed.  \
                                      Please go to the catalog page and install one or both applications on the desired sensor.");
      }
    });

    this.pcapForm.get('ifaces').setValue('');
  }
}
