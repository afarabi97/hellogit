import { Component, OnInit, Input } from '@angular/core';
import { ToolsService } from '../tools.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-node-maintenance-form',
  templateUrl: './node-maintenance.component.html',
  styleUrls: ['./node-maintenance.component.css']
})
export class NodeMaintenanceFormComponent implements OnInit {
  displayedColumns: string[] = ['node', 'interfaces', 'actions']
  interfaceStatus = []
  isCardVisible: boolean;

  @Input()
  hasTitle: boolean;

  constructor(private toolsSrv: ToolsService){
    this.hasTitle = true;
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
    this.toolsSrv.getAllConfiguredIfaces().subscribe(data => {
      this.interfaceStatus = data as Array<Object>;
    });
  }


  toggleMaintenance(event: MatSlideToggleChange, node: Object): void {
    let interfaces = node["interfaces"];
    let changeStateTo = event['checked'] ? "up": "down";
    for (let iface in interfaces) {
      this.toolsSrv.ip_set_link(node["node"], iface, changeStateTo).subscribe(data => {
        this.getNodeMaintenanceTableData();
      });
    }
  }

  isSliderChecked(node: Object): boolean {
    if (node){
      for (let key in node['interfaces']){
        if (node['interfaces'][key] === "down"){
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
