import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ErrorMessageClass, IFACEStateClass, ObjectUtilitiesClass } from '../../../../classes';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { InitialDeviceStateClass } from '../../classes/initial-device-state.class';
import { NetworkDeviceStateClass } from '../../classes/network-device-state.class';
import { ACTIVE, DOWN, MAINTENANCE, NODE_MAINTENANCE_TABLE_COLUMNS, UP } from '../../constants/tools.constant';
import { ToolsService } from '../../services/tools.service';

/**
 * Component used for change a remote node state
 *
 * @export
 * @class NodeMaintenanceFormComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-node-maintenance-form',
  templateUrl: './node-maintenance.component.html',
  styleUrls: [
    './node-maintenance.component.scss'
  ]
})
export class NodeMaintenanceFormComponent implements OnInit {
  // Used for passing coulmn values to table in html
  table_columns: string[];
  // Used for passing data to table in html
  nodes: InitialDeviceStateClass[];

  /**
   * Creates an instance of NodeMaintenanceFormComponent.
   *
   * @param {ToolsService} tools_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof NodeMaintenanceFormComponent
   */
  constructor(private tools_service_: ToolsService,
              private mat_snackbar_service_: MatSnackBarService) {
    this.table_columns = NODE_MAINTENANCE_TABLE_COLUMNS;
  }

  /**
   * Used for initial setup
   *
   * @memberof NodeMaintenanceFormComponent
   */
  ngOnInit(): void {
    this.api_get_initial_device_states_();
  }

  /**
   * Used for returning the state of the active slide toggle for a node
   *
   * @param {InitialDeviceStateClass} node
   * @return {boolean}
   * @memberof NodeMaintenanceFormComponent
   */
  is_slider_checked(node: InitialDeviceStateClass): boolean {
    if (ObjectUtilitiesClass.notUndefNull(node)) {
      for (const iface of node.interfaces) {
        if (iface.state === DOWN) {
          return false;
        }
      }
      return true;
    } else {
      return true;
    }
  }

  /**
   * Used for calling method to change the state on interfaces tied to a remote node
   *
   * @param {MatSlideToggleChange} event
   * @param {InitialDeviceStateClass} node
   * @memberof NodeMaintenanceFormComponent
   */
  set_interface_states(event: MatSlideToggleChange, node: InitialDeviceStateClass): void {
    const interfaces: IFACEStateClass[] = node.interfaces;
    const hostname: string = node.node;
    const state: string = event.checked ? UP : DOWN;
    for (const iface of interfaces) {
      this.api_change_remote_network_device_state_(event, hostname, iface.name, state);
    }
  }

  /**
   * Used for retrieving the slider label
   *
   * @param {InitialDeviceStateClass} node
   * @return {string}
   * @memberof NodeMaintenanceFormComponent
   */
  get_slider_label(node: InitialDeviceStateClass): string {
    return this.is_slider_checked(node) ? ACTIVE : MAINTENANCE;
  }

  /**
   * Used for making api rest call to change remote network device state
   *
   * @private
   * @param {MatSlideToggleChange} event
   * @param {string} hostname
   * @param {string} iface_name
   * @param {string} state
   * @memberof NodeMaintenanceFormComponent
   */
  private api_change_remote_network_device_state_(event: MatSlideToggleChange, hostname: string, iface_name: string, state: string): void {
    this.tools_service_.change_remote_network_device_state(hostname, iface_name, state)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: NetworkDeviceStateClass) => {
          this.api_get_initial_device_states_();
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          event.checked = !event.checked;
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = `changing remote network state`;
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get initial device states
   *
   * @private
   * @memberof NodeMaintenanceFormComponent
   */
  private api_get_initial_device_states_(): void {
    this.tools_service_.get_initial_device_states()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: InitialDeviceStateClass[]) => {
          this.nodes = response;
        },
        (error: HttpErrorResponse) => {
          const message: string = `retrieving initial device states`;
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}
