import { Component, OnInit } from '@angular/core';
import { HealthServiceService } from './health-service.service';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogDisplayMatComponent } from '../modal-dialog-display-mat/modal-dialog-display-mat.component';
import { MatTabChangeEvent } from '@angular/material';
import { interval, Subscription } from 'rxjs';
import { ModalTableComponent } from './table-dialog/modal-table.component';
import {MatTable} from '@angular/material';
import { ViewChild } from '@angular/core';

const MODAL_SIZE ='900px';

@Component({
  selector: 'app-system-health',
  templateUrl: './system-health.component.html',
  styleUrls: ['./system-health.component.css']
})
export class SystemHealthComponent implements OnInit {
  columnsForNodeStatues: string[] = ['name', 'type', 'ip_address',
                                     'ready', 'storage', 'memory', 'cpu', 'actions'];

  columnsForPodStatues: string[] = ['namespace', 'pod_name', 'container_states',
                                    'restart_count', 'actions'];

  tabs_names: Array<string>;
  allPodeStatuses: Array<Object>;
  podsStatuses: MatTableDataSource<Array<Object>>;
  podErrors: MatTableDataSource<Array<Object>>;
  nodeStatuses: MatTableDataSource<Array<Object>>;
  totals: Object;

  @ViewChild('nodeStatusesTable') nodeTable: MatTable<any>;

  pipelineStatus: Object;
  displayedPipeline: Object;

  isNodeResourcesVisible: Array<boolean>;
  currentTabIndex: number;

  private updateSubscription: Subscription;


  constructor(private title: Title,
              private healthSrv: HealthServiceService,
              private router: Router,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.title.setTitle("System Health");
    this.currentTabIndex = 0;
    this._reloadHealthPage();

    //Refresh the page every 15 seconds with the new health data.
    this.updateSubscription = interval(15000).subscribe((val) => {
      this._refreshHealthPage();
    });
  }

  ngOnDestroy() {
    this.updateSubscription.unsubscribe();
  }

  private _reloadPodErrors(data: Object){
    this.podErrors = new MatTableDataSource<Array<Object>>();

    for (let item of data['pod_info']){
      for (let container of this.getPodStatus(item["status"])){
        if (container.status !== "running"){
          this.podErrors.data.push(item);
          break;
        }
      }
    }
  }

  private _reloadHealthPage(){
    this.healthSrv.getHealthStatus().subscribe(data => {
      this.allPodeStatuses = data['pod_info'];
      this._reloadPodErrors(data);
      this.podsStatuses = new MatTableDataSource<Array<Object>>(data['pod_info']);
      this.nodeStatuses = new MatTableDataSource<Array<Object>>(data['node_info']);
      this.isNodeResourcesVisible = new Array(this.nodeStatuses.data.length).fill(false);
      this.totals = data['totals'] as Object;

      this.tabs_names = new Array<string>();
      for (let node of data['node_info']){
        this.tabs_names.push(node['metadata']['name'])
      }
      this.tabs_names.push("Unassigned Pods");
    });

    // this.healthSrv.getPipelineStatus().subscribe(data => {
    //   this.pipelineStatus = data;
    //   let t = new MatTabChangeEvent()
    //   t.index = this.currentTabIndex;
    //   this.changeTab(t);
    // });
  }

  private _spliceInArray(newStuff: Array<any>, oldStuff: Array<any>){
    outer:
    for (let item of newStuff){
      for (let index = 0; index < oldStuff.length; index++){
        let oldStatus = oldStuff[index];
        if (item["metadata"]["name"] === oldStatus["metadata"]["name"])  {
          oldStuff.splice(index, 1, item);
          continue outer;
        }
      }
    }
  }

  private _refreshHealthPage(){
    this.healthSrv.getHealthStatus().subscribe(data => {
      this._reloadPodErrors(data);
      this.totals = data['totals'] as Object;
      if (data['pod_info'].length === this.allPodeStatuses.length &&
          data['node_info'].length === this.nodeStatuses.data.length )
      {
        this._spliceInArray(data['node_info'], this.nodeStatuses.data);
        this._spliceInArray(data['pod_info'], this.allPodeStatuses);
        this._spliceInArray(data['pod_info'], this.podsStatuses.data);
        this.nodeTable.renderRows();
      } else {
        this._reloadHealthPage();
      }
    });

    // this.healthSrv.getPipelineStatus().subscribe(data => {
    //   if (this.pipelineStatus){
    //     for (let key in data){
    //       for (let innerKey in data[key]){
    //         this.pipelineStatus[key][innerKey] = data[key][innerKey];
    //       }
    //     }
    //   } else {
    //     this.pipelineStatus = data;
    //   }
    // });
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

  openPodDialog(podObj: Object){
    this.dialog.open(ModalTableComponent, {
      width: MODAL_SIZE,
      data: { title: podObj["metadata"]["name"], pod: podObj}
    });
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

  getPodStatus(stateObj: Object): Array<{name: string, status: string}> {
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
}
