import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';

import { ErrorMessageClass, HostInfoClass, HostInfoRedacClass } from '../../../../classes';
import { COMMON_VALIDATORS, MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { CatalogService } from '../../../../services/catalog.service';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { SensorHostInfoService } from '../../../../services/sensor-host-info.service';
import { SortingService } from '../../../../services/sorting.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';

/**
 * Component used for displaying dialog window to run replay pcap
 *
 * @export
 * @class ReplayPcapDialogComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'cvah-replay-pcap-dialog',
  templateUrl: 'replay-pcap-dialog.component.html'
})
export class ReplayPcapDialogComponent implements OnInit {
  // Used for obtaining user input
  pcap_form_group: FormGroup;
  // Used for holding array of selecatble sensors
  selectable_sensors: HostInfoRedacClass[];
  // Used for holding array of selecatble ifaces
  selectable_ifaces: string[];

  /**
   * Creates an instance of ReplayPcapDialogComponent.
   *
   * @param {MatDialogRef<ReplayPcapDialogComponent>} mat_dialog_ref_
   * @param {FormBuilder} form_builder_
   * @param {SensorHostInfoService} sensor_host_info_service_
   * @param {CatalogService} catalog_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {SortingService} sort_service_
   * @param {string} pcap_name_
   * @memberof ReplayPcapDialogComponent
   */
  constructor(private mat_dialog_ref_: MatDialogRef<ReplayPcapDialogComponent>,
              private form_builder_: FormBuilder,
              private sensor_host_info_service_: SensorHostInfoService,
              private catalog_service_: CatalogService,
              private mat_snackbar_service_: MatSnackBarService,
              private sort_service_: SortingService,
              @Inject(MAT_DIALOG_DATA) private pcap_name_: string) {
    this.selectable_sensors = [];
    this.selectable_ifaces = [];
  }

  /**
   * Used for setting up subscriptions
   *
   * @memberof ReplayPcapDialogComponent
   */
  ngOnInit(): void {
    this.api_get_sensor_host_info_();
    this.initialize_pcap_form_group_();
  }

  /**
   * Used for returning pcap_form_group.preserve_timestamp value
   *
   * @return {boolean}
   * @memberof ReplayPcapDialogComponent
   */
  should_preserve_timestamp(): boolean {
    return this.pcap_form_group.controls['preserve_timestamp'].value;
  }

  /**
   * Used for changing pcap_form_group.ifaces state
   *
   * @param {MatCheckboxChange} event
   * @memberof ReplayPcapDialogComponent
   */
  change_preserve_timestamp(event: MatCheckboxChange): void {
    if (event.checked) {
      this.pcap_form_group.controls['ifaces'].disable();
    } else {
      this.pcap_form_group.controls['ifaces'].enable();
      this.pcap_form_group.controls['ifaces'].clearValidators();
      this.pcap_form_group.controls['ifaces'].setValidators(Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]));
    }
  }

  /**
   * Used for retrieving error message for a form control
   *
   * @param {AbstractControl} control
   * @return {string}
   * @memberof ReplayPcapDialogComponent
   */
  get_error_message(control: AbstractControl): string {
    return control.errors && control.errors.error_message ? control.errors.error_message : '';
  }

  /**
   * Used for making changes to pcap_form_group when a sensor hostname selection has changed
   *
   * @param {MatSelectChange} event
   * @memberof ReplayPcapDialogComponent
   */
  selection_change_iface_value(event: MatSelectChange): void {
    this.pcap_form_group.controls['preserve_timestamp'].enable();
    for (const sensor of this.selectable_sensors) {
      /* istanbul ignore else */
      if (sensor.management_ip === event.value) {
        this.api_get_configured_ifaces_(sensor.hostname);
        break;
      }
    }

    this.pcap_form_group.controls['ifaces'].setValue('');
  }

  /**
   * Used for sending pcap_form_group back to parent on dialog window close
   *
   * @memberof ReplayPcapDialogComponent
   */
  execute(): void {
    for (const sensor of this.selectable_sensors) {
      /* istanbul ignore else */
      if (sensor.management_ip === this.pcap_form_group.controls['sensor_ip'].value) {
        this.pcap_form_group.addControl('sensor_hostname', new FormControl(sensor.hostname));
        break;
      }
    }
    this.mat_dialog_ref_.close(this.pcap_form_group);
  }

  /**
   * Used for canceling replay pcap setup and closing the dialog window
   *
   * @memberof ReplayPcapDialogComponent
   */
  cancel(): void {
    this.mat_dialog_ref_.close();
  }

  /**
   * Used for creating the inital pcap_form_group
   *
   * @private
   * @memberof ReplayPcapDialogComponent
   */
  private initialize_pcap_form_group_(): void {
    const pcap_form_group: FormGroup = this.form_builder_.group({
      pcap: new FormControl({ value: this.pcap_name_, disabled: true }),
      sensor_ip: new FormControl(undefined, Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      preserve_timestamp: new FormControl({ value: true, disabled: true }),
      ifaces: new FormControl(undefined)
    });

    this.set_pcap_form_group_(pcap_form_group);
  }

  /**
   * Used for setting the initial form group to pcap_form_group
   *
   * @private
   * @param {FormGroup} pcap_form_group
   * @memberof ReplayPcapDialogComponent
   */
  private set_pcap_form_group_(pcap_form_group: FormGroup): void {
    this.pcap_form_group = pcap_form_group;
  }

  /**
   * Used for making api rest call to get configured ifaces
   *
   * @private
   * @param {string} hostname
   * @memberof ReplayPcapDialogComponent
   */
  private api_get_configured_ifaces_(hostname: string): void {
    this.catalog_service_.get_configured_ifaces(hostname)
      .subscribe(
        (response: string[]) => {
          this.selectable_ifaces = response;
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving configured ifaces';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get sensor host info
   *
   * @private
   * @memberof ReplayPcapDialogComponent
   */
  private api_get_sensor_host_info_(): void {
    this.sensor_host_info_service_.get_sensor_host_info()
      .subscribe(
        (response: HostInfoClass[]) => {
          this.selectable_sensors = response.map((host_info: HostInfoClass) => new HostInfoRedacClass(host_info));
          this.selectable_sensors.sort(this.sort_service_.node_alphanum);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving sensor host info';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}
