import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { ErrorMessageClass, IFACEStateClass } from '../../../../classes';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { UserService } from '../../../../services/user.service';
import { InitialDeviceStateClass } from '../../classes/initial-device-state.class';
import { NetworkDeviceStateClass } from '../../classes/network-device-state.class';
import { ToolsService } from '../../services/tools.service';

@Component({
  selector: 'app-node-maintenance-form',
  templateUrl: './node-maintenance.component.html',
  styleUrls: ['./node-maintenance.component.css']
})
export class NodeMaintenanceFormComponent implements OnInit {
  @Input()hasTitle: boolean;
  displayedColumns: string[] = ['node', 'interfaces', 'actions'];
  nodes: InitialDeviceStateClass[] = [];
  isCardVisible: boolean;
  controllerMaintainer: boolean;

  constructor(private toolsSrv: ToolsService,
              private mat_snackbar_service_: MatSnackBarService,
              private userService: UserService) {
    this.hasTitle = true;
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  ngOnInit() {
    this.getNodeMaintenanceTableData();
  }

  toggleCard(){
    this.isCardVisible = !this.isCardVisible;
  }

  set_interface_state(event: MatSlideToggleChange, node: InitialDeviceStateClass): void {
    const interfaces: IFACEStateClass[] = node.interfaces;
    const hostname: string = node.node;
    const state: string = event.checked ? 'up' : 'down';
    for (const iface of interfaces) {
      this.toolsSrv.change_remote_network_device_state(hostname, iface['name'], state)
        .subscribe(
          (response: NetworkDeviceStateClass) => {
            this.getNodeMaintenanceTableData();
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
  }

  isSliderChecked(node: Object): boolean {
    if (node){
      for (const iface of node['interfaces']){
        if (iface['state'] === 'down') {
          return false;
        }
      }
    }
    return true;
  }

  getSliderLabel(node){
    if (this.isSliderChecked(node)){
      return 'Active';
    } else {
      return 'Maintenance';
    }
  }

  private getNodeMaintenanceTableData(): void {
    this.toolsSrv.get_initial_device_states()
    .subscribe(
      (response: InitialDeviceStateClass[]) => {
      this.nodes = response;
    });
  }
}
