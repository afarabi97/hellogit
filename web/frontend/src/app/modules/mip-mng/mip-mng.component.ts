import { Component, OnInit, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { JobClass, MIPClass, MipSettingsClass, NodeClass } from '../../classes';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogMatDialogDataInterface, ServerStdoutMatDialogDataInterface } from '../../interfaces';
import { KitSettingsService } from '../../services/kit-settings.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { UserService } from '../../services/user.service';
import { WebsocketService } from '../../services/websocket.service';
import { NodeInfoDialogComponent } from '../global-components/components/node-info-dialog/node-info-dialog.component';
import { ServerStdoutComponent } from '../server-stdout/server-stdout.component';
import { AddMipDialogComponent } from './components/add-mip-dialog/add-mip-dialog.component';

const DIALOG_WIDTH = '1000px';

@Component({
  selector: 'app-mip-mng',
  templateUrl: './mip-mng.component.html'
})
export class MipManagementComponent implements OnInit {
  @ViewChildren('progressCircles') public progressCircles;
  mipsColumns = ['hostname', 'ip_address', 'deployment_type', 'state', 'actions'];
  mips: MIPClass[] = [];
  controllerMaintainer: boolean;
  ioConnection: any;
  isoSensorExists: boolean = false;
  mipSettings: Partial<MipSettingsClass> = {};
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

  ngOnInit() {
    this.title.setTitle('MIP Management');
    this.socketRefresh();
    this.getMIPData();

    this.kitSettingsSvc.getMipSettings().subscribe((data: MipSettingsClass) => {
      this.mipSettings = data;
    });
  }

  addMip(){
    const dialogRef = this.dialog.open(AddMipDialogComponent, {
      width: DIALOG_WIDTH,
      data: 'Blank'
    });

    dialogRef.afterClosed().subscribe(result => {
        const form = result as FormGroup;
        if (form && form.valid){
          this.kitSettingsSvc.addMip(form.value).subscribe(data => {},
            err => {
                console.error(err);
            });

        }
      },
      err => {
          console.error(err);
      });
  }

  showMIPInfo(mip){
    this.dialog.open(NodeInfoDialogComponent, {
      width: DIALOG_WIDTH,
      data: mip
    });
  }

  canDeleteNode(node: NodeClass){
    for (const job of node.jobs){
      if (job.name === 'create') {
        return (this.getCurrentStatus(job) === 'Complete' || this.getCurrentStatus(job) === 'Error');
      }
    }
    return true;
  }

  deleteMIP(mip: NodeClass) {
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: `Delete ${mip.hostname}?`,
      message: `Are you sure you want delete ${mip.hostname}?`,
      option1: 'Cancel',
      option2: 'Confirm'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: confirm_dialog
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === confirm_dialog.option2) {
        this.kitSettingsSvc.deleteNode(mip.hostname).subscribe(data => {
        });
      }
    });
    mip.isRemoving = true;
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

  openConsole(job_id: string): void {
    const server_stdout_mat_dialog_data: ServerStdoutMatDialogDataInterface = {
      job_id: job_id
    };
    this.dialog.open(ServerStdoutComponent, {
      height: '90vh',
      width: '75vw',
      data: server_stdout_mat_dialog_data
    });
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

  disableAddMipButton(){
    if (this.mipSettings){
      if (Object.keys(this.mipSettings).length === 0) {
        return true;
      } else {
        return false;
      }
    }

    return true;
  }

  private socketRefresh(){
    this._WebsocketService.getSocket().on('node-state-change', (data: any) => {
      this.refreshMIPs(data);
    });
  }

  private getMIPData(){
      this.kitSettingsSvc.getNodes().subscribe((data: NodeClass[]) => {
        this.refreshMIPs(data);
      });
  }

  private refreshMIPs(data: NodeClass[]){
    const mipsArray = [];
    for (const node of data){
      for (const job of node.jobs){
        if (job.name === 'deploy') {
          node.isDeployed = this.getCurrentStatus(job) === 'Complete';
        }
      }
      if (node.node_type === 'MIP'){
        mipsArray.push(node);
      }
    }
    this.mips = mipsArray;
  }
}

