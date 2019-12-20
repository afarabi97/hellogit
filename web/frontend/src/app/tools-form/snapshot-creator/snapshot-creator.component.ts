import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';
import { ToolsService } from '../tools.service';
import { SnapShotSetupComponent } from './setup-wizard/snap-setup-wizard.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { ConfirmDailogComponent } from 'src/app/confirm-dailog/confirm-dailog.component';
import { WebsocketService } from 'src/app/services/websocket.service';


const DIALOG_WIDTH = "800px";


@Component({
  selector: 'app-snapshot-creator',
  templateUrl: './snapshot-creator.component.html',
  styleUrls: ['./snapshot-creator.component.css']
})
export class SnapShotCreatorComponent implements OnInit {
  setupProcessState: string;
  isCardVisible: boolean;
  snapshots: MatTableDataSource<Object>;
  kibanaLink: string;
  displayColumns = [ 'name', 'state', 'start_time', 'end_time' ];

  @ViewChild('snapshotPaginator', {static: false})
  private paginator: MatPaginator;

  constructor(private dialog: MatDialog,
              private toolSrv: ToolsService,
              private socketSrv: WebsocketService){
    this.setupProcessState = "notstarted";
    this.isCardVisible = false;
    this.kibanaLink = "";
  }

  toggleCard(){
    this.isCardVisible = !this.isCardVisible;
  }

  private refreshSnapshotTable(){
    this.toolSrv.getELKSnapshots().subscribe(data => {
      this.snapshots = new MatTableDataSource<Object>(data as Array<Object>);
      this.snapshots.paginator = this.paginator;
    });
  }

  private setProcessComplete() {
    this.toolSrv.isELKSnapshotRepoSetup().subscribe(data => {
      this.setupProcessState = data["is_setup"];
      if (this.setupProcessState === "complete"){
        this.refreshSnapshotTable();
      }
    });
  }

  ngOnInit() {
    this.setProcessComplete();
    this.socketSrv.getSocket().on('snap_refresh', (data: any) => {
      this.refreshSnapshotTable();
    });

    this.toolSrv.getPortalLinks().subscribe(data => {
      if (data){
        let items = data as Array<Object>;
        for (let item of items){
          if (item["dns"].includes("kibana")){
            this.kibanaLink = item["ip"];
            break;
          }
        }
      }
    });
  }

  public getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  public setup(){
    const dialogRef = this.dialog.open(SnapShotSetupComponent, {
      width: DIALOG_WIDTH,
      data: { }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.setProcessComplete();
    });
  }

  public takeSnapShot(){
    const option2 = "Confirm";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: DIALOG_WIDTH,
      data: { "paneString": "Are you sure you want to take a snapshot? WARNING doing this can take \
                             a long time and it is recommended that the servers not be over taxed \
                             (IE make sure theres enough CPU and memory) during this operation",
              "paneTitle": "Take Elasticsearch Snapshot?", "option1": "Cancel", "option2": option2 },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        this.toolSrv.takeSnapshot().subscribe(data => {
          this.refreshSnapshotTable();
          if (data["accepted"]){
            this.toolSrv.displaySnackBar("Successfully initiated the creation of the snapshot.")
          } else {
            this.toolSrv.displaySnackBar("Failed to create the snapshot. Check /var/logs/tfplenum for more details.")
          }
        }, err => {
          console.error(err);
          this.toolSrv.displaySnackBar(err.message);
        });
      }
    });
  }
}
