import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { ConfirmDailogComponent } from '../../confirm-dailog/confirm-dailog.component';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddMipDialog } from '../add-mip-dialog/add-mip-dialog.component';
import { NodeInfoDialog } from '../node-info-dialog/node-info-dialog.component';
import { FormGroup } from '@angular/forms';
import { KitSettingsService } from '../services/kit-settings.service';
import { WebsocketService } from '../../services/websocket.service';
import { Node, MIP, Job, Settings, MipSettings } from '../models/kit';

const DIALOG_WIDTH = "800px";

@Component({
  selector: 'app-mip-mng',
  templateUrl: './mip-mng.component.html',
  styleUrls: ['./mip-mng.component.css']
})
export class MipManagementComponent implements OnInit {

  mipsColumns = ['hostname', 'ip_address', 'deployment_type', 'state', 'actions']
  mips: MIP[] = [];
  controllerMaintainer: boolean;
  public ioConnection: any;

  isoSensorExists: boolean = false;
  mipSettings: Partial<MipSettings> = {};
  buttonisDisabled: boolean = true;

  constructor(public _WebsocketService:WebsocketService,
              private title: Title,
              private matSnackBarSrv: MatSnackBarService,
              private userService: UserService,
              private router: Router,
              private dialog: MatDialog,
              private kitSettingsSvc: KitSettingsService) {
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  private socketRefresh(){
    this._WebsocketService.getSocket().on('node-state-change', (data: any) => {
      this.refreshMIPs(data)

    });
  }

  private getMIPData(){
      this.kitSettingsSvc.getNodes().subscribe((data: Node[]) => {
        this.refreshMIPs(data);
      })
  }

  private refreshMIPs(data: Node[]){
    const mipsArray = [];
    for (var node of data){
      for (var job of node.jobs){
        if (job.name == "deploy") node.isDeployed = this.getCurrentStatus(job) == "Complete"
      }
      if (node.node_type == "MIP"){
        mipsArray.push(node)
      }
    }
    this.mips = mipsArray
  }

  ngOnInit() {
    this.title.setTitle("MIP Management");
    this.socketRefresh();
    this.getMIPData();

    this.kitSettingsSvc.getMipSettings().subscribe((data) => {
      this.mipSettings = data;
    })
  }

  isJobRunningButtonGroup(node: Node): boolean {
    return false;
  }

  addMip(){
    const dialogRef = this.dialog.open(AddMipDialog, {
      width: DIALOG_WIDTH,
      data: "Blank"
    });

    dialogRef.afterClosed().subscribe(result => {
        let form = result as FormGroup;
        if (form && form.valid){

          //this.matSnackBarSrv.displaySnackBar("TODO Stubbed out call Implement later.");

          this.kitSettingsSvc.addMip(form.value).subscribe(data => {
          })

        }
      err => {
          console.error(err);
        };
    });
  }

  showMIPInfo(mip){
    // console.log(node);
    this.dialog.open(NodeInfoDialog, {
      width: DIALOG_WIDTH,
      data: mip
    });

    // dialogRef.afterClosed().subscribe(result => {

    // });
  }

  deleteMIP(mip: Node){
    const option2 = "Confirm";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: DIALOG_WIDTH,
      data: {
        paneString: `Are you sure you want delete ${mip.hostname}?`,
        paneTitle: `Delete ${mip.hostname}?`,
        option1: "Cancel",
        option2: option2
      },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        this.kitSettingsSvc.deleteNode(mip.hostname).subscribe(data => {
        });
      }
    });
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

  public openConsole(job_id: string=""): void {
    this.router.navigate([`/stdout/${job_id}`]);
  }

  getCurrentStatus(job: Job): string {
    if (job.error) return "Error"
    if (job.complete) return "Complete"
    if (job.inprogress) return "In Progress"
    if (job.pending) return "Pending"
    return "Unknown"
  }

  disableAddMipButton(){

    if (this.mipSettings){
      if (Object.keys(this.mipSettings).length === 0) return true; else return false;
    }

    return true;

  }
}

