import { Component, OnInit } from '@angular/core';
import { HealthServiceService } from './health-service.service';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogDisplayMatComponent } from '../modal-dialog-display-mat/modal-dialog-display-mat.component';
import { MatTabChangeEvent } from '@angular/material';


const MODAL_SIZE ='900px';

@Component({
  selector: 'app-system-health',
  templateUrl: './system-health.component.html',
  styleUrls: ['./system-health.component.css']
})
export class SystemHealthComponent implements OnInit {
  columnsForNodeStatues: string[] = ['name', 'type', 'ip_address',
                                     'ready', 'out_of_disk', 'memory_pressure',
                                     'disk_pressure', 'actions'];

  columnsForPodStatues: string[] = ['namespace', 'pod_name', 'container_states',
                                    'restart_count', 'actions'];

  tabs_names: Array<string>;
  allPodeStatuses: Array<Object>;
  podsStatuses: MatTableDataSource<Array<Object>>;
  nodeStatuses: MatTableDataSource<Array<Object>>;
  totals: Object;

  pipelineStatus: Object;
  displayedPipeline: Object;

  isNodeResourcesVisible: Array<boolean>;
  isPodResourcesVisible: Array<boolean>;
  currentTabIndex: number;

  constructor(private title: Title,
              private healthSrv: HealthServiceService,
              private router: Router,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.title.setTitle("System Health");
    this.currentTabIndex = 0;
    this._refreshHealthPage();
  }

  private _refreshHealthPage(){
    this.healthSrv.getHealthStatus().subscribe(data => {
      this.allPodeStatuses = data['pod_info'];
      this.podsStatuses = new MatTableDataSource<Array<Object>>(data['pod_info']);
      this.nodeStatuses = new MatTableDataSource<Array<Object>>(data['node_info']);
      this.isNodeResourcesVisible = new Array(this.nodeStatuses.data.length).fill(false);
      this.isPodResourcesVisible = new Array(this.podsStatuses.data.length).fill(false);
      this.totals = data['totals'] as Object;

      this.tabs_names = new Array<string>();
      for (let node of data['node_info']){
        this.tabs_names.push(node['metadata']['name'])
      }
      this.tabs_names.push("Unassigned Pods");
    });

    this.healthSrv.getPipelineStatus().subscribe(data => {
      this.pipelineStatus = data;
      let t = new MatTabChangeEvent()
      t.index = this.currentTabIndex;
      this.changeTab(t);
    });
  }

  getTotalObj(hostname: string): Object {
    return this.totals[hostname];
  }

  private _getNodeIndex(nodeObj: Object){
    for (let index =0; index < this.nodeStatuses.data.length; index++){
      if (nodeObj["metadata"]["name"] === this.nodeStatuses.data[index]["metadata"]["name"]){
        return index;
      }
    }
    return -1;
  }

  private _getPodIndex(nodeObj: Object){
    for (let index =0; index < this.podsStatuses.data.length; index++){
      if (nodeObj["metadata"]["name"] === this.podsStatuses.data[index]["metadata"]["name"]){
        return index;
      }
    }
    return -1;
  }

  toggleNodeResources(nodeObj: Object) {
    let index = this._getNodeIndex(nodeObj);
    if (index !== -1)
      this.isNodeResourcesVisible[index] = !this.isNodeResourcesVisible[index];
  }

  isNodeResourceVisible(nodeObj: Object): boolean {
    let index = this._getNodeIndex(nodeObj);
    if (index !== -1)
      return this.isNodeResourcesVisible[index];
    return false;
  }

  togglePodDropDown(podObj: Object){
    let index = this._getPodIndex(podObj);
    if (index !== -1)
      this.isPodResourcesVisible[index] = !this.isPodResourcesVisible[index];
  }

  isPodResourceVisible(podObj: Object): boolean {
    let index = this._getPodIndex(podObj);
    if (index !== -1)
      return this.isPodResourcesVisible[index];
    return false
  }

  changeTab(tab: MatTabChangeEvent){
    this.currentTabIndex = tab.index;
    let node = this.nodeStatuses.data[tab.index];
    let ret_val = [];
    if (node){
      let ipAddress = this.nodeStatuses.data[tab.index]["metadata"]["public_ip"];
      for (let pod of this.allPodeStatuses){
        if (ipAddress === pod["status"]["host_ip"]){
          ret_val.push(pod);
        }
      }
      if (this.pipelineStatus){
        this.displayedPipeline = this.pipelineStatus[this.nodeStatuses.data[tab.index]["metadata"]["name"]];
      }
    } else {
      for (let pod of this.allPodeStatuses){
        if (pod["status"]["host_ip"] === undefined ||
            pod["status"]["host_ip"] === null){
          ret_val.push(pod);
        }
      }
      this.displayedPipeline = null;
    }
    this.podsStatuses.data = ret_val;
    this.isPodResourcesVisible = new Array(this.podsStatuses.data.length).fill(false);
  }

  performSystemsCheck(){
    this._refreshHealthPage();
  }

  openConsole(){
    this.router.navigate(['/stdout/SystemsCheck'])
  }

  describePod(podMetadata: any) {
    this.healthSrv.describePod(podMetadata.name, podMetadata.namespace).subscribe(data => {
      this.dialog.open(ModalDialogDisplayMatComponent, {
        width: MODAL_SIZE,
        data: { title: podMetadata.name, info: data['stdout']}
      });
    });
  }

  describeNode(nodeName: string) {
    this.healthSrv.describeNode(nodeName).subscribe(data => {
      this.dialog.open(ModalDialogDisplayMatComponent, {
        width: MODAL_SIZE,
        data: { title: nodeName, info: data['stdout']}
      });
    })
  }

  openNodeInfo(nodeName: string, nodeInfo: Object){
    this.dialog.open(ModalDialogDisplayMatComponent, {
      width: MODAL_SIZE,
      data: { title: nodeName + " info", info: JSON.stringify(nodeInfo, null, 2).trim()}
    });
  }

  openPodStatusInfo(podName: string, podStatusInfo: Object){
    this.dialog.open(ModalDialogDisplayMatComponent, {
      width: MODAL_SIZE,
      data: { title: podName + " status", info: JSON.stringify(podStatusInfo, null, 2).trim()}
    });
  }

  getContainerRestartCount(pod: Object){
    if (pod['status']['container_statuses']){
      return pod['status']['container_statuses'][0]['restart_count'];
    } else {
      return "N/A"
    }
  }

  getPostStatus(stateObj: Object): Array<{name: string, status: string}> {
    let retVal: Array<{name: string, status: string}> = [];

    if (stateObj["phase"] === "Pending"){
      let item = {name: '', status: 'Pending'};
      retVal.push(item);
      return retVal;
    }

    let containerStatuses = stateObj['container_statuses'];
    if (containerStatuses){
      for (let status of containerStatuses){
        let item = {name: '', status: ''};
        for (let key in status['state']) {
          if (stateObj['reason']){
            item['status'] = stateObj['reason'];
            if (stateObj['message']){
              item['status'] = item['status'].concat(stateObj['message']);
            }
          } else if (status['state'][key]){
            item['name'] = status['name'];
            item['status'] = item['status'].concat(key);
            if (status['state'][key]['message']){
              item['status'] = item['status'].concat(": " + status['state'][key]['message']);
            }
          }
        }
        retVal.push(item);
      }
    }
    return retVal;
  }

  getRequest(container: Object, key: string): string {
    if (container){
      if (container['resources']) {
        if (container['resources']['requests']) {
          if (container['resources']['requests'][key]){
            return container['resources']['requests'][key];
          }
        }
      }
    }
    return "Not Set";
  }

  getLimit(container: Object, key: string): string {
    if (container){
      if (container['resources']) {
        if (container['resources']['limits']) {
          if (container['resources']['limits'][key]){
            return container['resources']['limits'][key];
          }
        }
      }
    }
    return "Not Set";
  }
}
