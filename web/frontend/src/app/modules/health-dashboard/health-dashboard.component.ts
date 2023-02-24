import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { interval, Subscription } from 'rxjs';

import { ErrorMessageClass, KeyValueClass, KitSettingsClass, KitTokenClass, ObjectUtilitiesClass } from '../../classes';
import { DIALOG_WIDTH_400PX, MAT_SNACKBAR_CONFIGURATION_60000_DUR, MAT_SNACKBAR_CONFIGURATION_60000_DUR_DISMISS } from '../../constants/cvah.constants';
import { KitSettingsService } from '../../services/kit-settings.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { HealthDashboardDatastoresComponent } from './components/datastores/datastores.component';
import { HealthDashboardDialogComponent } from './components/health-dashboard-dialog/health-dashboard-dialog.component';
import { HealthDashboardNodeTableComponent } from './components/node-table/node-table.component';
import { HealthDashboardPodTableComponent } from './components/pod-table/pod-table.component';
import {
  COLUMN_DEFINITIONS_LOCALHOST_DASHBOARD,
  HEALTH_DASHBOARD_TITLE,
  KIBANA_LOGIN,
  KIT_UNAVAILABLE,
  LOCALHOST
} from './constants/health-dashboard.constant';
import { ColumnDefinitionsLocalhostInterface, HealthDashboardDialogDataInterface } from './interfaces';
import { HealthDashboardStatusService } from './services/health-dashboard-status.service';

/**
 * Component used for health dashboard related methods and calls
 *
 * @export
 * @class HealthDashboardComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-health-dashboard',
  templateUrl: './health-dashboard.component.html',
  styleUrls: ['./health-dashboard.component.scss']
})
export class HealthDashboardComponent implements OnInit {
  // Used for referencing child components to trigger calls
  @ViewChild(HealthDashboardDatastoresComponent) private datastores_component_: HealthDashboardDatastoresComponent;
  @ViewChild(HealthDashboardNodeTableComponent) private node_component_: HealthDashboardNodeTableComponent;
  @ViewChild(HealthDashboardPodTableComponent) private pod_component_: HealthDashboardPodTableComponent;
  // Used for passing data to tables
  dashboard_status: KitTokenClass[];
  remote_dashboard_status: KitTokenClass[];
  // Used for storing selection and to pass to child components
  token: KitTokenClass;
  // Used for storing if kit settings is for a gip
  is_gip: boolean;
  // Used for storing slected kit
  kit_selected: string;
  // Used for retaining definition for each column
  private column_defintion_: ColumnDefinitionsLocalhostInterface[];
  // Used for handeling subscription for interval and so interval can be destroyed on component close
  private update_subscription$_: Subscription;

  /**
   * Creates an instance of HealthDashboardComponent.
   *
   * @param {Title} title_
   * @param {MatDialog} mat_dialog_
   * @param {HealthDashboardStatusService} health_dashboard_status_service_
   * @param {KitSettingsService} kit_settings_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof HealthDashboardComponent
   */
  constructor(private title_: Title,
              private mat_dialog_: MatDialog,
              private health_dashboard_status_service_: HealthDashboardStatusService,
              private kit_settings_service_: KitSettingsService,
              private mat_snackbar_service_: MatSnackBarService) {
    this.dashboard_status = [];
    this.remote_dashboard_status = [];
    this.token = null;
    this.is_gip = false;
    this.kit_selected = LOCALHOST;
    this.column_defintion_ = COLUMN_DEFINITIONS_LOCALHOST_DASHBOARD;
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof HealthDashboardComponent
   */
  ngOnInit(): void {
    this.title_.setTitle(HEALTH_DASHBOARD_TITLE);
    this.api_get_health_dashboard_status_();
    this.api_get_remote_health_dashboard_status_();
    this.api_get_kit_settings_();
  }

  /**
   * Used for unsubscribes and destroys
   *
   * @memberof HealthDashboardComponent
   */
  ngOnDestroy(): void {
    this.update_subscription$_.unsubscribe();
    this.mat_snackbar_service_.destroySnackBar();
  }

  /**
   * Used for performing actions on tab change event
   *
   * @param {MatTabChangeEvent} [event]
   * @memberof HealthDashboardComponent
   */
  selected_tab_change(event?: MatTabChangeEvent): void {
    if (ObjectUtilitiesClass.notUndefNull(event) &&
        event.index > 0 &&
        this.remote_dashboard_status &&
        this.remote_dashboard_status.length > 0) {
      const initial_token: KitTokenClass = this.remote_dashboard_status[0];
      this.kit_selected = initial_token.ipaddress;
      this.token = initial_token;
    } else {
      this.token = null;
      this.kit_selected = LOCALHOST;
    }
  }

  /**
   * Used for passing private call to html
   *
   * @param {string} ip_address
   * @memberof HealthDashboardComponent
   */
  kibana_info(ip_address: string): void {
    this.api_get_health_dashboard_status_kibana_info_remote_(ip_address);
  }

  /**
   * Used for returning mat tooltip for elasticsearch status
   *
   * @param {KitTokenClass} [kit_token]
   * @return {string}
   * @memberof HealthDashboardComponent
   */
  get_elasticsearch_status_mat_tooltip(kit_token?: KitTokenClass): string {
    return ObjectUtilitiesClass.notUndefNull(kit_token) ? kit_token.elasticsearch_status : KIT_UNAVAILABLE;
  }

  /**
   * Used for returning mat tooltip for kibana status
   *
   * @param {KitTokenClass} [kit_token]
   * @return {string}
   * @memberof HealthDashboardComponent
   */
  get_kibana_status_mat_tooltip(kit_token?: KitTokenClass): string {
    return ObjectUtilitiesClass.notUndefNull(kit_token) ? kit_token.kibana_status : KIT_UNAVAILABLE;
  }

  /**
   * Used for performing actions on kit select
   *
   * @param {KitTokenClass} token
   * @memberof HealthDashboardComponent
   */
  kit_select(token: KitTokenClass): void {
    this.mat_snackbar_service_.destroySnackBar();
    this.token = token;
    if (!this.token) {
      this.kit_selected = LOCALHOST;
    } else {
      this.kit_selected = token.ipaddress;
      /* istanbul ignore else */
      if (!this.token.token) {
        this.mat_snackbar_service_.displaySnackBar(KIT_UNAVAILABLE, MAT_SNACKBAR_CONFIGURATION_60000_DUR_DISMISS);
      }
    }
  }

  /**
   * Used for retrieving column definitions
   *
   * @param {boolean} remote
   * @return {string[]}
   * @memberof HealthDashboardComponent
   */
  get_column_definitions(remote: boolean): string[] {
    return this.column_defintion_.filter((cd: ColumnDefinitionsLocalhostInterface) => remote ? remote : cd.localhost_only)
                                 .map((cd: ColumnDefinitionsLocalhostInterface) => cd.def);
  }

  /**
   * Used for recreating reload interval
   *
   * @private
   * @memberof HealthDashboardComponent
   */
  private create_reload_interval_(): void {
    if (ObjectUtilitiesClass.notUndefNull(this.update_subscription$_)) {
      this.update_subscription$_.unsubscribe();
    }
    this.update_subscription$_ = interval(30000)
    .subscribe(
      (number) => {
        /* istanbul ignore else */
        if (this.is_gip && !this.token) {
          this.datastores_component_.reload();
        }
        this.node_component_.reload();
        this.pod_component_.reload();
        this.api_get_health_dashboard_status_();
        this.api_get_remote_health_dashboard_status_();
      });
  }

  /**
   * Used for opening dialog window
   *
   * @private
   * @param {KeyValueClass[]} key_values
   * @memberof HealthDashboardComponent
   */
  private open_dialog_window_(key_values: KeyValueClass[]): void {
    const health_dashboard_dialog_data: HealthDashboardDialogDataInterface = {
      title: KIBANA_LOGIN,
      info: key_values
    };
    this.mat_dialog_.open(HealthDashboardDialogComponent, {
      minWidth: DIALOG_WIDTH_400PX,
      data: health_dashboard_dialog_data
    });
  }

  /**
   * Used for making api rest call to get health dashboard status
   *
   * @private
   * @memberof HealthDashboardComponent
   */
  private api_get_health_dashboard_status_(): void {
    this.health_dashboard_status_service_.get_health_dashboard_status()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: KitTokenClass[]) => {
          this.dashboard_status = response;
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving health dashboard status';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get remote health dashboard status
   *
   * @private
   * @memberof HealthDashboardComponent
   */
  private api_get_remote_health_dashboard_status_(): void {
    this.health_dashboard_status_service_.get_remote_health_dashboard_status()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: KitTokenClass[]) => {
          this.remote_dashboard_status = response;
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving remote health dashboard status';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get health dashboard status kibana info remote
   *
   * @private
   * @param {string} ip_address
   * @memberof HealthDashboardComponent
   */
  private api_get_health_dashboard_status_kibana_info_remote_(ip_address: string): void {
    this.health_dashboard_status_service_.get_health_dashboard_status_kibana_info_remote(ip_address)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: KeyValueClass[]) => {
          this.open_dialog_window_(response);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving health dashboard status kibana info remote';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get kit settings
   *
   * @private
   * @memberof HealthDashboardComponent
   */
  private api_get_kit_settings_(): void {
    this.kit_settings_service_.getKitSettings()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: KitSettingsClass) => {
          this.is_gip = response.is_gip;
          this.create_reload_interval_();
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving kit settings';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }
}
