import { Component, Input, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { UserService } from '../../../../services/user.service';
import { ToolsService } from '../../services/tools.service';

@Component({
  selector: 'app-node-maintenance-form',
  templateUrl: './node-maintenance.component.html',
  styleUrls: ['./node-maintenance.component.css']
})
export class NodeMaintenanceFormComponent implements OnInit {
  @Input()hasTitle: boolean;
  displayedColumns: string[] = ['node', 'interfaces', 'actions'];
  nodes = [];
  isCardVisible: boolean;
  controllerMaintainer: boolean;

  constructor(private toolsSrv: ToolsService, private userService: UserService) {
    this.hasTitle = true;
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  ngOnInit() {
    this.getNodeMaintenanceTableData();
  }

  toggleCard(){
    this.isCardVisible = !this.isCardVisible;
  }

  set_interface_state(event: MatSlideToggleChange, node: Object): void {
    const interfaces = node['interfaces'];
    const hostname = node['node'];
    const state = event['checked'] ? 'up': 'down';
    for (const iface of interfaces) {
      this.toolsSrv.changStateofRemoteNetworkDevice(hostname, iface['name'], state).subscribe(data => {
        this.getNodeMaintenanceTableData();
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
    this.toolsSrv.getMonitoringInterfaces().subscribe(data => {
      this.nodes = data as Array<Object>;
    });
  }
}
