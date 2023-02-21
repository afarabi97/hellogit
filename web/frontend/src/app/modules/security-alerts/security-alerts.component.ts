import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import {
  DialogFormControlClass,
  DialogFormControlConfigClass,
  ErrorMessageClass,
  ObjectUtilitiesClass,
  PortalLinkClass
} from '../../classes';
import {
  CANCEL_DIALOG_OPTION,
  CONFIRM_DIALOG_OPTION,
  DIALOG_WIDTH_1000PX,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR,
  SAVE_DIALOG_OPTION,
  TRUE
} from '../../constants/cvah.constants';
import { DialogControlTypesEnum } from '../../enums/dialog-control-types.enum';
import { ConfirmDialogMatDialogDataInterface } from '../../interfaces';
import { CookieService } from '../../services/cookies.service';
import { GlobalHiveSettingsService } from '../../services/global-hive-settings.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { PortalService } from '../../services/portal.service';
import { WindowsRedirectHandlerService } from '../../services/windows_redirect_handler.service';
import { ConfirmDialogComponent } from '../global-components/components/confirm-dialog/confirm-dialog.component';
import { ModalDialogMatComponent } from '../global-components/components/modal-dialog-mat/modal-dialog-mat.component';
import { AlertListClass, ModifyRemoveReturnClass } from './classes';
import { AlertDrillDownDialogComponent } from './components/alert-drilldown-dialog/alert-drilldown-dialog.component';
import {
  ACKNOWLEDGE_ALERTS_WINDOW_TITLE,
  ACTIONS_COLUMN_NAME,
  ALERT_KIND,
  ALERT_LIST_FAILED,
  ALL_COLUMNS_START_VALUES,
  ARKIME,
  ARKIME_FIELD_LOOKUP,
  ARKIME_NOT_INSTALLED,
  AUTO_REFRESH_COOKIE,
  COUNT_COLUMN_NAME,
  DAYS,
  DYNAMIC_COLUMNS_COOKIE,
  DYNAMIC_COLUMNS_DEFAULT_VALUES,
  ENDGAME_MODULE,
  ESCALATE_ALERTS_WINDOW_TITLE,
  EVENT_DECRIPTION_CONFIG_LABEL,
  EVENT_DECRIPTION_CONFIG_TOOLTIP,
  EVENT_SEVERITY_CONFIG_LABEL,
  EVENT_SEVERITY_CONFIG_TOOLTIP,
  EVENT_TAGS_CONFIG_LABEL,
  EVENT_TAGS_CONFIG_TOOLTIP,
  EVENT_TITLE_CONFIG_LABEL,
  EVENT_TITLE_CONFIG_TOOLTIP,
  FORM_COLUMN_NAME,
  HIVE,
  HIVE_NOT_CONFIGURED,
  HIVE_ORG_ADMIN_TEXT,
  HOURS,
  KIBANA,
  KIBANA_DETECTIONS_PAGE,
  KIBANA_HOSTS_ALERTS_PAGE,
  KIBANA_NETWORK_EXTERNAL_PAGE,
  LINKS_COLUMN_NAME,
  MINUTES,
  MODIFY_API_SWITCH,
  NA,
  NA_FAILED_ARKIME_NOT_INSTALLED,
  REMOVE_ALERTS_WINDOW_TITLE,
  REMOVE_API_SWITCH,
  RULE_NAME_COLUMN_NAME,
  SECURITY_ALERTS_COMPONENT_TITLE,
  SIGNAL_KIND,
  START_DATE_TIME_LARGE,
  SURICATA_MODULE,
  SYSMON_MODULE,
  SYSTEM_MODULE,
  TIME_FORM_GROUP_COOKIE,
  TIMESTAMP_SOURCE,
  UNACKNOWLEDGED_ALERTS_WINDOW_TITLE,
  ZEEK_MODULE
} from './constants/security-alerts.constant';
import { AlertFormInterface, ForkJoinHiveSettingsAndAlertListInterface, HiveFormInterface } from './interfaces';
import { AlertService } from './services/alerts.service';

/**
 * Component used for security alert viewing and pivoting
 *
 * @export
 * @class SecurityAlertsComponent
 * @implements {OnInit}
 * @implements {AfterViewInit}
 * @implements {OnChanges}
 * @implements {OnDestroy}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-security-alerts',
  templateUrl: './security-alerts.component.html',
  styleUrls: ['./security-alerts.component.scss']
})
export class SecurityAlertsComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  // Used for accessing the view child element for the table dialog paginator
  @ViewChild('paginator') private paginator_: MatPaginator;
  // Used for accessing the view child element for the table mat sort
  @ViewChild(MatSort) private mat_sort_: MatSort;
  // Used for accessing the autocomplete input value
  @ViewChild('groupByInput') private group_by_input_: ElementRef<HTMLInputElement>;
  // Used for passing readony values for component and html
  readonly acknowledged: string = 'acknowledged';
  readonly escalated: string = 'escalated';
  readonly show_closed: string = 'showClosed';
  readonly time_interval: string = 'timeInterval';
  readonly time_amount: string = 'timeAmount';
  readonly start_date_time: string = 'startDatetime';
  readonly end_date_time: string = 'endDatetime';
  readonly absolute_time: string = 'absoluteTime';
  // Used for passing data and other feed back to table data source
  update_alerts_mat_table_data_source: MatTableDataSource<Object>;
  // Used for turning on and off auto refresh for alerts
  auto_refresh: boolean;
  // Used for mat chip options
  selectable: boolean;
  removable: boolean;
  // Used for passing key codes for a seperator
  seperator_key_codes: number[];
  // Used for passing a form control to html for chip autocomplete
  group_by_control: FormControl;
  // Used for filtering chip fields based on the autocomplete input value
  filtered_groups: Observable<string[]>;
  // Used for keeping track of all dynamic columns
  dynamic_columns: string[];
  // Used for keeping track of all columns
  all_columns: string[];
  // Used for passing time form group so that different alerts can be shown based on time
  time_form_group: FormGroup;
  // Used for storing all chip field values
  private all_chip_options_: string[] = [];
  // Used for storing the list of portal links
  private portal_links_: PortalLinkClass[];
  // Used for storing interval so that it can be cleared with ngOnDestory
  private alert_interval_: any;

  /**
   * Creates an instance of SecurityAlertsComponent.
   *
   * @param {Title} title
   * @param {FormBuilder} form_builder_
   * @param {MatDialog} mat_dialog_
   * @param {CookieService} cookie_service_
   * @param {GlobalHiveSettingsService} global_hive_settings_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {PortalService} portal_service_
   * @param {WindowsRedirectHandlerService} windows_redirect_handler_service_
   * @param {AlertService} alert_service_
   * @memberof SecurityAlertsComponent
   */
  constructor(private title: Title,
              private form_builder_: FormBuilder,
              private mat_dialog_: MatDialog,
              private cookie_service_: CookieService,
              private global_hive_settings_service_: GlobalHiveSettingsService,
              private mat_snackbar_service_: MatSnackBarService,
              private portal_service_: PortalService,
              private windows_redirect_handler_service_: WindowsRedirectHandlerService,
              private alert_service_: AlertService) {
    this.selectable = true;
    this.removable = true;
    this.update_alerts_mat_table_data_source = new MatTableDataSource();
    this.seperator_key_codes = [ENTER, COMMA];
    this.group_by_control = new FormControl('');
    this.portal_links_ = [];
    this.filtered_groups = this.group_by_control.valueChanges
                                                .pipe(startWith(<string>null),
                                                      map((option: string) => option ? this.filter_chip_options_(option) : this.all_chip_options_.slice()));
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof SecurityAlertsComponent
   */
  ngOnInit(): void {
    this.title.setTitle(SECURITY_ALERTS_COMPONENT_TITLE);
    this.initialize_time_form_group_();
    this.get_auto_refresh_();
    this.get_dynamic_columns_();
    this.update_alerts_table_();
    this.api_get_fields_();
    this.api_get_portal_links_();

    this.alert_interval_ = setInterval(() => {
      /* istanbul ignore else */
      if (this.auto_refresh) {
        this.update_alerts_table_();
      }
    }, 15000);
  }

  /**
   * Used for making call to set paginator after the html view initialized
   *
   * @memberof SecurityAlertsComponent
   */
  ngAfterViewInit(): void {
    this.set_mat_table_paginator_and_sort_();
  }

  /**
   * Used for updating table source with needed dataa and paginator when changes occur
   *
   * @memberof SecurityAlertsComponent
   */
  ngOnChanges(): void {
    this.update_alerts_mat_table_data_source = new MatTableDataSource(this.update_alerts_mat_table_data_source.data);
    this.set_mat_table_paginator_and_sort_();
  }

  /**
   * Used for saving any cookies and clearing interval before the component is destroyed / closed
   *
   * @memberof SecurityAlertsComponent
   */
  ngOnDestroy(): void {
    this.save_cookies_();
    clearInterval(this.alert_interval_);
  }

  /**
   * Used for toggling the auto refresh value
   *
   * @memberof SecurityAlertsComponent
   */
  toggle_auto_refresh(): void {
    this.auto_refresh = !this.auto_refresh;
  }

  /**
   * Used for refreshing alerts
   *
   * @memberof SecurityAlertsComponent
   */
  refresh_alerts(): void {
    this.update_alerts_table_(true);
  }

  /**
   * Used for changing the time amount via query
   *
   * @param {KeyboardEvent} keyboard_event
   * @memberof SecurityAlertsComponent
   */
  change_query_time_amount(keyboard_event: KeyboardEvent): void {
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(keyboard_event) &&
        ObjectUtilitiesClass.notUndefNull(keyboard_event.target) &&
        ObjectUtilitiesClass.notUndefNull(keyboard_event.target['value']) &&
        keyboard_event.target['value'] !== '') {
      this.update_alerts_table_();
    }
  }

  /**
   * Used for updating the alerts table when the time interval has been changed
   *
   * @param {MatSelectChange} mat_select_change
   * @memberof SecurityAlertsComponent
   */
  time_interval_selection_change(mat_select_change: MatSelectChange): void {
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(mat_select_change)) {
      this.update_alerts_table_();
    }
  }

  /**
   * Used to toggle between absolute and non absolute time
   *
   * @memberof SecurityAlertsComponent
   */
  toggle_absolute_time_controls(): void {
    this.time_form_group.get(this.absolute_time).setValue(!(this.get_time_form_group_field_value(this.absolute_time) as boolean));
    this.set_date_times_();
    this.update_alerts_table_();
  }

  /**
   * Used for returning if the user should use absolute time
   *
   * @return {boolean}
   * @memberof SecurityAlertsComponent
   */
  use_absolute_time(): boolean {
    return ObjectUtilitiesClass.notUndefNull(this.time_form_group) ?
             (this.get_time_form_group_field_value(this.absolute_time) as boolean) : false;
  }

  /**
   * Used for validating date and times and then updating the table
   *
   * @memberof SecurityAlertsComponent
   */
  date_time_change(): void {
    this.validate_date_times_();
    this.update_alerts_table_();
  }

  /**
   * Used for filtering only acknowledged alerts
   *
   * @param {MatSlideToggleChange} event
   * @memberof SecurityAlertsComponent
   */
  filter_acknowledged(event: MatSlideToggleChange): void {
    /* istanbul ignore else */
    if (event.checked) {
      this.time_form_group.get(this.escalated).setValue(false);
    }

    this.time_form_group.get(this.show_closed).setValue(false);
    this.update_alerts_table_();
  }

  /**
   * Used for filtering only escalated alerts
   *
   * @param {MatSlideToggleChange} event
   * @memberof SecurityAlertsComponent
   */
  filter_escalated(event: MatSlideToggleChange): void {
    /* istanbul ignore else */
    if (event.checked) {
      this.time_form_group.get(this.acknowledged).setValue(false);
    }

    this.time_form_group.get(this.show_closed).setValue(false);
    this.update_alerts_table_();
  }

  /**
   * Used for filtering only closed alerts
   *
   * @memberof SecurityAlertsComponent
   */
  filter_closed_alerts(): void {
    this.update_alerts_table_();
  }

  /**
   * Used for adding an alert chip to column names
   *
   * @param {MatChipInputEvent} event
   * @memberof SecurityAlertsComponent
   */
  add_alert_chip(event: MatChipInputEvent): void {
    const input: HTMLInputElement = event.input;
    const value: string = event.value.trim();

    /* istanbul ignore else */
    if (value !== '') {
      /* istanbul ignore else */
      if (this.all_chip_options_.includes(value) && !this.dynamic_columns.includes(value)) {
        this.dynamic_columns.push(value);
        this.all_columns.push(value);
        this.update_alerts_table_();
      }
    }
    input.value = '';

    this.group_by_control.setValue('');
  }

  /**
   * Used for removing chip or column name from table
   *
   * @param {string} column_name
   * @memberof SecurityAlertsComponent
   */
  remove_alert_chip(column_name: string): void {
    const index_from_dynamic_columns: number = this.dynamic_columns.indexOf(column_name);
    const index_from_all_columns: number = this.all_columns.indexOf(column_name);

    /* istanbul ignore else */
    if (index_from_dynamic_columns >= 0 && index_from_all_columns >= 0) {
      this.dynamic_columns.splice(index_from_dynamic_columns, 1);
      this.all_columns.splice(index_from_all_columns, 1);
      this.update_alerts_table_();
    }
  }

  /**
   * Used to autocomplete selection for input
   *
   * @param {MatAutocompleteSelectedEvent} event
   * @memberof SecurityAlertsComponent
   */
  autocomplete_selection_chip(event: MatAutocompleteSelectedEvent): void {
    /* istanbul ignore else */
    if (!this.dynamic_columns.includes(event.option.viewValue)) {
      this.dynamic_columns.push(event.option.viewValue);
      this.all_columns.push(event.option.viewValue);

      this.update_alerts_table_();
    }
    this.group_by_input_.nativeElement.value = '';

    this.group_by_control.setValue('');
  }

  /**
   * Used to retrieve time form group field value
   *
   * @param {string} field
   * @return {(boolean | Date | number | string)}
   * @memberof SecurityAlertsComponent
   */
  get_time_form_group_field_value(field: string): boolean | Date | number | string {
    return this.time_form_group.controls[field].value;
  }

  /**
   * Used for checking to see if column is a dynamic column
   *
   * @param {string} column_name
   * @return {boolean}
   * @memberof SecurityAlertsComponent
   */
  is_dynamic_column_name(column_name: string): boolean {
    return !(column_name === ACTIONS_COLUMN_NAME || column_name === COUNT_COLUMN_NAME);
  }

  /**
   * Used to get the number of alerts for an alert in the alerts table
   *
   * @param {Object} update_alert
   * @return {number}
   * @memberof SecurityAlertsComponent
   */
  get_alert_count(update_alert: Object): number {
    return ObjectUtilitiesClass.notUndefNull(update_alert) &&
           ObjectUtilitiesClass.notUndefNull(update_alert['count']) ? update_alert['count'] : 0;
  }

  /**
   * Used for retrieving column value
   *
   * @param {Object} update_alert
   * @param {string} column_name
   * @return {string}
   * @memberof SecurityAlertsComponent
   */
  get_column_value(update_alert: Object, column_name: string): string {
    if (ObjectUtilitiesClass.notUndefNull(update_alert[column_name])) {
      if (column_name === TIMESTAMP_SOURCE) {
        const date: Date = new Date(update_alert[column_name]);
        return date.toISOString();
      } else {
        return update_alert[column_name];
      }
    } else {
      return '';
    }
  }

  /**
   * Used to acknowledge an event
   *
   * @param {Object} update_alert
   * @memberof SecurityAlertsComponent
   */
  acknowledge_event(update_alert: Object): void {
    const message: string = `Are you sure you want to acknowledge ${update_alert['count']} alerts? \
                             \n\nDoing so will turn these alerts into a false positive \
                             which will not appear anymore on your alerts page.`;
    this.open_confirm_dialog_(update_alert, ACKNOWLEDGE_ALERTS_WINDOW_TITLE, message, MODIFY_API_SWITCH);
  }

  /**
   * Used to unacknowledge an event
   *
   * @param {UpdateAlertsClass} update_alert
   * @memberof SecurityAlertsComponent
   */
  unacknowledged_event(update_alert: Object): void {
    const message: string = `Are you sure you want to undo ${update_alert['count']} acknowledged alerts? \
                             \n\nDoing so will return the selected events back to their original state.`;
    this.open_confirm_dialog_(update_alert, UNACKNOWLEDGED_ALERTS_WINDOW_TITLE, message, MODIFY_API_SWITCH);
  }

  /**
   * Used to remove an alert
   *
   * @param {UpdateAlertsClass} update_alert
   * @memberof SecurityAlertsComponent
   */
  remove_alerts_confirm_dialog(update_alert: Object): void {
    const message: string = `Are you sure you want to remove ${update_alert['count']} alerts? \
                             \n\nDoing so will turn these alerts into a false positive \
                             which will not appear anymore on your alerts page. Also, \
                             the hive case for these alerts shall be deleted. \
                             It is advised to close out cases in the hive application itself.`;
    this.open_confirm_dialog_(update_alert, REMOVE_ALERTS_WINDOW_TITLE, message, REMOVE_API_SWITCH);
  }

  /**
   * Used to open alert drill down dialog window
   *
   * @param {Object} update_alert
   * @memberof SecurityAlertsComponent
   */
  open_alert_drilldown_dialog(update_alert: Object): void {
    update_alert['form'] = this.time_form_group.getRawValue() as AlertFormInterface;
    update_alert['links'] = this.portal_links_;
    this.mat_dialog_.open(AlertDrillDownDialogComponent, {
      width: DIALOG_WIDTH_1000PX,
      disableClose: true,
      data: update_alert
    });
  }

  /**
   * Used to escalate and event
   *
   * @param {Object} update_alert
   * @memberof SecurityAlertsComponent
   */
  escalate_alert(update_alert: Object): void {
    update_alert['event.escalated'] = true;
    update_alert['form'] = this.time_form_group.getRawValue() as AlertFormInterface;
    update_alert['links'] = this.portal_links_;
    const kibana_link: string = this.get_kibana_link_(update_alert);
    const arkime_prefix: string = this.get_link_(ARKIME);
    const arkime_expression: string = this.build_arkime_expression_(update_alert);
    const arkime_link: string = this.get_arkime_link_(arkime_prefix, arkime_expression);
    this.api_fork_join_get_hive_settings_and_get_alert_list_(update_alert, kibana_link, arkime_link);
  }

  /**
   * Used to open a new tab for an alert within kibana
   *
   * @param {UpdateAlertsClass} update_alert
   * @memberof SecurityAlertsComponent
   */
  open_alert_in_kibana_tab(update_alert: Object): void {
    const url: string = this.get_kibana_link_(update_alert);

    this.windows_redirect_handler_service_.open_in_new_tab(url);
  }

  /**
   * Used to open a new tab for an alert within arkime
   *
   * @param {Object} update_alert
   * @memberof SecurityAlertsComponent
   */
  open_alert_in_arkime_tab(update_alert: Object): void {
    const arkime_prefix: string = this.get_link_(ARKIME);
    const arkime_expression: string = this.build_arkime_expression_(update_alert);

    /* istanbul ignore else */
    if (arkime_prefix === '') {
      this.mat_snackbar_service_.displaySnackBar(ARKIME_NOT_INSTALLED);
      return;
    }

    /* istanbul ignore else */
    if (arkime_expression === '') {
      const fields: string = Object.keys(ARKIME_FIELD_LOOKUP).join(', ');
      this.mat_snackbar_service_.displaySnackBar(`Failed to pivot to Arkime because you need one of the following Group By fields: ${fields}`);
      return;
    }

    const url: string = this.get_arkime_link_(arkime_prefix, arkime_expression);

    this.windows_redirect_handler_service_.open_in_new_tab(url);
  }

  /**
   * Used to open a new tab for an alert within hive
   *
   * @param {UpdateAlertsClass} update_alert
   * @memberof SecurityAlertsComponent
   */
  open_alert_in_hive_tab(update_alert: Object): void {
    update_alert['form'] = this.time_form_group.value;
    update_alert['links'] = this.portal_links_;
    this.api_get_alert_list_(update_alert);
  }

  /**
   * Used to create the time form group
   *
   * @private
   * @memberof SecurityAlertsComponent
   */
  private initialize_time_form_group_(): void {
    const time_form_group_cookie: string = this.cookie_service_.get(TIME_FORM_GROUP_COOKIE);
    let time_form_group: FormGroup;
    if (ObjectUtilitiesClass.notUndefNull(time_form_group_cookie) && time_form_group_cookie.length > 0) {
      time_form_group = JSON.parse(time_form_group_cookie);
      time_form_group = this.form_builder_.group({
        acknowledged: new FormControl(time_form_group[this.acknowledged]),
        escalated: new FormControl(time_form_group[this.escalated]),
        showClosed: new FormControl(time_form_group[this.show_closed]),
        timeInterval: new FormControl(time_form_group[this.time_interval]),
        timeAmount: new FormControl(time_form_group[this.time_amount]),
        startDatetime: new FormControl(new Date(time_form_group[this.start_date_time])),
        endDatetime: new FormControl(new Date(time_form_group[this.end_date_time])),
        absoluteTime: new FormControl(time_form_group[this.absolute_time])
      });
    } else {
      time_form_group = this.form_builder_.group({
        acknowledged: new FormControl(false),
        escalated: new FormControl(false),
        showClosed: new FormControl(false),
        timeInterval: new FormControl(HOURS),
        timeAmount: new FormControl(24),
        startDatetime: new FormControl(),
        endDatetime: new FormControl(),
        absoluteTime: new FormControl(false)
      });
    }

    this.set_time_form_group_(time_form_group);
  }

  /**
   * Used to set the time form group
   *
   * @private
   * @param {FormGroup} time_form_group
   * @memberof SecurityAlertsComponent
   */
  private set_time_form_group_(time_form_group: FormGroup): void {
    this.time_form_group = time_form_group;
  }

  /**
   * Used to get auto refresh
   *
   * @private
   * @memberof SecurityAlertsComponent
   */
  private get_auto_refresh_(): void {
    const auto_refresh_cookie: string = this.cookie_service_.get(AUTO_REFRESH_COOKIE);
    const auto_refresh: boolean = ObjectUtilitiesClass.notUndefNull(auto_refresh_cookie) &&
                                  auto_refresh_cookie.length > 0 ? (auto_refresh_cookie === TRUE) : true;

    this.set_suto_refresh_(auto_refresh);
  }

  /**
   * Used to set auto refresh
   *
   * @private
   * @param {boolean} auto_refresh
   * @memberof SecurityAlertsComponent
   */
  private set_suto_refresh_(auto_refresh: boolean): void {
    this.auto_refresh = auto_refresh;
  }

  /**
   * Used to get dynamic columns
   *
   * @private
   * @memberof SecurityAlertsComponent
   */
  private get_dynamic_columns_(): void {
    const dynamic_columns_cookie: string = this.cookie_service_.get(DYNAMIC_COLUMNS_COOKIE);
    const dynamic_columns: string[] = ObjectUtilitiesClass.notUndefNull(dynamic_columns_cookie) &&
                                      dynamic_columns_cookie.length > 0 ? JSON.parse(dynamic_columns_cookie) : DYNAMIC_COLUMNS_DEFAULT_VALUES; // NOTE: this will default to most basic options

    this.set_dynamic_columns_(dynamic_columns);
    this.set_all_columns_(dynamic_columns);
  }

  /**
   * Used to set dynamic columns
   *
   * @private
   * @param {string[]} dynamic_columns
   * @memberof SecurityAlertsComponent
   */
  private set_dynamic_columns_(dynamic_columns: string[]): void {
    this.dynamic_columns = dynamic_columns;
  }

  /**
   * Used to set all columns
   *
   * @private
   * @param {string[]} dynamic_columns
   * @memberof SecurityAlertsComponent
   */
  private set_all_columns_(dynamic_columns: string[]): void {
    this.all_columns =  ALL_COLUMNS_START_VALUES.concat(dynamic_columns);
  }

  /**
   * Used to update alerts table
   *
   * @private
   * @param {boolean} [display_message=false]
   * @memberof SecurityAlertsComponent
   */
  private update_alerts_table_(display_message: boolean = false): void {
    if (this.dynamic_columns.length > 0) {
      /* istanbul ignore else */
      if (!(this.get_time_form_group_field_value(this.absolute_time) as boolean)) {
        this.set_date_times_();
      }

      const acknowledge: boolean = this.get_time_form_group_field_value(this.acknowledged) as boolean;
      const escalated: boolean = this.get_time_form_group_field_value(this.escalated) as boolean;
      const show_closed: boolean = this.get_time_form_group_field_value(this.show_closed) as boolean;
      this.api_get_alerts_(display_message, acknowledge, escalated, show_closed);
      this.save_cookies_();
    } else {
      this.update_alerts_mat_table_data_source.data = [];
    }
  }

  /**
   * Used for setting table paginatior and mat sort
   *
   * @private
   * @memberof SecurityAlertsComponent
   */
  private set_mat_table_paginator_and_sort_(): void {
    this.update_alerts_mat_table_data_source.paginator = this.paginator_;
    this.update_alerts_mat_table_data_source.sort = this.mat_sort_;
  }

  /**
   * Used for opening a confirm dialog
   *
   * @private
   * @param {Object} update_alert
   * @param {string} title
   * @param {string} message
   * @param {string} api_switch
   * @memberof SecurityAlertsComponent
   */
  private open_confirm_dialog_(update_alert: Object, title: string, message: string, api_switch: string): void {
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: title,
      message: message,
      option1: CANCEL_DIALOG_OPTION,
      option2: CONFIRM_DIALOG_OPTION
    };
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_1000PX,
      data: confirm_dialog,
    });
    mat_dialog_ref.afterClosed()
      .subscribe(
        (response: string) => {
          if (response === CONFIRM_DIALOG_OPTION) {
            update_alert['form'] = this.time_form_group.value as AlertFormInterface;
            switch (api_switch) {
              case MODIFY_API_SWITCH:
                update_alert['form']['performEscalation'] = false;
                this.api_modify_alert_(update_alert);
                break;
              case REMOVE_API_SWITCH:
                this.api_remove_alerts_(update_alert);
                break;
              default:
                break;
            }
          }
        });
  }

  /**
   * Used for opening the escalte alert window
   *
   * @private
   * @param {Object} update_alert
   * @param {string} message
   * @param {FormGroup} escalate_event_form_group
   * @memberof SecurityAlertsComponent
   */
  private open_escalate_alert_(update_alert: Object, message: string, escalate_event_form_group: FormGroup): void {
    const mat_dialog_ref: MatDialogRef<ModalDialogMatComponent, any> = this.mat_dialog_.open(ModalDialogMatComponent, {
      width: DIALOG_WIDTH_1000PX,
      data: {
        title: ESCALATE_ALERTS_WINDOW_TITLE,
        instructions: message,
        dialogForm: escalate_event_form_group,
        confirmBtnText: SAVE_DIALOG_OPTION
      }
    });
    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe (
        (response: FormGroup) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) && response.valid) {
            update_alert['form'] = this.time_form_group.value as AlertFormInterface;
            update_alert['form']['performEscalation'] = true;
            update_alert['form']['hiveForm'] = response.value as HiveFormInterface;
            this.api_modify_alert_(update_alert);
          }
        });
  }

  /**
   * Used for setting the date and time
   *
   * @private
   * @memberof SecurityAlertsComponent
   */
  private set_date_times_(): void {
    const time_amount: number = this.get_time_form_group_field_value(this.time_amount) as number;
    const time_interval: string = this.get_time_form_group_field_value(this.time_interval) as string;
    const inital_date: Date = new Date();
    /* istanbul ignore else */
    if (time_interval === DAYS) {
      inital_date.setDate(inital_date.getDate() - time_amount);
    } else if (time_interval === HOURS) {
      inital_date.setHours(inital_date.getHours() - time_amount);
    } else if (time_interval === MINUTES) {
      inital_date.setMinutes(inital_date.getMinutes() - time_amount);
    }

    this.time_form_group.get(this.start_date_time).setValue(inital_date);
    this.time_form_group.get(this.end_date_time).setValue(new Date());
  }

  /**
   * Used to validate the date and time
   *
   * @private
   * @memberof SecurityAlertsComponent
   */
  private validate_date_times_(): void {
    /* istanbul ignore else */
    if ((this.get_time_form_group_field_value(this.start_date_time) as Date) >= (this.get_time_form_group_field_value(this.end_date_time) as Date)) {
      this.mat_snackbar_service_.displaySnackBar(START_DATE_TIME_LARGE);
    }
  }

  /**
   * Used for filtering chip options
   *
   * @private
   * @param {string} value
   * @return {string[]}
   * @memberof SecurityAlertsComponent
   */
  private filter_chip_options_(value: string): string[] {
    const filter_value: string = value.toLowerCase();

    return this.all_chip_options_.filter((option: string) => option.toLowerCase().indexOf(filter_value) === 0);
  }

  /**
   * Used for getting the kinbana link
   *
   * @private
   * @param {Object} update_alert
   * @return {string}
   * @memberof SecurityAlertsComponent
   */
  private get_kibana_link_(update_alert: Object): string {
    const prefix: string = this.get_link_(KIBANA);
    const query: string = this.get_kibana_query_(update_alert);
    const start_date_time: string = (this.get_time_form_group_field_value(this.start_date_time) as Date).toISOString();
    const end_date_time: string = (this.get_time_form_group_field_value(this.end_date_time) as Date).toISOString();
    let page: string = 'overview';

    /* istanbul ignore else */
    if (update_alert['event.kind'] === SIGNAL_KIND) {
      page = KIBANA_DETECTIONS_PAGE;
    } else if (update_alert['event.kind'] === ALERT_KIND) {
      /* istanbul ignore else */
      if (update_alert['event.module']) {
        /* istanbul ignore else */
        if (update_alert['event.module'] === ZEEK_MODULE || update_alert['event.module'] === SURICATA_MODULE) {
          page = KIBANA_NETWORK_EXTERNAL_PAGE;
        } else if (update_alert['event.module'] === ENDGAME_MODULE) {
          // Since Endgame alerts do not show up on the SIEM engine page as we would expect we will instead pivot to the discover page only for this type of alert.
          return `${prefix}/app/discover#/?_g=(filters:!(),query:(language:kuery,query:''),refreshInterval:(pause:!t,value:0),time:(from:%27${start_date_time}%27,to:%27${end_date_time}%27))&_a=(columns:!(),filters:!(),index:endgame-dashboard-index-pattern,interval:auto,query:(language:kuery,query:'${query}'),sort:!(!('@timestamp',desc)))`;
        } else if (update_alert['event.module'] === SYSTEM_MODULE || update_alert['event.module'] === SYSMON_MODULE) {
          page = KIBANA_HOSTS_ALERTS_PAGE;
        }
      }
    }

    const url: string = `${prefix}/app/security/${page}?query=(language:kuery,query:'${query}')&timerange=(global:(linkTo:!(timeline),timerange:(from:%27${start_date_time}%27,kind:absolute,to:%27${end_date_time}%27)),timeline:(linkTo:!(global),timerange:(from:%27${start_date_time}%27,kind:absolute,to:%27${end_date_time}%27)))`;

    return url.replace(/'/g, '%27').replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');
  }

  /**
   * Used for retrieving a portal link dns value
   *
   * @private
   * @param {string} search
   * @return {string}
   * @memberof SecurityAlertsComponent
   */
  private get_link_(search: string): string {
    let link: string = '';
    for (const portal_link of this.portal_links_) {
      /* istanbul ignore else */
      if (portal_link.dns.includes(search)) {
        link = portal_link.dns;
      }
    }

    return link;
  }

  /**
   * Used to get a kibana query
   *
   * @private
   * @param {Object} update_alert
   * @return {string}
   * @memberof SecurityAlertsComponent
   */
  private get_kibana_query_(update_alert: Object): string {
    let ret_val = '';
    for (const field in update_alert) {
      /* istanbul ignore else */
      if (field === COUNT_COLUMN_NAME || field === FORM_COLUMN_NAME || field === LINKS_COLUMN_NAME) {
        continue;
      }
      if (update_alert['event.kind'] === SIGNAL_KIND && field === RULE_NAME_COLUMN_NAME) {
        ret_val += 'signal.rule.name : "' + update_alert[field] + '" and ';
      } else {
        ret_val += field + ' : "' + update_alert[field] + '" and ';
      }
    }

    ret_val = ret_val.slice(0, ret_val.length - 5);
    /* istanbul ignore else */
    if (this.get_time_form_group_field_value(this.escalated) as boolean) {
      ret_val += ' and event.escalated : true';
    }

    return ret_val;
  }

  /**
   * Used to get arkime expression
   *
   * @private
   * @param {Object} update_alert
   * @return {string}
   * @memberof SecurityAlertsComponent
   */
  private build_arkime_expression_(update_alert: Object): string {
    const fields: string[] = this.get_fields_(update_alert);
    let url_part: string = '';
    for (const field of fields) {
      const arkime_field: string = ARKIME_FIELD_LOOKUP[field];
      /* istanbul ignore else */
      if (ObjectUtilitiesClass.notUndefNull(arkime_field)) {
        const update_alert_field_value: any = update_alert[field];
        if (ObjectUtilitiesClass.notUndefNull(update_alert_field_value)) {
          url_part += `${arkime_field}%20%3D%3D${update_alert_field_value}%26%26%20`;
        }
      }
    }
    return url_part.slice(0, url_part.length - 9);
  }

  /**
   * Used to get arkime link
   *
   * @private
   * @param {string} arkime_prefix
   * @param {string} arkime_expression
   * @return {string}
   * @memberof SecurityAlertsComponent
   */
  private get_arkime_link_(arkime_prefix: string, arkime_expression: string): string {
    let url: string = NA;

    /* istanbul ignore else */
    if (arkime_prefix === '') {
      return url = NA_FAILED_ARKIME_NOT_INSTALLED;
    }

    if (arkime_expression === '') {
      const fields: string = Object.keys(ARKIME_FIELD_LOOKUP).join(', ');
      url = `N/A - Failed to create Arkime link because you need one of the following Group By fields: ${fields}`;
    } else {
      const startTime = Math.floor(this.time_form_group.get(this.start_date_time).value.getTime() / 1000);
      const stopTime = Math.floor(this.time_form_group.get(this.end_date_time).value.getTime() / 1000);
      url = `${arkime_prefix}/sessions?graphType=lpHisto&seriesType=bars&expression=${arkime_expression}&startTime=${startTime}&stopTime=${stopTime}`;
    }

    return url;
  }

  /**
   * Used to get fields from Object
   *
   * @private
   * @param {Object} update_alert
   * @return {string[]}
   * @memberof SecurityAlertsComponent
   */
  private get_fields_(update_alert: Object): string[] {
    return Object.keys(update_alert)
                 .filter((key: string) => !(key === COUNT_COLUMN_NAME || key === FORM_COLUMN_NAME || key === LINKS_COLUMN_NAME));
  }

  /**
   * Used to call operation when successfull modify and remove alert occurs
   *
   * @private
   * @param {ModifyRemoveReturnClass} modify_remove_return
   * @memberof SecurityAlertsComponent
   */
  private success_modify_remove_alerts_(modify_remove_return: ModifyRemoveReturnClass): void {
    const new_count: number = modify_remove_return.total;
    const message: string = `performed operation on ${new_count} Alerts.`;
    this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
    this.update_alerts_table_();
  }

  /**
   * Used for saving cookies
   *
   * @private
   * @memberof SecurityAlertsComponent
   */
  private save_cookies_(): void {
    this.cookie_service_.set(DYNAMIC_COLUMNS_COOKIE, JSON.stringify(this.dynamic_columns));
    if (ObjectUtilitiesClass.notUndefNull(this.time_form_group) && ObjectUtilitiesClass.notUndefNull(this.time_form_group.value)) {
      this.cookie_service_.set(TIME_FORM_GROUP_COOKIE, JSON.stringify(this.time_form_group.value));
    }
    this.cookie_service_.set(AUTO_REFRESH_COOKIE, this.auto_refresh.toString());
  }

  /**
   * Used for making api rest call to get fields
   *
   * @private
   * @memberof SecurityAlertsComponent
   */
  private api_get_fields_(): void {
    this.alert_service_.get_fields()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string[]) => {
          this.all_chip_options_ = response;
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving fields for chip options';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get alerts
   *
   * @private
   * @param {boolean} display_message
   * @param {boolean} acknowledge
   * @param {boolean} escalated
   * @param {boolean} show_closed
   * @memberof SecurityAlertsComponent
   */
  private api_get_alerts_(display_message: boolean, acknowledge: boolean, escalated: boolean, show_closed: boolean): void {
    this.alert_service_.get_alerts(this.dynamic_columns.join(','),
                                   (this.get_time_form_group_field_value(this.start_date_time) as Date).toISOString(),
                                   (this.get_time_form_group_field_value(this.end_date_time) as Date).toISOString(),
                                   acknowledge, escalated, show_closed)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: Object[]) => {
          this.update_alerts_mat_table_data_source.data = response;
          /* istanbul ignore else */
          if (display_message) {
            const message: string = 'updated Alerts table!';
            this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving alerts check logs for more details';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get alert list
   *
   * @private
   * @param {Object} update_alert
   * @memberof SecurityAlertsComponent
   */
  private api_get_alert_list_(update_alert: Object): void {
    this.alert_service_.get_alert_list(update_alert, 1)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: AlertListClass)=> {
          const hive_id: number = Math.abs(response.hits.hits[0]['_source']['event']['hive_id']);
          const prefix: string = this.get_link_(HIVE);
          const url: string = `${prefix}/index.html#!/case/~~${hive_id}/details`;

          this.windows_redirect_handler_service_.open_in_new_tab(url);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving alert list';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to modify alert
   *
   * @private
   * @param {Object} update_alert
   * @memberof SecurityAlertsComponent
   */
  private api_modify_alert_(update_alert: Object): void {
    this.alert_service_.modify_alert(update_alert)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: ModifyRemoveReturnClass) => {
          this.success_modify_remove_alerts_(response);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'modifying alert';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to remove alert
   *
   * @private
   * @param {Object} update_alert
   * @memberof SecurityAlertsComponent
   */
  private api_remove_alerts_(update_alert: Object): void {
    this.alert_service_.remove_alerts(update_alert)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: ModifyRemoveReturnClass) => {
          this.success_modify_remove_alerts_(response);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'removing alert';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get portal links
   *
   * @private
   * @memberof SecurityAlertsComponent
   */
  private api_get_portal_links_() {
    this.portal_service_.get_portal_links()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: PortalLinkClass[]) => {
          this.portal_links_ = response;
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving portal links';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest calls to get hive settings and get alert list
   *
   * @private
   * @param {Object} update_alert
   * @param {string} kibana_link
   * @param {string} arkime_link
   * @memberof SecurityAlertsComponent
   */
  private api_fork_join_get_hive_settings_and_get_alert_list_(update_alert: Object, kibana_link: string, arkime_link: string): void {
    forkJoin({ hive_settings: this.global_hive_settings_service_.get_hive_settings(),
               alert_list: this.alert_service_.get_alert_list(update_alert, 1) })
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: ForkJoinHiveSettingsAndAlertListInterface) => {
          /* istanbul ignore else */
          if (response.hive_settings.admin_api_key === '' || response.hive_settings.admin_api_key === HIVE_ORG_ADMIN_TEXT) {
            this.mat_snackbar_service_.displaySnackBar(HIVE_NOT_CONFIGURED);
            return;
          }

          if (!ObjectUtilitiesClass.notUndefNull(response.alert_list)) {
            this.mat_snackbar_service_.displaySnackBar(ALERT_LIST_FAILED);
          } else {
            const alert_details: Object = response.alert_list.hits.hits[0];
            let title: string = '';
            let severity: string = '2';
            /* istanbul ignore else */
            if (ObjectUtilitiesClass.notUndefNull(alert_details['_source']) && ObjectUtilitiesClass.notUndefNull(alert_details['_source']['event'])) {
              if (ObjectUtilitiesClass.notUndefNull(alert_details['_source']['event']['kind']) && alert_details['_source']['event']['kind'] === SIGNAL_KIND) {
                title = alert_details['_source']['signal']['rule']['name'];
              } else {
                /* istanbul ignore else */
                if (ObjectUtilitiesClass.notUndefNull(alert_details['_source']['rule']) && ObjectUtilitiesClass.notUndefNull(alert_details['_source']['rule']['name'])) {
                  title = alert_details['_source']['rule']['name'];
                }
              }
              /* istanbul ignore else */
              if (ObjectUtilitiesClass.notUndefNull(alert_details['_source']['event']['severity'])) {
                severity = alert_details['_source']['event']['severity'].toString();
              }
            }

            const message: string = `Are you sure you want to escalate ${update_alert['count']} alerts? \
                                     \n\nDoing so will create hive ticket.`;
            const event_title_config: DialogFormControlConfigClass = new DialogFormControlConfigClass();
            event_title_config.validatorOrOpts = [Validators.required];
            event_title_config.tooltip = EVENT_TITLE_CONFIG_TOOLTIP;
            event_title_config.label = EVENT_TITLE_CONFIG_LABEL;
            event_title_config.formState = title;
            const event_tags_config: DialogFormControlConfigClass = new DialogFormControlConfigClass();
            event_tags_config.tooltip = EVENT_TAGS_CONFIG_TOOLTIP;
            event_tags_config.label = EVENT_TAGS_CONFIG_LABEL;
            event_tags_config.controlType = DialogControlTypesEnum.chips;
            const event_description_config: DialogFormControlConfigClass = new DialogFormControlConfigClass();
            event_description_config.validatorOrOpts = [Validators.required];
            event_description_config.tooltip = EVENT_DECRIPTION_CONFIG_TOOLTIP;
            event_description_config.label = EVENT_DECRIPTION_CONFIG_LABEL;
            event_description_config.controlType = DialogControlTypesEnum.textarea;
            event_description_config.formState = `[Kibana SIEM Link](${kibana_link})\n\n[Arkime Link](${arkime_link})`;
            const event_severity_config: DialogFormControlConfigClass = new DialogFormControlConfigClass();
            event_severity_config.tooltip = EVENT_SEVERITY_CONFIG_TOOLTIP;
            event_severity_config.label = EVENT_SEVERITY_CONFIG_LABEL;
            event_severity_config.formState = severity;
            event_severity_config.validatorOrOpts = [Validators.required];
            event_severity_config.controlType = DialogControlTypesEnum.dropdown;
            event_severity_config.options = ['1', '2', '3'];
            const escalate_event_form_group: FormGroup = this.form_builder_.group({
              event_title: new DialogFormControlClass(event_title_config),
              event_tags: new DialogFormControlClass(event_tags_config),
              event_severity: new DialogFormControlClass(event_severity_config),
              event_description: new DialogFormControlClass(event_description_config)
            });
            this.open_escalate_alert_(update_alert, message, escalate_event_form_group);
          }
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving hive settings or alert list';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}
