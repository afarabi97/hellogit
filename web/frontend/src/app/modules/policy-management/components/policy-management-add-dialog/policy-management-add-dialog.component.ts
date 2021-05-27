import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { HostInfoClass, RuleSetClass } from '../../../../classes';
import {
  MAT_SNACKBAR_CONFIGURATION_3000_DUR,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR
} from '../../../../constants/cvah.constants';
import { get_form_control_value_from_form_group } from '../../../../functions/cvah.functions';
import { MatOptionInterface } from '../../../../interfaces';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { RulesService } from '../../../../services/rules.service';
import { SensorHostInfoService } from '../../../../services/sensor-host-info.service';
import { SortingService } from '../../../../services/sorting.service';
import { CatalogStatusClass } from '../../classes';
import {
  ADD,
  ADD_RULE_SET_TITLE,
  CATALOG_STATUS_STATUS,
  CLEARANCE_LEVELS,
  EDIT,
  EDIT_RULE_SET_TITLE,
  RULE_TYPES,
  SURICATA,
  SURICATA_CAP_FIRST,
  ZEEK,
  ZEEK_CAP_FIRST,
  ZEEK_INTEL,
  ZEEK_SCRIPTS,
  ZEEK_SIGNATURES
} from '../../constants/policy-management.constant';
import { PolicyManagementService } from '../../services/policy-management.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-policy-management-add-dialog',
  templateUrl: 'policy-management-add-dialog.component.html',
  styleUrls: [
    'policy-management-add-dialog.component.scss'
  ]
})
export class PolicyManagementAddDialogComponent implements OnInit {
  // Used for displaying a title at the top of the html
  title: string = ``;
  // Used for storing sensor hostnames
  sensor_list_selection: string[];
  // Used for creating a rule set form group
  // note: sensors changed from HostInfoClass to string[] of hostnames
  rule_set_form_group: FormGroup;
  // Used for displaying selectable mat option values in html
  clearance_levels: MatOptionInterface[] = CLEARANCE_LEVELS;
  rule_types: MatOptionInterface[] = RULE_TYPES;
  // Used for storing list of sensors
  private sensor_list_: HostInfoClass[];

  /**
   * Creates an instance of PolicyManagementAddDialogComponent.
   *
   * @param {MatDialogRef<PolicyManagementAddDialogComponent>} mat_dialog_ref_
   * @param {FormBuilder} form_builder_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {RulesService} rules_service_
   * @param {SensorHostInfoService} sensor_host_info_service_
   * @param {SortingService} sorting_service_
   * @param {PolicyManagementService} policy_management_service_
   * @param {string} dialog_data
   * @memberof PolicyManagementAddDialogComponent
   */
  constructor(private mat_dialog_ref_: MatDialogRef<PolicyManagementAddDialogComponent>,
              private form_builder_: FormBuilder,
              private mat_snackbar_service_: MatSnackBarService,
              private rules_service_: RulesService,
              private sensor_host_info_service_: SensorHostInfoService,
              private sorting_service_: SortingService,
              private policy_management_service_: PolicyManagementService,
              @Inject(MAT_DIALOG_DATA) public dialog_data: string) {
    this.set_title_(dialog_data === ADD ? ADD_RULE_SET_TITLE : EDIT_RULE_SET_TITLE);
  }

  /**
   * Used to initialize data for component
   *
   * @memberof PolicyManagementAddDialogComponent
   */
  ngOnInit(): void {
    let type = SURICATA;
    if (this.dialog_data === EDIT) {
      const edit_rule_set: RuleSetClass = this.rules_service_.get_edit_rule_set();
      type = this.get_sensor_type_(edit_rule_set.appType);
      this.initialize_form_(edit_rule_set, true);
    } else {
      this.initialize_form_(null);
    }
    this.api_change_sensor_selection_(type);
  }

  /**
   * Used for sensor list based on sensor selection in html
   *
   * @param {MatSelectChange} event
   * @memberof PolicyManagementAddDialogComponent
   */
  change_sensor_list(event: MatSelectChange): void {
    const sensor_type = this.get_sensor_type_(event.value);
    this.api_change_sensor_selection_(sensor_type);
  }

  /**
   * Usedc to retrieve form group form control value
   *
   * @returns {boolean}
   * @memberof PolicyManagementAddDialogComponent
   */
  is_rule_set_enabled(): boolean {
    return get_form_control_value_from_form_group<boolean>(this.rule_set_form_group, 'isEnabled');
  }

  /**
   * Used for closing the mat dialog ref and passing a completed rule set form group back to parent component
   *
   * @memberof PolicyManagementAddDialogComponent
   */
  submit(): void {
    const sensors: string[] = get_form_control_value_from_form_group<string[]>(this.rule_set_form_group, 'sensors');
    const valuesToSendBack = [];
    for (const hostname of sensors) {
      for (const hostObj of this.sensor_list_) {
        /* istanbul ignore else */
        if (hostname === hostObj.hostname) {
          valuesToSendBack.push(hostObj);
          break;
        }
      }
    }
    this.rule_set_form_group.get('sensors').setValue(valuesToSendBack);
    this.mat_dialog_ref_.close(this.rule_set_form_group);
  }

  /**
   * Used for closing the mat dialof ref
   *
   * @memberof PolicyManagementAddDialogComponent
   */
  cancel(): void {
    this.mat_dialog_ref_.close();
  }

  /**
   * Used for setting the html title
   *
   * @private
   * @param {string} value
   * @memberof PolicyManagementAddDialogComponent
   */
  private set_title_(value: string): void {
    this.title = value;
  }

  /**
   * Used for initializing the rule set form group
   *
   * @private
   * @param {RuleSetClass} rule_set
   * @param {boolean} [is_edit=false]
   * @memberof PolicyManagementAddDialogComponent
   */
  private initialize_form_(rule_set: RuleSetClass, is_edit: boolean = false): void {
    const rule_set_form_group: FormGroup = this.form_builder_.group({
      _id: new FormControl(rule_set ? rule_set._id : '0'),
      name: new FormControl(rule_set ? rule_set.name : '', Validators.compose([Validators.required])),
      clearance: new FormControl(rule_set ? rule_set.clearance : '', Validators.compose([Validators.required])),
      sensors: new FormControl([]),
      appType: new FormControl(rule_set ? rule_set.appType : '', Validators.compose([Validators.required])),
      isEnabled: new FormControl(rule_set ? rule_set.isEnabled : true)
    });

    /* istanbul ignore else */
    if (is_edit){
      rule_set_form_group.get('appType').disable();
      const sensorHostnameValues = rule_set.sensors.map((sensor: HostInfoClass) => sensor.hostname);
      rule_set_form_group.get('sensors').setValue(sensorHostnameValues);
    }
    this.set_rule_set_form_group_(rule_set_form_group);
  }

  /**
   * Used for setting the component rule set form group with a form group
   *
   * @private
   * @param {FormGroup} form_group
   * @memberof PolicyManagementAddDialogComponent
   */
  private set_rule_set_form_group_(form_group: FormGroup): void {
    this.rule_set_form_group = form_group;
  }

  /**
   * Used for setting the component sensor list
   *
   * @private
   * @param {HostInfoClass[]} sensor_list
   * @memberof PolicyManagementAddDialogComponent
   */
  private set_sensor_list_(sensor_list: HostInfoClass[]): void {
    this.sensor_list_ = sensor_list;
  }

  /**
   * Used for setting the component sensor list selection
   *
   * @private
   * @param {string[]} sensor_list_selection
   * @memberof PolicyManagementAddDialogComponent
   */
  private set_sensor_list_selection_(sensor_list_selection: string[]): void {
    this.sensor_list_selection = sensor_list_selection;
  }

  /**
   * Used for getting the sensor type
   *
   * @private
   * @param {string} app_type
   * @returns {string}
   * @memberof PolicyManagementAddDialogComponent
   */
  private get_sensor_type_(app_type: string): string {
    if (app_type === SURICATA_CAP_FIRST) {
      return SURICATA;
    } else if (app_type === ZEEK_CAP_FIRST) {
      return ZEEK;
    } else if ([ZEEK_SCRIPTS, ZEEK_INTEL, ZEEK_SIGNATURES].includes(app_type)) {
      return ZEEK;
    } else {
      return '';
    }
  }

  /**
   * Used for making api rest call to get sensor host info
   *
   * @private
   * @param {string} [application=SURICATA]
   * @memberof PolicyManagementAddDialogComponent
   */
  private api_change_sensor_selection_(application: string = SURICATA): void {
    this.sensor_host_info_service_.get_sensor_host_info()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: HostInfoClass[]) => {
          this.set_sensor_list_(response);
          this.set_sensor_list_selection_([]);
          this.api_catalog_status_(application, this.sensor_list_selection);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving sensor host info';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_3000_DUR);
        });
  }

  /**
   * Used for making api rest call to get catalog status
   *
   * @private
   * @param {string} application
   * @param {string[]} sensor_list_selection
   * @memberof PolicyManagementAddDialogComponent
   */
  private api_catalog_status_(application: string, sensor_list_selection: string[]): void {
    this.policy_management_service_.check_catalog_status(application)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: CatalogStatusClass[]) => {
          const response_sensor_list: string[] = response.filter((s) => s.status === CATALOG_STATUS_STATUS)
                                               .map((f) => f.hostname);
          sensor_list_selection = [...sensor_list_selection, ...response_sensor_list];
          if (sensor_list_selection.length === 0) {
            const message: string = `No sensors have ${application} installed. To fix this go to the catalog page and install the desired application.`;
            this.mat_snackbar_service_.displaySnackBar(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            sensor_list_selection.sort(this.sorting_service_.alphanum);
          }
          this.set_sensor_list_selection_(sensor_list_selection);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving catalog status';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_3000_DUR);
        });
  }
}
