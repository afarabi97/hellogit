import { Component, OnInit } from '@angular/core';
import { HealthServiceService } from '../health-service.service';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HtmlModalPopUp, ModalType } from '../html-elements';

declare var $: any;

@Component({
  selector: 'app-system-health',
  templateUrl: './system-health.component.html',
  styleUrls: ['./system-health.component.css']
})
export class SystemHealthComponent implements OnInit {
  podsStatuses: Array<Object>;
  nodeStatuses: Array<Object>;
  podDescribeModal: HtmlModalPopUp;
  activeIPAddress: string;

  constructor(private title: Title, private healthSrv: HealthServiceService, private router: Router) {
    this.podDescribeModal = new HtmlModalPopUp('pod_describe');
    this.activeIPAddress = "";
  }

  ngOnInit() {
    this.title.setTitle("System Health");

    this.healthSrv.getPodsStatuses().subscribe(data => {
      this.podsStatuses = data as Array<Object>;
    });

    this.healthSrv.getNodeStatuses().subscribe(data => {
      this.nodeStatuses = data as Array<Object>;
      if (this.nodeStatuses && this.nodeStatuses.length > 0) {
        this.activeIPAddress = this.nodeStatuses[0]['metadata']['public_ip'];
      }
    });

    setTimeout(() => {
      this.updateTooltips();
    }, 2000);
  }

  setActiveIp(ipAddress: string){
    if (ipAddress) {
      this.activeIPAddress = ipAddress;
    } else {
      this.activeIPAddress = null;
    }
  }

  isActiveNodeTab(ipAddress: string): boolean{
    return this.activeIPAddress === ipAddress;
  }

  private updateTooltips(){
    let selector = $('[data-toggle="tooltip"]');
    selector.tooltip();
  }

  performSystemsCheck(){
    this.healthSrv.performSystemsCheck()
      .subscribe(data => {
        this.openConsole();
    });
  }

  openConsole(){
    this.router.navigate(['/stdout/SystemsCheck'])
  }

  describePod(podMetadata: any) {
    this.healthSrv.describePod(podMetadata.name, podMetadata.namespace).subscribe(data => {
      this.podDescribeModal.updateModal(podMetadata.name, data['stdout'], 'Close', undefined, ModalType.code);
      this.podDescribeModal.openModal();
    });
  }

  describeNode(nodeName: string) {
    this.healthSrv.describeNode(nodeName).subscribe(data => {
      this.podDescribeModal.updateModal(nodeName, data['stdout'], 'Close', undefined, ModalType.code);
      this.podDescribeModal.openModal();
    })
  }

  openNodeInfo(nodeName: string, nodeInfo: Object){
    this.podDescribeModal.updateModal(nodeName + " info", JSON.stringify(nodeInfo, null, 2).trim(), 'Close', undefined, ModalType.code);
    this.podDescribeModal.openModal();
  }

  openPodStatusInfo(podName: string, podStatusInfo: Object){
    this.podDescribeModal.updateModal(podName + " status", JSON.stringify(podStatusInfo, null, 2).trim(), 'Close', undefined, ModalType.code);
    this.podDescribeModal.openModal();
  }

  getPostStatus(stateObj: Object): Array<{name: string, status: string}> {
    let retVal: Array<{name: string, status: string}> = [];

    if (stateObj["phase"] === "Pending"){
      let item = {name: '', status: 'Pending'};
      retVal.push(item);
      return retVal;
    }

    let containerStatuses = stateObj['container_statuses'];
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
    return retVal;
  }
}
