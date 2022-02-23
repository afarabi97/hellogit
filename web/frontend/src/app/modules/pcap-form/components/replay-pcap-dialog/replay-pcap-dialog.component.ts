import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';

import { HostInfoClass, HostInfoRedacClass } from '../../../../classes';
import { COMMON_VALIDATORS } from '../../../../constants/cvah.constants';
import { PcapService } from '../../../../services/pcap.service';
import { SensorHostInfoService } from '../../../../services/sensor-host-info.service';
import { SortingService } from '../../../../services/sorting.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { MatCheckboxChange } from '@angular/material/checkbox';


@Component({
  selector: 'replay-pcap-dialog',
  templateUrl: 'replay-pcap-dialog.component.html',
  styleUrls: ['replay-pcap-dialog.component.css'],
  providers: [
    SensorHostInfoService
  ]
})
export class ReplayPcapDialogComponent implements OnInit {
  selectableSensors: HostInfoRedacClass[];
  pcapForm: FormGroup;
  selectableIfaces: Array<string>;

  constructor( public dialogRef: MatDialogRef<ReplayPcapDialogComponent>,
               private formBuilder: FormBuilder,
               private sensor_host_info_service_: SensorHostInfoService,
               private pcapSrv: PcapService,
               private sortSvc: SortingService,
               @Inject(MAT_DIALOG_DATA) public pcap_name: any) {
    this.selectableSensors = [];
    this.selectableIfaces = [];
  }

  ngOnInit(){
    this.sensor_host_info_service_.get_sensor_host_info()
      .subscribe(
        (data: HostInfoClass[]) => {
          this.selectableSensors = data.map((sensor_host_info: HostInfoClass) => new HostInfoRedacClass(sensor_host_info));
          this.selectableSensors.sort(this.sortSvc.node_alphanum);
        });

    this.initializeForm();
  }

  initializeForm() {
    this.pcapForm = this.formBuilder.group({
      pcap: new FormControl(this.pcap_name),
      sensor_ip: new FormControl(undefined, Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      preserve_timestamp: new FormControl({value: true, disabled: true}),
      ifaces: new FormControl(undefined)
    });

    this.pcapForm.get('pcap').disable();
  }

  isPreserveTimestamp(): boolean {
    return this.pcapForm.get('preserve_timestamp').value;
  }

  preserveTimestamp(event: MatCheckboxChange){
    if (event.checked){
      this.pcapForm.get('ifaces').disable();
    } else {
      this.pcapForm.get('ifaces').enable();
      this.pcapForm.get('ifaces').setValidators(Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]));
    }
  }

  onSubmit() {
    for (const sensor of this.selectableSensors){
      if (sensor.management_ip === this.pcapForm.get('sensor_ip').value){
        this.pcapForm.addControl('sensor_hostname', new FormControl(sensor.hostname));
        break;
      }
    }
    this.dialogRef.close(this.pcapForm);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public getErrorMessage(control: AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  changeIfaceValues(event: MatSelectChange){
    let hostname = '';
    this.pcapForm.get('preserve_timestamp').enable();
    for (const sensor of this.selectableSensors){
      if (sensor.management_ip === event.value){
        hostname = sensor.hostname;
        break;
      }
    }

    this.pcapSrv.getConfiguredIfaces(hostname).subscribe(data => {
      this.selectableIfaces = data as Array<string>;
      if (this.selectableIfaces === null || this.selectableIfaces.length === 0){
        this.pcapSrv.displaySnackBar('You cannot replay traffic on the selected Sensor because Zeek and Suricata are not installed.  \
                                      Please go to the catalog page and install one or both applications on the desired sensor.');
      }
    });

    this.pcapForm.get('ifaces').setValue('');
  }
}
