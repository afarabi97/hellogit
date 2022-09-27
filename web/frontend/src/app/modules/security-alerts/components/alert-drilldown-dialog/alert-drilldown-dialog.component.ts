import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ObjectUtilitiesClass, PortalLinkClass } from '../../../../classes';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { WindowsRedirectHandlerService } from '../../../../services/windows_redirect_handler.service';
import { AlertListClass, HitClass, HitSourceClass, UpdateAlertsClass } from '../../classes';
import {
  ACTIONS_COLUMN_NAME,
  ALERT_KIND,
  ARKIME,
  ARKIME_NOT_INSTALLED_MESSAGE,
  ARKIME_PIVOT_FAIL_MESSAGE,
  COUNT_COLUMN_NAME,
  DAYS,
  ENDGAME_INDEX,
  ENDGAME_MODULE,
  FORM_COLUMN_NAME,
  KIBANA,
  LINKS_COLUMN_NAME,
  MINUTES,
  RULE_NAME_COLUMN_NAME,
  SIGNAL_KIND,
  SIGNAL_RULE_NAME_COLUMN_NAME,
  TIMESTAMP_COLUMN_NAME,
  TIMESTAMP_SOURCE
} from '../../constants/security-alerts.constant';
import { AlertService } from '../../services/alerts.service';

/**
 * Component used for accessing advanced alert features
 *
 * @export
 * @class AlertDrillDownDialogComponent
 * @implements {OnInit}
 * @implements {AfterViewInit}
 * @implements {OnChanges}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-alert-drilldown-dialog',
  templateUrl: 'alert-drilldown-dialog.component.html'
})
export class AlertDrillDownDialogComponent implements OnInit, AfterViewInit, OnChanges {
  // Used for accessing the view child element for the table dialog paginator
  @ViewChild('dialog_paginator_') private dialog_paginator_: MatPaginator;
  // Used for accessing the view child element for the table mat sort
  @ViewChild(MatSort) private mat_sort_: MatSort;
  // Used for passing list of dynamic columns based on fields for supplied table object
  dynamic_columns: string[];
  // Used for keep list of all columns from fields of supplied table object
  all_columns: string[];
  // Used for passing data and other feed back to table data source
  alerts_mat_table_data_source: MatTableDataSource<HitClass>;
  // Used for keeping a list of portal links
  private portal_links_: PortalLinkClass[];

  /**
   * Creates an instance of AlertDrillDownDialogComponent.
   *
   * @param {MatDialogRef<AlertDrillDownDialogComponent>} mat_dialog_ref_
   * @param {AlertService} alert_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {WindowsRedirectHandlerService} windows_redirect_handler_service_
   * @param {UpdateAlertsClass} update_alerts_mat_dialog_data
   * @memberof AlertDrillDownDialogComponent
   */
  constructor(private mat_dialog_ref_: MatDialogRef<AlertDrillDownDialogComponent>,
              private alert_service_: AlertService,
              private mat_snackbar_service_: MatSnackBarService,
              private windows_redirect_handler_service_: WindowsRedirectHandlerService,
              @Inject(MAT_DIALOG_DATA) public update_alerts_mat_dialog_data: UpdateAlertsClass) {
    this.alerts_mat_table_data_source = new MatTableDataSource();
    this.portal_links_ = this.update_alerts_mat_dialog_data.links;
    this.all_columns = [];
    this.dynamic_columns = [];
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof AlertDrillDownDialogComponent
   */
  ngOnInit(): void {
    this.set_columns_(this.update_alerts_mat_dialog_data);
    this.api_get_alert_list_();
  }

  /**
   * Used for making call to set paginator after the html view initialized
   *
   * @memberof AlertDrillDownDialogComponent
   */
  ngAfterViewInit(): void {
    this.set_mat_table_paginator_and_sort_();
  }

  /**
   * Used for updating table source with needed dataa and paginator when changes occure
   *
   * @memberof AlertDrillDownDialogComponent
   */
  ngOnChanges(): void {
    this.alerts_mat_table_data_source = new MatTableDataSource(this.alerts_mat_table_data_source.data);
    this.set_mat_table_paginator_and_sort_();
  }

  /**
   * Used for checking to see if column is a dynamic column
   *
   * @param {string} column_name
   * @return {boolean}
   * @memberof AlertDrillDownDialogComponent
   */
  is_dynamic_column(column_name: string): boolean {
    return !(column_name === ACTIONS_COLUMN_NAME || column_name === COUNT_COLUMN_NAME);
  }

  /**
   *
   *
   * @param {HitClass} alert
   * @param {string} column_name
   * @return {(HitSourceClass | number | boolean | string)}
   * @memberof AlertDrillDownDialogComponent
   */
  get_column_value(alert: HitClass, column_name: string): HitSourceClass | number | boolean | string {
    /* istanbul ignore else */
    if (column_name === RULE_NAME_COLUMN_NAME) {
      /* istanbul ignore else */
      if ((ObjectUtilitiesClass.notUndefNull(alert)) &&
          (ObjectUtilitiesClass.notUndefNull(alert._source)) &&
          (ObjectUtilitiesClass.notUndefNull(alert._source.event)) &&
          (ObjectUtilitiesClass.notUndefNull(alert._source.event.kind)) &&
          (alert._source.event.kind === SIGNAL_KIND)) {
        column_name = SIGNAL_RULE_NAME_COLUMN_NAME;
      }
    }

    if (ObjectUtilitiesClass.notUndefNull(alert) &&
        ObjectUtilitiesClass.notUndefNull(column_name)) {
      const values: string[] = column_name.split('.');
      let ret_val: HitSourceClass = alert._source;
      for (const i of values) {
        ret_val = ret_val[i];
      }
      return ret_val;
    } else {
      return '';
    }
  }

  /**
   * Used for checking and returning the @timestamp field
   *
   * @param {HitClass} alert
   * @return {string}
   * @memberof AlertDrillDownDialogComponent
   */
  get_timestamp(alert: HitClass): string {
    return ObjectUtilitiesClass.notUndefNull(alert) &&
           ObjectUtilitiesClass.notUndefNull(alert._source) &&
           ObjectUtilitiesClass.notUndefNull(alert._source[TIMESTAMP_SOURCE]) ? alert._source[TIMESTAMP_SOURCE] : '';
  }

  /**
   * Used for opening alert in kibana
   *
   * @param {HitClass} alert
   * @memberof AlertDrillDownDialogComponent
   */
  open_in_kibana(alert: HitClass): void {
    const id: string = alert._id;
    const start_date_time: string = this.update_alerts_mat_dialog_data.form.startDatetime.toISOString();
    const end_date_time: string = this.update_alerts_mat_dialog_data.form.endDatetime.toISOString();
    const prefix: string = this.get_link_(KIBANA);
    let index: string = 'filebeat-*';

    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(alert._source.event.kind)) {
      let url: string = '';
      /* istanbul ignore else */
      if (alert._source.event.kind === ALERT_KIND) {
        /* istanbul ignore else */
        if (alert._source.event.module === ENDGAME_MODULE) {
          index = ENDGAME_INDEX;
        }
      }

      if (alert._source.event.kind === SIGNAL_KIND) {
        url = `${prefix}/app/security/detections?query=(language:kuery,query:%27_id%20:%20%22${id}%22%27)&timerange=(global:(linkTo:!(timeline),timerange:(from:%27${start_date_time}%27,kind:absolute,to:%27${end_date_time}%27)),timeline:(linkTo:!(global),timerange:(from:%27${start_date_time}%27,kind:absolute,to:%27${end_date_time}%27)))`;
      } else {
        url = `${prefix}/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'${start_date_time}',to:'${end_date_time}'))&_a=(columns:!(_source),filters:!(),index:'${index}',interval:auto,query:(language:kuery,query:'_id:%20%22${id}%22%20'),sort:!())`;
      }

      /* istanbul ignore else */
      if (url !== '') {
        this.windows_redirect_handler_service_.open_in_new_tab(url);
      }
    }
  }

  /**
   * Used for opening alert in arkime
   *
   * @param {HitClass} alert
   * @memberof AlertDrillDownDialogComponent
   */
  open_in_arkime(alert: HitClass): void {
    const prefix: string = this.get_link_(ARKIME);
    const time_amount: number = this.update_alerts_mat_dialog_data.form.timeAmount;
    let hour_amount: number = 1;

    if (prefix === '') {
      this.mat_snackbar_service_.displaySnackBar(ARKIME_NOT_INSTALLED_MESSAGE);
    } else {
      /* istanbul ignore else */
      if (this.update_alerts_mat_dialog_data.form.timeInterval === DAYS) {
        hour_amount = time_amount * 24;
      } else if (this.update_alerts_mat_dialog_data.form.timeInterval === MINUTES) {
        /* istanbul ignore else */
        if (time_amount > 60) {
          hour_amount = Math.floor(time_amount / 60);
        }
      }

      if (ObjectUtilitiesClass.notUndefNull(alert._source) &&
          ObjectUtilitiesClass.notUndefNull(alert._source.network) &&
          ObjectUtilitiesClass.notUndefNull(alert._source.network.community_id)) {
        const community_id: string = encodeURIComponent(alert._source.network.community_id);
        const url: string = `${prefix}/sessions?expression=communityId%20%3D%3D%20%22${community_id}%22&date=${hour_amount}`;

        this.windows_redirect_handler_service_.open_in_new_tab(url);
      } else {
        this.mat_snackbar_service_.displaySnackBar(ARKIME_PIVOT_FAIL_MESSAGE);
      }
    }
  }

  /**
   * Used for closing the mat dialog window
   *
   * @memberof AlertDrillDownDialogComponent
   */
  close(): void {
    this.mat_dialog_ref_.close();
  }

  /**
   * Used for constructing dynamic and all columns arrays
   *
   * @private
   * @param {UpdateAlertsClass} update_alerts
   * @memberof AlertDrillDownDialogComponent
   */
  private set_columns_(update_alerts: UpdateAlertsClass): void {
    for (const field in update_alerts) {
      /* istanbul ignore else */
      if (field === COUNT_COLUMN_NAME || field === FORM_COLUMN_NAME || field === LINKS_COLUMN_NAME) {
        continue;
      }
      this.dynamic_columns.push(field);
    }

    this.all_columns = [ACTIONS_COLUMN_NAME, TIMESTAMP_COLUMN_NAME].concat(this.dynamic_columns);
  }

  /**
   * Used for setting table paginatior and mat sort
   *
   * @private
   * @memberof AlertDrillDownDialogComponent
   */
  private set_mat_table_paginator_and_sort_(): void {
    this.alerts_mat_table_data_source.paginator = this.dialog_paginator_;
    this.alerts_mat_table_data_source.sort = this.mat_sort_;
  }

  /**
   * Used for getting a portal link dns
   *
   * @private
   * @param {string} search
   * @return {string}
   * @memberof AlertDrillDownDialogComponent
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
   * Used for making api rest call to get alert list
   *
   * @private
   * @memberof AlertDrillDownDialogComponent
   */
  private api_get_alert_list_(): void {
    this.alert_service_.get_alert_list(this.update_alerts_mat_dialog_data)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: AlertListClass) => {
          this.alerts_mat_table_data_source.data = response.hits.hits;
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving alert list';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}
