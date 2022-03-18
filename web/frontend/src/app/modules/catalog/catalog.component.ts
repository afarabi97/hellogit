import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ChartClass, NodeClass, NotificationClass, ObjectUtilitiesClass, StatusClass } from '../../classes';
import {
  MAT_SNACKBAR_CONFIGURATION_60000_DUR,
  WEBSOCKET_MESSAGE_MESSAGE_ADD_NODE,
  WEBSOCKET_MESSAGE_MESSAGE_CREATE_VIRTUAL_MACHINE,
  WEBSOCKET_MESSAGE_MESSAGE_PROVISION_VIRTUAL_MACHINE,
  WEBSOCKET_MESSAGE_MESSAGE_REMOVE_NODE,
  WEBSOCKET_MESSAGE_ROLE_CATALOG,
  WEBSOCKET_MESSAGE_ROLE_NODE,
  WEBSOCKET_MESSAGE_ROLE_RULE_SYNC,
  WEBSOCKET_MESSAGE_STATUS_COMPLETED,
  WEBSOCKET_MESSAGE_STATUS_STARTED
} from '../../constants/cvah.constants';
import { CatalogService } from '../../services/catalog.service';
import { CookieService } from '../../services/cookies.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { SortingService } from '../../services/sorting.service';
import { WebsocketService } from '../../services/websocket.service';
import {
  CATALOG_TITLE,
  COMPLETED,
  DEFAULT_SHOW_CHART,
  SENSOR_VALUE,
  SHOW_CHART_COOKIE_NAME,
} from './constants/catalog.constants';
import { ShowChartsInterface } from './interfaces';

/**
 * Used for displaying catalog apps that are able to be installed
 *
 * @export
 * @class CatalogComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: [
    './catalog.component.scss'
  ]
})
export class CatalogComponent implements OnInit {
  // Used for displaying the loading progress bar until data
  // has returned from api calls
  is_loading: boolean;
  // Used for passing charts that have been filtered based on criteria specified by user
  filtered_charts: ChartClass[];
  // Used for data binding user selection to show / hide PMO and community charts
  show_charts: ShowChartsInterface;
  // Used for passing attribute to disable suricata and zeek during a rule sync event
  rule_sync: boolean;
  // Used for filtering out apps that need a sensor
  private has_sensors_: boolean;
  // Used for holding the charts response from the backend
  private charts_: ChartClass[];

   /**
    * Creates an instance of CatalogComponent.
    *
    * @param {Title} title_
    * @param {CatalogService} catalog_service_
    * @param {CookieService} cookie_service_
    * @param {MatSnackBarService} mat_snackbar_service_
    * @param {SortingService} sorting_service_
    * @param {WebsocketService} websocket_service_
    * @memberof CatalogComponent
    */
   constructor(private title_: Title,
               private catalog_service_: CatalogService,
               private cookie_service_: CookieService,
               private mat_snackbar_service_: MatSnackBarService,
               private sorting_service_: SortingService,
               private websocket_service_: WebsocketService) {
    this.is_loading = true;
    this.rule_sync = false;
    this.has_sensors_ = false;
  }

  /**
   * Used for setting up subscriptions
   *
   * @memberof CatalogComponent
   */
  ngOnInit(): void {
    this.title_.setTitle(CATALOG_TITLE);
    this.cookie_get_();
    this.setup_websocket_onbroadcast_();
    this.api_get_all_application_statuses_();
  }

  /**
   * Used for filter charts
   *
   * @memberof CatalogComponent
   */
  filter_charts(): void {
    this.filtered_charts = this.filter_pmo_applications_(this.show_charts.pmo)
                               .concat(this.filter_community_applications_(this.show_charts.community))
                               .sort(this.sorting_service_.chart_application_alphanum);
    this.filter_sensor_applications_();
    this.cookie_set_();
  }

  /**
   * Used for filtering pmo charts
   *
   * @private
   * @param {boolean} show_pmo
   * @return {*}  {ChartClass[]}
   * @memberof CatalogComponent
   */
  private filter_pmo_applications_(show_pmo: boolean): ChartClass[] {
    return show_pmo ? this.charts_.filter((chart: ChartClass) => chart.pmoSupported) : [];
  }

  /**
   * Used for filtering community charts
   *
   * @private
   * @param {boolean} show_community
   * @return {*}  {ChartClass[]}
   * @memberof CatalogComponent
   */
  private filter_community_applications_(show_community: boolean): ChartClass[] {
    return show_community ? this.charts_.filter((chart: ChartClass) => !chart.pmoSupported) : [];
  }

  /**
   * Used for filtering sensor charts
   *
   * @private
   * @memberof CatalogComponent
   */
  private filter_sensor_applications_(): void {
    /* istanbul ignore else */
    if (!this.has_sensors_) {
      this.filtered_charts = this.filtered_charts.filter((chart: ChartClass) => !chart.isSensorApp);
    }
  }

  /**
   * Used for making call to get show_charts cookie
   *
   * @private
   * @memberof CatalogComponent
   */
  private cookie_get_(): void {
    const cookie: string = this.cookie_service_.get(SHOW_CHART_COOKIE_NAME);
    this.show_charts = (cookie !== '') ? JSON.parse(cookie) : ObjectUtilitiesClass.create_deep_copy(DEFAULT_SHOW_CHART);
  }

  /**
   * Used for setting show sharts cookie
   *
   * @private
   * @memberof CatalogComponent
   */
  private cookie_set_(): void {
    this.cookie_service_.set(SHOW_CHART_COOKIE_NAME, JSON.stringify(this.show_charts));
  }

  /**
   * Used for setting up websocket on broadcast to recieve chart updates
   *
   * @private
   * @memberof CatalogComponent
   */
  private setup_websocket_onbroadcast_(): void {
    this.websocket_service_.onBroadcast()
      .pipe(untilDestroyed(this))
      .subscribe((message: NotificationClass) => {
        switch (message.role) {
          case WEBSOCKET_MESSAGE_ROLE_CATALOG:
            /* istanbul ignore else */
            if (ObjectUtilitiesClass.notUndefNull(message.data) &&
                ObjectUtilitiesClass.notUndefNull(this.charts_)) {
              this.charts_.forEach((chart: ChartClass) => {
                /* istanbul ignore else */
                if (chart.application === message.application.toLowerCase()) {
                  const data_keys: string[] = Object.keys(message.data);
                  const node_statuses: StatusClass[] = data_keys.map((key: string) => message.data[key]);
                  chart.nodes = node_statuses;
                }
              });
            }
            break;
          case WEBSOCKET_MESSAGE_ROLE_NODE:
            /* istanbul ignore else */
            if (((message.status === COMPLETED) && (message.message.includes(WEBSOCKET_MESSAGE_MESSAGE_REMOVE_NODE))) ||
                ((message.status === COMPLETED) && (message.message.includes(WEBSOCKET_MESSAGE_MESSAGE_CREATE_VIRTUAL_MACHINE))) ||
                ((message.status === COMPLETED) && (message.message.includes(WEBSOCKET_MESSAGE_MESSAGE_PROVISION_VIRTUAL_MACHINE))) ||
                ((message.status === COMPLETED) && (message.message.includes(WEBSOCKET_MESSAGE_MESSAGE_ADD_NODE)))) {
              this.is_loading = true;
              this.filtered_charts = [];
              this.charts_ = [];
              this.has_sensors_ = false;
              this.api_get_all_application_statuses_();
            }
            break;
          case WEBSOCKET_MESSAGE_ROLE_RULE_SYNC:
            if (message.status === WEBSOCKET_MESSAGE_STATUS_STARTED) {
              this.rule_sync = true;
            }
            if (message.status === WEBSOCKET_MESSAGE_STATUS_COMPLETED) {
              this.rule_sync = false;
            }
            break;
          default:
            break;
        }
      });
  }

  /**
   * Used for making api rest call to get all application statuses
   *
   * @private
   * @memberof CatalogComponent
   */
  private api_get_all_application_statuses_(): void {
    this.catalog_service_.get_all_application_statuses()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: ChartClass[]) => {
          this.charts_ = response;
          this.api_get_catalog_nodes_();
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving application statuses';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get catalog nodes
   *
   * @private
   * @memberof CatalogComponent
   */
  private api_get_catalog_nodes_(): void {
    this.catalog_service_.get_catalog_nodes()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: NodeClass[]) => {
          response.forEach((node: NodeClass) => {
            /* istanbul ignore else */
            if (node.node_type === SENSOR_VALUE) {
              this.has_sensors_ = true;
            }
          });
          this.is_loading = false;
          this.filter_charts();
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving catalog nodes';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}
