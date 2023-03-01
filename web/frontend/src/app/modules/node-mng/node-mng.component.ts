import { Component, OnInit, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import * as FileSaver from 'file-saver';

import { JobClass, KitSettingsClass, KitStatusClass, NodeClass } from '../../classes';
import { ConfirmDialogMatDialogDataInterface, ServerStdoutMatDialogDataInterface } from '../../interfaces';
import { CatalogService } from '../../services/catalog.service';
import { KitSettingsService } from '../../services/kit-settings.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { UserService } from '../../services/user.service';
import { WebsocketService } from '../../services/websocket.service';
import { ConfirmDialogComponent } from '../global-components/components/confirm-dialog/confirm-dialog.component';
import { NodeInfoDialogComponent } from '../global-components/components/node-info-dialog/node-info-dialog.component';
import {
  NodeStateProgressBarComponent
} from '../global-components/components/node-state-progress-bar/node-state-progress-bar.component';
import { ServerStdoutComponent } from '../server-stdout/server-stdout.component';
import { AddNodeDialogComponent } from './components/add-node-dialog/add-node-dialog.component';
import { CertInstallDialogComponent } from './components/cert-install-dialog/cert-install-dialog.component';


const DIALOG_WIDTH = '1000px';

@Component({
  selector: 'app-node-mng',
  templateUrl: './node-mng.component.html'
})
export class NodeManagementComponent implements OnInit {
  // Used by a parent component
  @ViewChildren('progressCircles') public progress_circles: NodeStateProgressBarComponent[];
  nodesColumns = ['hostname', 'ip_address', 'node_type', 'deployment_type', 'state', 'actions'];
  setupNodesColumns = ['hostname', 'node_type', 'state'];
  nodes: NodeClass[] = [];
  controlPlaneNodes: any[] = [];
  controllerMaintainer: boolean;
  ioConnection: any;
  isoSensorExists: boolean = false;
  kitStatus: Partial<KitStatusClass> = {};
  kitSettings: Partial<KitSettingsClass> = {};
  buttonisDisabled: boolean = true;

  constructor(public _WebsocketService:WebsocketService,
              private title: Title,
              private matSnackBarSrv: MatSnackBarService,
              private userService: UserService,
              private dialog: MatDialog,
              private kitSettingsSvc: KitSettingsService,
              private _CatalogService: CatalogService) {
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  disabledRKbutton(){
    if (!this.kitStatus.base_kit_deployed && this.kitStatus.jobs_running){
      return true;
    } else if (this.kitStatus.base_kit_deployed){
      return false;
    }
    return true;
  };

  disableSCPbutton(){
    if (!this.kitStatus.control_plane_deployed && this.kitStatus.esxi_settings_configured && this.kitStatus.kit_settings_configured){
      if (!this.kitStatus.jobs_running) {
        return false;
      }
    }
    return true;
  };

  disableAddNodeButton(){
    return this.kitStatus.deploy_kit_running;
  }

  disableDeployKitButton(){
    if (!this.kitStatus.jobs_running && this.kitStatus.ready_to_deploy){
      return false;
    }
    return true;
  }

  ngOnInit() {
    this.title.setTitle('Node Management');
    this.socketRefresh();
    this.getKitStatus();
    this.getNodeData();

    this.kitSettingsSvc.getKitSettings().subscribe((data) => {
      this.kitSettings = data;
    });
  }

  canGatherFacts(node: NodeClass): boolean{
    if (node.isDeployed) {
      return true;
    }
    return false;
  }

  updateGatherFacts(node: NodeClass){
    this.kitSettingsSvc.updateGatherFacts(node.hostname).subscribe(data => {
      this.matSnackBarSrv.displaySnackBar(`Device facts job started for ${node.hostname} \
        Check Notifications for results.`);
    });
  }

  canDownloadCert(node: NodeClass): boolean{
    if (node.isDeployed &&
        node.node_type === "LTAC") {
      return true;
    }
    return false;
  }

  isJobRunningButtonGroup(node: NodeClass): boolean {
    return false;
  }

  isISOButtonGroup(node: NodeClass){
    if (node.node_type === 'Sensor' && node.deployment_type === 'Iso') {
      return true;
    }
    return false;
  }

  canDeleteNode(node: NodeClass){
    if (node.node_type === 'Sensor' ||
        node.node_type === 'Service' ||
        node.node_type === "MinIO" ||
        node.node_type === "LTAC") {
      return true;
    }
    if (node.node_type === 'Server' && !node.isDeployed) {
      return true;
    }
    return false;
  }

  addNode(){
    const dialogRef = this.dialog.open(AddNodeDialogComponent, {
      width: DIALOG_WIDTH,
      data: 'Blank'
    });
  }

  showNodeInfo(node: NodeClass) {
    this.dialog.open(NodeInfoDialogComponent, {
      width: DIALOG_WIDTH,
      data: node
    });
  }

  stopNodeJob(node: NodeClass) {
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: `Stop ${node} on ${node.hostname}?`,
      message: `Are you sure you want to cancel the ${node} job on ${node.hostname}?`,
      option1: 'Cancel',
      option2: 'Confirm'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: confirm_dialog
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === confirm_dialog.option2) {
        //TODO we need to delete the node here and unjoin it from kubernetes cluster.
        this.matSnackBarSrv.displaySnackBar('TODO stubbed out stopNodeJob()');
      }
    });
  }

  retryNodeJob(node: NodeClass) {
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: `Rerun job on ${node.hostname}?`,
      message: `Are you sure you want to rerun the failed job on ${node.hostname}?`,
      option1: 'Cancel',
      option2: 'Confirm'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: confirm_dialog
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === confirm_dialog.option2) {
        //TODO we need to delete the node here and unjoin it from kubernetes cluster.
        this.matSnackBarSrv.displaySnackBar('TODO stubbed out retryNodeJob()');
      }
    });
  }

  downloadCert(node: NodeClass){
    const dialogRef = this.dialog.open(CertInstallDialogComponent, {
      data: node
    });
  }

  downloadISO(){
    const ISOurl = document.createElement('a');
    ISOurl.setAttribute('target', '_blank');
    ISOurl.setAttribute('href', '/assets/dip-virtual-sensor.iso');
    ISOurl.setAttribute('download', 'dip-virtual-sensor.iso');
    document.body.appendChild(ISOurl);
    ISOurl.click();
    ISOurl.remove();
  }

  downloadOpenVPNCerts(node: NodeClass){
    this.kitSettingsSvc.getNodeVpnConfig(node.hostname).subscribe(data => {
      const config_blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(config_blob, `${node.hostname}.conf`);
      this.matSnackBarSrv.displaySnackBar(`Downloading VPN Config for ${node.hostname}`);
    });
  }

  getVpnStatus(node: NodeClass){
    if (node.node_type === 'Sensor' && node.deployment_type === 'Iso'){
      if (node.vpn_status) {
        return true;
      } else {
        return false;
      }
    }
    if (node.vpn_status){
      return false;
    }
  }

  open_job_server_std_out_console(job_id: string): void {
    const server_stdout_mat_dialog_data: ServerStdoutMatDialogDataInterface = {
      job_id: job_id
    };
    this.dialog.open(ServerStdoutComponent, {
      height: '90vh',
      width: '75vw',
      data: server_stdout_mat_dialog_data
    });
  }

  redeployKit(){
    const option2 = 'Confirm';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: {
        message: 'This operation will destroy the cluster and rebuild it.  \n\n \
                  The cluster will start fresh after this operation is completed. \n\n \
                  Are you sure you want to do this? It so, please type REDEPLOY and then click Confirm to perform this operation',
        title: 'Redeploy Kit Operation',
        option1: 'Cancel',
        option2: option2,
        message_double_confirm: 'REDEPLOY'
      },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        this.kitSettingsSvc.deployKit().subscribe(data => {
          const job_id = data['job_id'];
          this.open_job_server_std_out_console(job_id);
        });
      }
    });
  }

  deployKit(){
    if (this.kitStatus.base_kit_deployed){
      this.redeployKit();
    } else {
      this.kitSettingsSvc.deployKit().subscribe(data => {
        const job_id = data['job_id'];
        this.open_job_server_std_out_console(job_id);
      });
    }
  }

  getCurrentStatus(job: JobClass): string {
    if (job.error) {
      return 'Error';
    }
    if (job.complete) {
      return 'Complete';
    }
    if (job.inprogress) {
      return 'In Progress';
    }
    if (job.pending) {
      return 'Pending';
    }
    return 'Unknown';
  }

  refreshKit(){
    const option2 = 'Confirm';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: {
        message: 'This operation will destroy the control plane nodes and rebuild them.  \
                  The Kubernetes cluster will start fresh after this operation is completed. \n\n \
                  **All sensors will be removed during this process.** \n\n \
                  Are you sure you want to do this? It so, please type REFRESH and then click Confirm to perform this operation',
        title: 'Refresh Kit Operation',
        option1: 'Cancel',
        option2: option2,
        message_double_confirm: 'REFRESH'
      },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        //TODO this method is currently stubbed out to be used to call REST
        this.kitSettingsSvc.refreshKit().subscribe(data => {
        });
      }
    });
  }

  setupCtrlPlane(){
    this.kitSettingsSvc.setupControlPlane().subscribe(data => {
    });
  }

  isBaseKitDeployed(): boolean{
    if (this.kitStatus){
      return this.kitStatus.base_kit_deployed;
    }
    return false;
  }

  isDeployKitRunning(): boolean{
    if (this.kitStatus){
      return this.kitStatus.deploy_kit_running;
    }
    return false;
  }

  removeNodeDialog(node: NodeClass, installed_apps){
    let message = `Are you sure you want delete ${node.hostname}?`;
    if(installed_apps.length > 0){
      message = `${message}\n\n \
      The following applications will be uninstalled: \n ${installed_apps}`;
    }
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: `Delete ${node.hostname}?`,
      message: message,
      option1: 'Cancel',
      option2: 'Confirm'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '35%',
      data: confirm_dialog,
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response === confirm_dialog.option2) {
        this.kitSettingsSvc.deleteNode(node.hostname).subscribe(data => {
          node.isRemoving = true;
        });
      }
    });
  }

    /**
   * Checks to see if there are any installed applications on the node
   *
   * @param {number} index
   * @memberof KitFormComponent
   */
  canRemove(node: NodeClass): void {
    const installed_apps = [];
    this._CatalogService.get_installed_apps(node.hostname).subscribe(result => {
      const result_casted = result as [];
      if( result_casted !== null && result_casted.length > 0 ) {
        for (const app of result_casted){
          installed_apps.push(app['application']);
        }
      }
      this.removeNodeDialog(node, installed_apps);
    });
  }

  private socketRefresh(){
    this._WebsocketService.getSocket().on('node-state-change', (data: any) => {
      this.refreshNodes(data);

    });
    this._WebsocketService.getSocket().on('kit-status-change', (data: any) => {
      this.kitStatus = data;
    });
  }

  private getKitStatus(){
    this.kitSettingsSvc.getKitStatus().subscribe((data: KitStatusClass) => {
      this.kitStatus = data;
    });
  }

  private getNodeData(){
      this.kitSettingsSvc.getNodes().subscribe((data: NodeClass[]) => {
        this.refreshNodes(data);
      });
  }

  private refreshNodes(data: NodeClass[]){
    const nodesArray = [];
    const cpArray = [];
    for (const node of data){
      for (const job of node.jobs){
        if (job.name === 'deploy') {
          node.isDeployed = this.getCurrentStatus(job) === 'Complete';
        }
        if (job.name === 'remove') {
          node.isRemoving = true;
        }
      }
      if (node.deployment_type === 'Iso') {
        this.isoSensorExists = true;
      }
      if (node.node_type === 'Control-Plane' || node.node_type === 'Minio'){
        cpArray.push(node);
      } else if (node.node_type !== 'MIP') {
        nodesArray.push(node);
      }
    }
    this.controlPlaneNodes = cpArray;
    this.nodes = nodesArray;
  }
}
