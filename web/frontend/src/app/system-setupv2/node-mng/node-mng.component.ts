import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { ConfirmDailogComponent } from '../../confirm-dailog/confirm-dailog.component';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddNodeDialog } from '../add-node-dialog/add-node-dialog.component';
import { NodeInfoDialog } from '../node-info-dialog/node-info-dialog.component';
import { DoubleConfirmDialogComponent } from 'src/app/double-confirm-dialog/double-confirm-dialog.component';
import { FormGroup } from '@angular/forms';
import { KitSettingsService } from '../services/kit-settings.service';
import { WebsocketService } from '../../services/websocket.service';
import { Node, MIP, Job, KitStatus, Settings } from '../models/kit';
import * as FileSaver from 'file-saver';
import { CatalogService } from '../../catalog/services/catalog.service';


const DIALOG_WIDTH = "800px";

@Component({
  selector: 'app-node-mng',
  templateUrl: './node-mng.component.html',
  styleUrls: ['./node-mng.component.css']
})
export class NodeManagementComponent implements OnInit {
  nodesColumns = ['hostname', 'ip_address', 'node_type', 'deployment_type', 'state', 'actions']
  setupNodesColumns = ['hostname', 'node_type', 'state']
  nodes: Node[] = [];
  controlPlaneNodes: any[] = [];
  controllerMaintainer: boolean;
  public ioConnection: any;

  isoSensorExists: boolean = false;
  kitStatus: Partial<KitStatus> = {};
  kitSettings: Partial<Settings> = {};
  buttonisDisabled: boolean = true;

  constructor(public _WebsocketService:WebsocketService,
              private title: Title,
              private matSnackBarSrv: MatSnackBarService,
              private userService: UserService,
              private router: Router,
              private dialog: MatDialog,
              private kitSettingsSvc: KitSettingsService,
              private _CatalogService: CatalogService) {
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  private socketRefresh(){
    this._WebsocketService.getSocket().on('node-state-change', (data: any) => {
      this.refreshNodes(data)

    });
    this._WebsocketService.getSocket().on('kit-status-change', (data: any) => {
      this.kitStatus = data
    });
  }

  public disabledRKbutton(){
    if (!this.kitStatus.base_kit_deployed && this.kitStatus.jobs_running){
      return true;
    }
    else if (this.kitStatus.base_kit_deployed){
      return false;
    }
    return true;
  };

  public disableSCPbutton(){
    if (!this.kitStatus.control_plane_deployed && this.kitStatus.esxi_settings_configured && this.kitStatus.kit_settings_configured){
      if (!this.kitStatus.jobs_running) {
        return false;
      }
    }
    return true;
  };

  public disableAddNodeButton(){
    if (this.kitStatus.control_plane_deployed && !this.kitStatus.deploy_kit_running){
        return false;
    }
    return true;
  };

  disableDeployKitButton(){
    if (!this.kitStatus.jobs_running && this.kitStatus.ready_to_deploy){
      return false;
    }
    return true;
  }

  private getKitStatus(){
    this.kitSettingsSvc.getKitStatus().subscribe((data: KitStatus) => {
      this.kitStatus = data;
    });
  }

  private getNodeData(){
    const nodesArray = [];
    const cpArray = [];
      this.kitSettingsSvc.getNodes().subscribe((data: Node[]) => {
        this.refreshNodes(data);
      })
  }

  private refreshNodes(data: Node[]){
    const nodesArray = [];
    const cpArray = [];
    for (var node of data){
      for (var job of node.jobs){
        if (job.name == "deploy") node.isDeployed = this.getCurrentStatus(job) == "Complete"
        if (job.name == "remove") node.isRemoving = true;
      }
      if (node.deployment_type == "Iso") this.isoSensorExists = true;
      if (node.node_type == "Control-Plane" || node.node_type == "Minio"){
        cpArray.push(node)
      }
      else if (node.node_type != "MIP")
      {
        nodesArray.push(node)
      }
    }
    this.controlPlaneNodes = cpArray
    this.nodes = nodesArray
  }

  ngOnInit() {
    this.title.setTitle("Node Management");
    this.socketRefresh();
    this.getKitStatus();
    this.getNodeData();

    this.kitSettingsSvc.getKitSettings().subscribe((data) => {
      this.kitSettings = data;
    })
  }

  canGatherFacts(node: Node): boolean{
    if (node.isDeployed) return true;
    return false
  }

  updateGatherFacts(node: Node){
    this.kitSettingsSvc.updateGatherFacts(node.hostname).subscribe(data => {
      this.matSnackBarSrv.displaySnackBar(`Device facts job started for ${node.hostname} \
        Check Notifications for results.`);
    });
  }

  isJobRunningButtonGroup(node: Node): boolean {
    return false;
  }

  isISOButtonGroup(node: Node){
    if (node.node_type == "Sensor" && node.deployment_type == "Iso") return true;
    return false;
  }

  canDeleteNode(node: Node){
    if (node.node_type == "Sensor" || node.node_type == "Service") return true;
    if (node.node_type == "Server" && !node.isDeployed) return true;
    return false;
  }

  isErrorButtonGroup(node: Node): boolean {
    return false;
  }

  addNode(){
    const dialogRef = this.dialog.open(AddNodeDialog, {
      width: DIALOG_WIDTH,
      data: "Blank"
    });

    dialogRef.afterClosed().subscribe(result => {
        let form = result as FormGroup;
        if (form && form.valid){

          //this.matSnackBarSrv.displaySnackBar("TODO Stubbed out call Implement later.");

          this.kitSettingsSvc.addNode(form.value).subscribe(data => {

          })

        }
      err => {
          console.error(err);
        };
    });
  }

  showNodeInfo(node){
    // console.log(node);
    this.dialog.open(NodeInfoDialog, {
      width: DIALOG_WIDTH,
      data: node
    });

    // dialogRef.afterClosed().subscribe(result => {

    // });
  }

  stopNodeJob(node: Node){
    const option2 = "Confirm";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: DIALOG_WIDTH,
      data: {
        paneString: `Are you sure you want to cancel the ${node} job on ${node.hostname} ?`,
        paneTitle: `Stop ${node} on ${node.hostname}?`,
        option1: "Cancel",
        option2: option2
      },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        //TODO we need to delete the node here and unjoin it from kubernetes cluster.
        this.matSnackBarSrv.displaySnackBar('TODO stubbed out stopNodeJob()');
      }
    });
  }

  retryNodeJob(node: Node){
    const option2 = "Confirm";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: DIALOG_WIDTH,
      data: {
        paneString: `Are you sure you want to rerun the failed job on ${node.hostname} ?`,
        paneTitle: `Rerun job on ${node.hostname}?`,
        option1: "Cancel",
        option2: option2
      },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        //TODO we need to delete the node here and unjoin it from kubernetes cluster.
        this.matSnackBarSrv.displaySnackBar('TODO stubbed out retryNodeJob()');
      }
    });
  }

  downloadISO(){
    const ISOurl = document.createElement('a');
    ISOurl.setAttribute('target', '_blank');
    ISOurl.setAttribute('href', `http://dip-controller.${this.kitSettings.domain}/offlinerepo/tfplenum/dip-virtual-sensor.iso`);
    ISOurl.setAttribute('download', `dip-virtual-sensor.iso`);
    document.body.appendChild(ISOurl);
    ISOurl.click();
    ISOurl.remove();
  }

  downloadOpenVPNCerts(node: Node){
    this.kitSettingsSvc.getNodeVpnConfig(node.hostname).subscribe(data => {
      let config_blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(config_blob, `${node.hostname}.conf`);
      this.matSnackBarSrv.displaySnackBar(`Downloading VPN Config for ${node.hostname}`);
    })
  }

  getVpnStatus(node: Node){
    if (node.node_type == "Sensor" && node.deployment_type == "Iso"){
      if (node.vpn_status) return true; else return false;
    }
    if (node.vpn_status){
      return false;
    }
  }

  public openConsole(job_id: string=""): void {
    this.router.navigate([`/stdout/${job_id}`]);
  }

  redeployKit(){
    const option2 = "Confirm";
    const dialogRef = this.dialog.open(DoubleConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: {
        paneString: 'This operation will destroy the cluster and rebuild it.  \n\n \
                     The cluster will start fresh after this operation is completed. \n\n \
                     Are you sure you want to do this? It so, please type REDEPLOY and then click Confirm to perform this operation',
        paneTitle: 'Redeploy Kit Operation',
        option1: "Cancel",
        option2: option2,
        doubleConfirmText: "REDEPLOY"
      },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        this.kitSettingsSvc.deployKit().subscribe(data => {
          const job_id = data['job_id'];
          this.router.navigate([`/stdout/${job_id}`]);
        });
      }
    });
  }

  deployKit(){
    if (this.kitStatus.base_kit_deployed){
      this.redeployKit();
    }
    else {
      this.kitSettingsSvc.deployKit().subscribe(data => {
        const job_id = data['job_id'];
        this.router.navigate([`/stdout/${job_id}`]);
      });
    }
  }

  getCurrentStatus(job: Job): string {
    if (job.error) return "Error"
    if (job.complete) return "Complete"
    if (job.inprogress) return "In Progress"
    if (job.pending) return "Pending"
    return "Unknown"
  }

  refreshKit(){
    const option2 = "Confirm";
    const dialogRef = this.dialog.open(DoubleConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: {
        paneString: 'This operation will destroy the control plane nodes and rebuild them.  \
                     The Kubernetes cluster will start fresh after this operation is completed. \n\n \
                     **All sensors will be removed during this process.** \n\n \
                     Are you sure you want to do this? It so, please type REFRESH and then click Confirm to perform this operation',
        paneTitle: 'Refresh Kit Operation',
        option1: "Cancel",
        option2: option2,
        doubleConfirmText: "REFRESH"
      },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        //TODO this method is currently stubbed out to be used to call REST
        this.kitSettingsSvc.refreshKit().subscribe(data => {
          console.log(data)
        })
      }
    });
  }

  setupCtrlPlane(){
    this.kitSettingsSvc.setupControlPlane().subscribe(data => {
      console.log(data);
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

  removeNodeDialog(node: Node, installed_apps){
    let message = `Are you sure you want delete ${node.hostname}?`
    if(installed_apps.length > 0){
      message = `${message}\n\n \
      The following applications will be uninstalled: \n ${installed_apps}`;
    }
    const title = `Delete ${node.hostname}?`;
    const option2 = "Confirm";
    const option1 = "Cancel";

    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: '35%',
      data: { "paneString": message, "paneTitle": title, "option1": option1, "option2": option2 },
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        this.kitSettingsSvc.deleteNode(node.hostname).subscribe(data => {
          node.isRemoving = true;
          //if (data && "job_id" in data){
          //  const job_id = data['job_id'];
          //  this.router.navigate([`/stdout/${job_id}`]);
          //}
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
     public canRemove(node: Node): void {
      let installed_apps = [];
      this._CatalogService.getinstalledapps(node.hostname).subscribe(result => {
        let result_casted = result as [];
        if( result_casted !== null && result_casted.length > 0 ) {
          for (const app of result_casted){
            installed_apps.push(app["application"])
          }
        }
        this.removeNodeDialog(node, installed_apps)
      });
    }
}