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
  podStatus: Object;
  unscheduledPodStatus: MatTableDataSource<Array<Object>>;
  podErrors: MatTableDataSource<Array<Object>>;
  nodeStatuses: MatTableDataSource<Array<Object>>;
  totals: Object;

  @ViewChild('nodeStatusesTable') nodeTable: MatTable<any>;

  pipelineStatus: Object;

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

    // Refresh the page every 15 seconds with the new health data.
    this.updateSubscription = interval(15000).subscribe((val) => {
      this._reloadHealthPage();
    });
  }

  ngOnDestroy() {
    this.updateSubscription.unsubscribe();
  }

  private _reloadPodErrors(pods){
    let podErrors = pods.filter(pod => {
      let podStatus = pod['status'];
      let containers = this.getPodStatus(podStatus);
      let hasError = containers.some(container => {
        return container['status'] !== 'running';
      });
      return hasError;
    });

    this.podErrors = new MatTableDataSource<Array<Object>>(podErrors);
  }

  private _getLookup(nodes: Object) {
    let lookup = {};

    for (let node in nodes) {

      let address = nodes[node]["metadata"]["public_ip"];
      let hostname = nodes[node]["metadata"]["name"];

      lookup[address] = hostname;
    }

    return lookup;
  }

  private _getPodStatusTabData(pods, lookup) {
    let podStatus = {};
    let unscheduledPodStatus = [];

    for (let pod of pods) {
        let host_ip = pod["status"]["host_ip"];
        if (host_ip) {
          let hostname = lookup[host_ip];
          if (hostname in podStatus) {
            podStatus[hostname].push(pod);
          } else {
            podStatus[hostname] = [pod];
          }
        } else {
          unscheduledPodStatus.push(pod);
        }
    }

    let _podStatus = {};
    for (let key in podStatus) {
      _podStatus[key] = new MatTableDataSource<Array<Object>>(podStatus[key]);
    }

    let _unscheduledPodStatus = new MatTableDataSource<Array<Object>>(unscheduledPodStatus);

    let _tabs = new Array<string>();
    for (let node in _podStatus){
      _tabs.push(node);
    }

    let result: [Object, MatTableDataSource<Array<Object>>, Array<string>];
    result = [_podStatus, _unscheduledPodStatus, _tabs];
    return result;
  }


  private _reloadHealthPage() {
    this.healthSrv.getHealthStatus().subscribe(data => {
      let nodes = data['node_info'];
      this.nodeStatuses = new MatTableDataSource<Array<Object>>(nodes);

      this.isNodeResourcesVisible = new Array(this.nodeStatuses.data.length).fill(false);
      this.totals = data['totals'] as Object;

      let pods = data['pod_info'];
      this._reloadPodErrors(pods);

      let lookup = this._getLookup(nodes);
      let tab_data = this._getPodStatusTabData(pods, lookup);
      this.podStatus = tab_data[0];
      this.unscheduledPodStatus = tab_data[1];
      this.tabs_names = tab_data[2].sort();
    });

    this.healthSrv.getPipelineStatus().subscribe(data => {
      this.pipelineStatus = data;
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
      return "N/A";
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
