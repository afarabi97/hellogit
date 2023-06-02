import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChildren } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import * as FileSaver from 'file-saver';

import {
  AppClass,
  ErrorMessageClass,
  GenericJobAndKeyClass,
  KitSettingsClass,
  KitStatusClass,
  NodeClass,
  ObjectUtilitiesClass,
  SuccessMessageClass
} from '../../classes';
import {
  CANCEL_DIALOG_OPTION,
  CONFIRM_DIALOG_OPTION,
  CONTROL_PLANE,
  DEPLOY,
  DIALOG_HEIGHT_90VH,
  DIALOG_WIDTH_1000PX,
  DIALOG_WIDTH_35PERCENT,
  DIALOG_WIDTH_75VW,
  ISO,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR,
  MINIO,
  MIP,
  REMOVE,
  SENSOR,
  SERVER,
  SERVICE
} from '../../constants/cvah.constants';
import { ConfirmDialogMatDialogDataInterface, ServerStdoutMatDialogDataInterface } from '../../interfaces';
import { CatalogService } from '../../services/catalog.service';
import { KitSettingsService } from '../../services/kit-settings.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { WebsocketService } from '../../services/websocket.service';
import { ConfirmDialogComponent } from '../global-components/components/confirm-dialog/confirm-dialog.component';
import { NodeInfoDialogComponent } from '../global-components/components/node-info-dialog/node-info-dialog.component';
import {
  NodeStateProgressBarComponent
} from '../global-components/components/node-state-progress-bar/node-state-progress-bar.component';
import { ServerStdoutComponent } from '../server-stdout/server-stdout.component';
import { AddNodeDialogComponent } from './components/add-node-dialog/add-node-dialog.component';
import {
  MAT_DIALOG_CONFIG__REDEPLOY_KIT,
  MAT_DIALOG_CONFIG__REFRESH_KIT,
  NODE_MANAGEMENT_TITLE,
  NODE_TABLE_COLUMNS,
  SETUP_NODE_TABLE_COLUMNS
} from './constants/node-mng.constant';
import { AddNodeMatDialogDataInterface } from './interfaces/add-node-mat-dialog-data.interface';

/**
 * Used for making node managment related calls
 *
 * @export
 * @class NodeManagementComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-node-mng',
  templateUrl: './node-mng.component.html'
})
export class NodeManagementComponent implements OnInit {
  // Used by a parent component
  @ViewChildren('progressCircles') public progress_circles: NodeStateProgressBarComponent[];
  // Used for passing the setup node table columns for html
  setup_node_columns: string[];
  // Used for passing the node table columns for html
  node_columns: string[];
  // Used for passing nodes to setup_nodes table
  setup_nodes: NodeClass[];
  // Used for passing nodes to nodes table
  nodes: NodeClass[];
  // Used for passing value to html to signify that iso sensor detected
  iso_sensor_detected: boolean;
  // Used for holding on to kit status for later use
  private kit_status_: Partial<KitStatusClass>;
  // Used for holding on to kit settings for later use
  private kit_settings_: KitSettingsClass;

  /**
   * Creates an instance of NodeManagementComponent.
   *
   * @param {Title} title
   * @param {MatDialog} mat_dialog_
   * @param {CatalogService} catalog_service_
   * @param {KitSettingsService} kit_settings_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {WebsocketService} web_socket_service_
   * @memberof NodeManagementComponent
   */
  constructor(title: Title,
              private mat_dialog_: MatDialog,
              private catalog_service_: CatalogService,
              private kit_settings_service_: KitSettingsService,
              private mat_snackbar_service_: MatSnackBarService,
              private web_socket_service_: WebsocketService) {
    title.setTitle(NODE_MANAGEMENT_TITLE);
    this.setup_node_columns = SETUP_NODE_TABLE_COLUMNS;
    this.node_columns = NODE_TABLE_COLUMNS;
    this.setup_nodes = [];
    this.nodes = [];
    this.iso_sensor_detected = false;
    this.kit_status_ = {};
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof NodeManagementComponent
   */
  ngOnInit(): void {
    this.setup_websocket_get_socket_on_node_state_change_();
    this.setup_websocket_get_socket_on_kit_status_change_();
    this.api_get_nodes_();
    this.api_get_kit_status_();
    this.api_get_kit_settings_();
  }

  /**
   * Used for disabling the refresh kit button
   *
   * @return {boolean}
   * @memberof NodeManagementComponent
   */
  disable_refresh_kit_button(): boolean {
    return !this.kit_status_.base_kit_deployed &&
           this.kit_status_.jobs_running ? true : !this.kit_status_.base_kit_deployed;
  };

  /**
   * Used for disabling the setup control plane button
   *
   * @return {boolean}
   * @memberof NodeManagementComponent
   */
  disable_setup_control_plane_button(): boolean {
    return !((!this.kit_status_.control_plane_deployed &&
              this.kit_status_.esxi_settings_configured &&
              this.kit_status_.kit_settings_configured) &&
              (!this.kit_status_.jobs_running));
  };

  /**
   * Used for disabling the add node button
   *
   * @return {boolean}
   * @memberof NodeManagementComponent
   */
  disable_add_node_button(): boolean {
    return this.kit_status_.deploy_kit_running;
  }

  /**
   * Used for disabling the deploy kit button
   *
   * @return {boolean}
   * @memberof NodeManagementComponent
   */
  disable_deploy_kit_button(): boolean {
    return !(!this.kit_status_.jobs_running && this.kit_status_.ready_to_deploy);
  }

  /**
   * Used for passing boolean to allow node to refresh device facts
   *
   * @param {NodeClass} node
   * @return {boolean}
   * @memberof NodeManagementComponent
   */
  can_refresh_device_facts(node: NodeClass): boolean {
    return node.isDeployed;
  }

  /**
   * Used for passing private call to html
   *
   * @param {NodeClass} node
   * @memberof NodeManagementComponent
   */
  refresh_device_facts(node: NodeClass): void {
    this.api_update_device_facts_(node);
  }

  /**
   * Used for returning a boolean if node is in iso button group
   *
   * @param {NodeClass} node
   * @return {boolean}
   * @memberof NodeManagementComponent
   */
  is_iso_button_group(node: NodeClass): boolean {
    return (node.node_type === SENSOR && node.deployment_type === ISO);
  }

  /**
   * Used for sending info about if it has been deployed yet
   *
   * @param {NodeClass} node
   * @return {boolean}
   * @memberof NodeManagementComponent
   */
  is_iso_node_deployed(node: NodeClass): boolean {
    return ObjectUtilitiesClass.notUndefNull(node) && ObjectUtilitiesClass.notUndefNull(node.isDeployed) ? node.isDeployed : false;
  }

  /**
   * Used for returning boolean if a node can be deleted
   *
   * @param {NodeClass} node
   * @return {boolean}
   * @memberof NodeManagementComponent
   */
  can_delete_node(node: NodeClass): boolean {
    return (node.node_type === SENSOR || node.node_type === SERVICE || node.node_type === MINIO) ||
           (node.node_type === SERVER && !node.isDeployed);
  }

  /**
   * Used for opening node info dialog window
   *
   * @param {NodeClass} node
   * @memberof NodeManagementComponent
   */
  open_node_info_dialog_window(node: NodeClass): void {
    this.mat_dialog_.open(NodeInfoDialogComponent, {
      width: DIALOG_WIDTH_1000PX,
      data: node
    });
  }

  /**
   * Used for opening add node dialog window
   *
   * @memberof NodeManagementComponent
   */
  open_add_node_dialog_window(): void {
    const add_node_mat_dialog_data: AddNodeMatDialogDataInterface = {
      kit_settings: this.kit_settings_,
      nodes: this.nodes
    };
    this.mat_dialog_.open(AddNodeDialogComponent, {
      width: DIALOG_WIDTH_1000PX,
      disableClose: true,
      data: add_node_mat_dialog_data
    });
  }

  /**
   * Used for downloading an iso file
   *
   * @memberof NodeManagementComponent
   */
  download_iso(): void {
    const isoURL: HTMLAnchorElement = document.createElement('a');
    isoURL.setAttribute('target', '_blank');
    isoURL.setAttribute('href', '/assets/dip-virtual-sensor.iso');
    isoURL.setAttribute('download', 'dip-virtual-sensor.iso');
    document.body.appendChild(isoURL);
    isoURL.click();
    isoURL.remove();
  }

  /**
   * Used for passing private call to html
   *
   * @param {NodeClass} node
   * @memberof NodeManagementComponent
   */
  download_open_vpn_certs(node: NodeClass): void {
    this.api_get_open_vpn_certs_(node);
  }

  /**
   * Used for passing boolean to get vpn status
   *
   * @param {NodeClass} node
   * @return {boolean}
   * @memberof NodeManagementComponent
   */
  get_vpn_status(node: NodeClass): boolean {
    return (node.node_type === SENSOR && node.deployment_type === ISO) ? ObjectUtilitiesClass.notUndefNull(node.vpn_status) : false;
  }

  /**
   * Used for opening the server std out console
   *
   * @param {string} job_id
   * @memberof NodeManagementComponent
   */
  open_job_server_std_out_console(job_id: string): void {
    const server_stdout_mat_dialog_data: ServerStdoutMatDialogDataInterface = {
      job_id: job_id
    };
    this.mat_dialog_.open(ServerStdoutComponent, {
      height: DIALOG_HEIGHT_90VH,
      width: DIALOG_WIDTH_75VW,
      data: server_stdout_mat_dialog_data
    });
  }

  /**
   * Used for deploy kit or redeploy kit if condiotions are met
   *
   * @memberof NodeManagementComponent
   */
  deploy_kit(): void {
    if (this.kit_status_.base_kit_deployed) {
      this.redeploy_kit_();
    } else {
      this.api_deploy_kit_();
    }
  }

  /**
   * Used for passing private call to html
   *
   * @memberof NodeManagementComponent
   */
  setup_control_plane(): void {
    this.api_setup_control_plane_();
  }

  /**
   * Used for passing private call to html
   *
   * @param {NodeClass} node
   * @memberof NodeManagementComponent
   */
  delete_node(node: NodeClass): void {
    this.api_get_catalog_apps_(node);
  }

  /**
   * Used for opening refresh kit confirm dialog window
   *
   * @memberof NodeManagementComponent
   */
  refresh_kit(): void {
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent,
                                                                                            MAT_DIALOG_CONFIG__REFRESH_KIT);

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (response === CONFIRM_DIALOG_OPTION) {
            this.api_refresh_kit_();
          }
        });
  }

  /**
   * Used for opening redeploy kit confirm dialog window
   *
   * @private
   * @memberof NodeManagementComponent
   */
  private redeploy_kit_(): void {
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent,
                                                                                            MAT_DIALOG_CONFIG__REDEPLOY_KIT);

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (response === CONFIRM_DIALOG_OPTION) {
            this.api_deploy_kit_();
          }
        });
  }

  /**
   * Used for opening delete node confirm dialog window
   *
   * @private
   * @param {NodeClass} node
   * @param {AppClass[]} apps
   * @memberof NodeManagementComponent
   */
  private open_delete_node_dialog_window_(node: NodeClass, apps: AppClass[]): void {
    let message = `Are you sure you want delete ${node.hostname}?`;
    /* istanbul ignore else */
    if (apps.length > 0) {
      const applications: string [] = apps.map((app: AppClass) => app.application);
      message = `${message}\n\n \
      The following applications will be uninstalled: \n ${applications.join(", ")}`;
    }
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: `Delete ${node.hostname}?`,
      message: message,
      option1: CANCEL_DIALOG_OPTION,
      option2: CONFIRM_DIALOG_OPTION
    };

    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_35PERCENT,
      data: confirm_dialog,
    });
    mat_dialog_ref.afterClosed()
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (response === CONFIRM_DIALOG_OPTION) {
            this.api_delete_node_(node);
          }
        });
  }

  /**
   * Used for updating nodes with job status so that way progress bar is updated
   * and mips are filtered out
   *
   * @private
   * @param {NodeClass[]} nodes
   * @memberof NodeManagementComponent
   */
  private update_nodes_data_(nodes: NodeClass[]): void {
    const setup_nodes: NodeClass[] = [];
    const new_nodes: NodeClass[] = [];
    let iso_sensor_detected: boolean = false;
    for (const node of nodes) {
      /* istanbul ignore else */
      if (ObjectUtilitiesClass.notUndefNull(node.jobs)) {
        for (const job of node.jobs) {
          /* istanbul ignore else */
          if (job.name === DEPLOY) {
            node.isDeployed = job.complete;
          }
          /* istanbul ignore else */
          if (job.name === REMOVE) {
            node.isRemoving = true;
          }
        }
      }
      /* istanbul ignore else */
      if (node.deployment_type === ISO) {
        iso_sensor_detected = true;
      }
      /* istanbul ignore else */
      if (node.node_type !== MIP) {
        new_nodes.push(node);
      }
      /* istanbul ignore else */
      if (node.node_type === CONTROL_PLANE) {
        setup_nodes.push(node);
      }
    }
    this.set_nodes_(new_nodes);
    this.set_setup_nodes_(setup_nodes);
    this.set_iso_sensor_detected_(iso_sensor_detected);
  }

  /**
   * Used for setting the nodes with a passed value
   *
   * @private
   * @param {NodeClass[]} nodes
   * @memberof NodeManagementComponent
   */
  private set_nodes_(nodes: NodeClass[]): void {
    this.nodes = nodes;
  }

  /**
   * Used for setting the setup_nodes with a passed value
   *
   * @private
   * @param {NodeClass[]} setup_nodes
   * @memberof NodeManagementComponent
   */
  private set_setup_nodes_(setup_nodes: NodeClass[]): void {
    this.setup_nodes = setup_nodes;
  }

  /**
   * Used for setting the iso_sensor_detected with a passed value
   *
   * @private
   * @param {boolean} iso_sensor_detected
   * @memberof NodeManagementComponent
   */
  private set_iso_sensor_detected_(iso_sensor_detected: boolean): void {
    this.iso_sensor_detected = iso_sensor_detected;
  }

  /**
   * Used for setting up webscoket on node state change
   *
   * @private
   * @memberof NodeManagementComponent
   */
  private setup_websocket_get_socket_on_node_state_change_(): void {
    this.web_socket_service_.getSocket().on('node-state-change', (response: NodeClass[]) => this.update_nodes_data_(response));
  }

  /**
   * Used for setting up webscoket on kit status change
   *
   * @private
   * @memberof NodeManagementComponent
   */
  private setup_websocket_get_socket_on_kit_status_change_(): void {
    this.web_socket_service_.getSocket().on('kit-status-change', (response: KitStatusClass) => this.kit_status_ = response);
  }

  /**
   * Used for making api rest call to get nodes
   *
   * @private
   * @memberof NodeManagementComponent
   */
  private api_get_nodes_(): void {
    this.kit_settings_service_.get_nodes()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: NodeClass[]) => {
          this.update_nodes_data_(response);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving nodes';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get kit status
   *
   * @private
   * @memberof NodeManagementComponent
   */
  private api_get_kit_status_(): void {
    this.kit_settings_service_.get_kit_status()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: KitStatusClass) => {
          this.kit_status_ = response;
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving kit status';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get kit settings
   *
   * @private
   * @memberof NodeManagementComponent
   */
  private api_get_kit_settings_(): void {
    this.kit_settings_service_.getKitSettings()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: KitSettingsClass) => {
          this.kit_settings_ = response;
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

  /**
   * Used for making api rest call to update device facts
   *
   * @private
   * @param {NodeClass} node
   * @memberof NodeManagementComponent
   */
  private api_update_device_facts_(node: NodeClass): void {
    this.kit_settings_service_.update_device_facts(node.hostname)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          this.mat_snackbar_service_.displaySnackBar(`Device facts job started for ${node.hostname} \ Check Notifications for results.`);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'updating device facts';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get open vpn certs
   *
   * @private
   * @param {NodeClass} node
   * @memberof NodeManagementComponent
   */
  private api_get_open_vpn_certs_(node: NodeClass): void {
    this.kit_settings_service_.get_open_vpn_certs(node.hostname)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: Blob) => {
          const config_blob: Blob = new Blob([response], { type: 'text/plain;charset=utf-8' });
          FileSaver.saveAs(config_blob, `${node.hostname}.conf`);
          this.mat_snackbar_service_.displaySnackBar(`Downloading VPN Config for ${node.hostname}`);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'downloading open vpn certs';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to deploy kit
   *
   * @private
   * @memberof NodeManagementComponent
   */
  private api_deploy_kit_(): void {
    this.kit_settings_service_.deploy_kit()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          this.open_job_server_std_out_console(response.job_id);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'downloading open vpn certs';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to refresh kit
   *
   * @private
   * @memberof NodeManagementComponent
   */
  private api_refresh_kit_(): void {
    this.kit_settings_service_.refresh_kit()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          const message: string = ' started refresh kit job';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'starting refresh kit';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to setup control plane
   *
   * @private
   * @memberof NodeManagementComponent
   */
  private api_setup_control_plane_(): void {
    this.kit_settings_service_.setup_control_plane()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          const message: string = ' started setup control plane job';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'starting setup control plane';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to delete node
   *
   * @private
   * @param {NodeClass} node
   * @memberof NodeManagementComponent
   */
  private api_delete_node_(node: NodeClass): void {
    this.kit_settings_service_.delete_node(node.hostname)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          node.isRemoving = true;
          const message: string = ' started delete node job';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'deleting node';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get catalog apps
   *
   * @private
   * @param {NodeClass} node
   * @memberof NodeManagementComponent
   */
  private api_get_catalog_apps_(node: NodeClass): void {
    this.catalog_service_.get_installed_apps(node.hostname)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: AppClass[]) => {
          let installed_apps = [];
          /* istanbul ignore else */
          if (response.length > 0) {
            installed_apps = response.map((app: AppClass) => app.application);
          }
          this.open_delete_node_dialog_window_(node, installed_apps);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving catalog applications';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}
