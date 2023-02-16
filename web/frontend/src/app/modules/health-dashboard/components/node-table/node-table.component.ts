import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ErrorMessageClass, KitTokenClass, ObjectUtilitiesClass } from '../../../../classes';
import {
  DIALOG_HEIGHT_90VH,
  DIALOG_WIDTH_80VW,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR,
  SERVER
} from '../../../../constants/cvah.constants';
import { TextEditorConfigurationInterface } from '../../../../interfaces';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { NGXMonacoTextEditorComponent } from '../../../ngx-monaco-text-editor/ngx-monaco-text-editor.component';
import { DescribePodNodeClass, ElasticsearchObjectClass, NodeStatusClass, PacketStatsClass } from '../../classes';
import {
  BYTES_PER_GIB,
  CLOSE_CONFIRM_ACTION_CONFIGURATION,
  COLUMN_DEFINITIONS_NODES,
  COLUMNS_FOR_SENSOR_TABLE,
  COLUMNS_FOR_SERVER_TABLE
} from '../../constants/health-dashboard.constant';
import { ColumnDefinitionsInterface } from '../../interfaces';
import { HealthService } from '../../services/health.service';

/**
 * Component used for displaying node table data
 *
 * @export
 * @class HealthDashboardNodeTableComponent
 * @implements {OnChanges}
 */
@UntilDestroy({ checkProperties: true })
@Component({
    selector: 'cvah-health-dashboard-node-table',
    templateUrl: './node-table.component.html',
    styleUrls: ['node-table.component.scss'],
    animations: [
      trigger('detailExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
    ]
})
export class HealthDashboardNodeTableComponent implements OnChanges {
  // Input passed from parent component
  @Input() token: KitTokenClass;
  // Used for perfroming calculation within html
  bytes_per_gib: number;
  // Used for passing what columns to display in sensor table
  columns_for_sensor_inner_table: string[];
  // Used for passing what columns to display in server table
  columns_for_server_inner_table: string[];
  // Used for indicating if nodes are visible
  is_nodes_visible: boolean;
  // Used for passing nodes to html
  nodes: NodeStatusClass[];
  // Used for indicating the expanded table view for a node
  expanded_element: any[];
  // Used for retaining definition for each column
  private column_definitions_nodes_: ColumnDefinitionsInterface[];
  // Used for retaining write_rejects response from api call
  private write_rejects_: ElasticsearchObjectClass[];
  // Used for retaining suricata_pckt_stats response from api call
  private suricata_data_: PacketStatsClass[];
  // Used for retaining zeek_pckt_stats response from api call
  private zeek_data_: PacketStatsClass[];

  /**
   * Creates an instance of HealthDashboardNodeTableComponent.
   *
   * @param {MatDialog} mat_dialog_
   * @param {HealthService} health_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof HealthDashboardNodeTableComponent
   */
  constructor(private mat_dialog_: MatDialog,
              private health_service_: HealthService,
              private mat_snackbar_service_: MatSnackBarService) {
    this.bytes_per_gib = BYTES_PER_GIB;
    this.columns_for_sensor_inner_table = COLUMNS_FOR_SENSOR_TABLE;
    this.columns_for_server_inner_table = COLUMNS_FOR_SERVER_TABLE;
    this.is_nodes_visible = true;
    this.expanded_element = [];
    this.column_definitions_nodes_ = COLUMN_DEFINITIONS_NODES;
    this.write_rejects_ = [];
    this.suricata_data_ = [];
    this.zeek_data_ = [];
  }

  /**
   * Used for handeling change for input token
   *
   * @param {SimpleChanges} changes
   * @memberof HealthDashboardNodeTableComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    const token_changes: SimpleChange = changes['token'];
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(token_changes) &&
        ((token_changes.currentValue !== token_changes.previousValue) || token_changes.isFirstChange)) {
      this.reload();
    }
  }

  /**
   * Used for retrieving the node displayed columns
   *
   * @return {string[]}
   * @memberof HealthDashboardNodeTableComponent
   */
  node_displayed_cols(): string[] {
    return this.column_definitions_nodes_.filter((cd: ColumnDefinitionsInterface) => !this.token ? true : cd.remote_access)
                                         .map((cd: ColumnDefinitionsInterface) => cd.def);
  }

  /**
   * Used for passing private api call to html
   *
   * @param {string} node_name
   * @memberof HealthDashboardNodeTableComponent
   */
  describe_node(node_name: string): void {
    this.api_describe_node_(node_name);
  }

  /**
   * Used for toggling the visible state of a card
   *
   * @memberof HealthDashboardNodeTableComponent
   */
  toggle_nodes_card(): void {
    this.is_nodes_visible = !this.is_nodes_visible;
  }

  /**
   * Used to pass private method to parent component
   *
   * @memberof HealthDashboardNodeTableComponent
   */
  reload(): void {
    /* istanbul ignore else */
    if (this.expanded_element.length === 0) {
      if (this.token && this.token.token == null) {
        this.nodes = [];
      } else {
        this.api_get_node_status_();
      }
    }
  }

  /**
   * Used for updating the node status with data from several api calls
   *
   * @private
   * @memberof HealthDashboardNodeTableComponent
   */
  private update_node_statuses_(): void {
    this.nodes = this.nodes.map((node: NodeStatusClass) => {
      const app_data: PacketStatsClass[] = [];

      this.suricata_data_.map((sd: PacketStatsClass) => {
        /* istanbul ignore else */
        if (sd.node_name === node.name) {
          app_data.push(sd);
        }
      });

      this.zeek_data_.map((zd: PacketStatsClass) => {
        /* istanbul ignore else */
        if (zd.node_name === node.name) {
          app_data.push(zd);
        }
      });

      node.app_data = app_data;

      /* istanbul ignore else */
      if (node.type === SERVER.toLowerCase()) {
        node.write_rejects = this.write_rejects_;
      }

      return node;
    });
  }

  /**
   * Used for opening different dialog windows
   *
   * @private
   * @param {string} pod_name
   * @param {string} text
   * @memberof HealthDashboardNodeTableComponent
   */
  private open_dialog_window_(pod_name: string, text: string): void {
    const text_editor_configuration: TextEditorConfigurationInterface = {
      show_options: false,
      is_read_only: true,
      title: pod_name,
      text: text,
      use_language: 'plaintext',
      disable_save: false,
      confirm_save: undefined,
      confirm_close: CLOSE_CONFIRM_ACTION_CONFIGURATION
    };
    this.mat_dialog_.open(NGXMonacoTextEditorComponent, {
      height: DIALOG_HEIGHT_90VH,
      width: DIALOG_WIDTH_80VW,
      disableClose: true,
      data: text_editor_configuration,
    });
  }

  /**
   * Used for making api rest call for descrive node
   *
   * @private
   * @param {string} node_name
   * @memberof HealthDashboardNodeTableComponent
   */
  private api_describe_node_(node_name: string): void {
    this.health_service_.describe_node(node_name)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: DescribePodNodeClass) => {
          this.open_dialog_window_(node_name, response.stdout);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving describe node';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get node status
   *
   * @private
   * @memberof HealthDashboardNodeTableComponent
   */
  private api_get_node_status_(): void {
    this.health_service_.get_nodes_status(this.token)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: NodeStatusClass[]) => {
          this.nodes = response;
          this.api_write_rejects_();
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          this.nodes = [];
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving node status';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call for write rejects
   *
   * @private
   * @memberof HealthDashboardNodeTableComponent
   */
  private api_write_rejects_(): void {
    this.health_service_.write_rejects(this.token)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: ElasticsearchObjectClass[]) => {
          this.write_rejects_ = response;
          this.api_suricata_pckt_stats_();
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving write rejects';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call for suricata pckt stats
   *
   * @private
   * @memberof HealthDashboardNodeTableComponent
   */
  private api_suricata_pckt_stats_(): void {
    this.health_service_.suricata_pckt_stats(this.token)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: PacketStatsClass[]) => {
          this.suricata_data_ = response;
          this.api_zeek_pckt_stats_();
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving suricata pckt stats';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call for zeek pckt stats
   *
   * @private
   * @memberof HealthDashboardNodeTableComponent
   */
  private api_zeek_pckt_stats_(): void {
    this.health_service_.zeek_pckt_stats(this.token)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: PacketStatsClass[]) => {
          this.zeek_data_ = response;
          this.update_node_statuses_();
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving zeek pckt stats';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }
}
