import { Component, OnInit, Input } from '@angular/core';
import { ToolsService } from '../tools.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-node-maintenance-form',
  templateUrl: './node-maintenance.component.html',
  styleUrls: ['./node-maintenance.component.css']
})
export class NodeMaintenanceFormComponent implements OnInit {
  displayedColumns: string[] = ['node', 'interfaces', 'actions'];
  nodes = [];
  isCardVisible: boolean;
  controllerMaintainer: boolean;

  @Input()
  hasTitle: boolean;

  constructor(private toolsSrv: ToolsService, private userService: UserService) {
    this.hasTitle = true;
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  ngOnInit() {
    this.getNodeMaintenanceTableData();
  }

  ngAfterViewInit() {
  }

  toggleCard(){
    this.isCardVisible = !this.isCardVisible;
  }

  private getNodeMaintenanceTableData(): void {
    this.toolsSrv.get_monitoring_interfaces().subscribe(data => {
      this.nodes = data as Array<Object>;
    });
  }


  set_interface_state(event: MatSlideToggleChange, node: Object): void {
    let interfaces = node["interfaces"];
    let hostname = node["node"];
    let state = event['checked'] ? "up": "down";
    for (let iface of interfaces) {
      this.toolsSrv.change_state_of_remote_network_device(hostname, iface['name'], state).subscribe(data => {
        this.getNodeMaintenanceTableData();
      });
    }
  }

  isSliderChecked(node: Object): boolean {
    if (node){
      for (let iface of node['interfaces']){
        if (iface['state'] === 'down') {
          return false;
        }
      }
    }
    return true;
  }

  getSliderLabel(node){
    if (this.isSliderChecked(node)){
      return "Active";
    } else {
      return "Maintenance";
    }
  }

}
