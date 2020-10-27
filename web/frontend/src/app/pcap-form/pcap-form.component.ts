import { Component, OnInit, ViewChild } from '@angular/core';
import { PcapService } from './pcap.service';
import { Title } from '@angular/platform-browser';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDailogComponent } from '../confirm-dailog/confirm-dailog.component';
import { FormGroup } from '@angular/forms';
import { ReplayPcapDialog } from './replay-pcap-dialog/replay-pcap-dialog.component';

const DIALOG_WIDTH = "800px";

@Component({
  selector: 'app-pcap-form',
  templateUrl: './pcap-form.component.html',
  styleUrls: ['./pcap-form.component.css']
})
export class PcapFormComponent implements OnInit {
  pcaps: MatTableDataSource<Object>;
  hostname: string;
  pcapToUpload: File = null;
  pcapToDelete: string;

  showMd5: boolean;
  showSha1: boolean;
  showSha256: boolean;

  displayColumns = [ 'name', 'mod_date', 'hash', 'size', 'action' ];

  @ViewChild('pcapPaginator')
  private paginator: MatPaginator;

  constructor(private pcapSrv: PcapService,
              private title: Title,
              private dialog: MatDialog)
  {
    this.hostname = window.location.hostname;
    this.pcapToDelete = "";
    this.showMd5 = true;
    this.showSha1 = false;
    this.showSha256 = false;
  }

  private initalizePage(){
    this.pcapSrv.getPcaps().subscribe(data => {
      this.pcaps = new MatTableDataSource<Object>(data as Array<Object>);
      this.pcaps.paginator = this.paginator;
    });
  }

  ngOnInit() {
    this.title.setTitle("PCAP Test Files");
    this.initalizePage();
  }

  handleFileInput(files: FileList) {
    this.pcapToUpload = files.item(0);
  }

  private displayServiceResponse(data: any){
    if (data['success_message']){
      this.pcapSrv.displaySnackBar(data['success_message']);
      this.initalizePage();
    } else if (data['error_message']){
      this.pcapSrv.displaySnackBar(data['error_message']);
    } else {
      this.pcapSrv.displaySnackBar("Failed for unknown reason");
    }
  }

  uploadFile(){
    this.pcapSrv.displaySnackBar("Loading " + this.pcapToUpload.name + "...");
    this.pcapSrv.uploadPcap(this.pcapToUpload).subscribe(data => {
      //This timeout is put in place to ensure that the modal will hide.
      //For very small PCAPs its possible to upload them faster than the
      //Loading dialog has time to open thus causing the modal to stay open forever.
      setTimeout(() => {
        this.displayServiceResponse(data);
      }, 1000);
    });
  }

  openConfirmModal(pcap: Object){
    let doItText = 'Yes';
    let dialogRef = this.dialog.open(ConfirmDailogComponent, {
        width: DIALOG_WIDTH,
        data: {
          'paneString': 'Are you sure you want to permanently delete ' + pcap['name']  + '?',
          'option1': 'Cancel',
          'option2': doItText
        }
      });
      dialogRef.afterClosed().subscribe(
        result => {
          if(result == doItText) {
            this.pcapToDelete = pcap['name'];
            this.deleteFile();
          }
        }
      );
  }

  getHash(hashes: Object): string {
    if(this.showMd5){
      return hashes["md5"];
    }

    if(this.showSha1){
      return hashes["sha1"];
    }

    return hashes["sha256"];
  }

  showMD5(){
    this.showMd5 = true;
    this.showSha1 = false;
    this.showSha256 = false;
  }

  showSHA1(){
    this.showSha1 = true;
    this.showMd5 = false;
    this.showSha256 = false;
  }

  showSHA256(){
    this.showSha256 = true;
    this.showSha1 = false;
    this.showMd5 = false;
  }

  deleteFile(){
    this.pcapSrv.deletePcap(this.pcapToDelete).subscribe(data => {
      this.displayServiceResponse(data);
    });
  }

  openPCAPReplayModal(pcap: Object){
    const dialogRef = this.dialog.open(ReplayPcapDialog, {
      width: DIALOG_WIDTH,
      data: pcap['name']
    });

    dialogRef.afterClosed().subscribe(result => {
      let form = result as FormGroup;
      if (form && form.valid){
        this.pcapSrv.replayPcap(form.getRawValue()).subscribe(data => {
          this.pcapSrv.displaySnackBar("Replaying " + form.get('pcap').value + " on " + form.get('sensor').value +
                                ". Open the notification manager to track its progress.");
        });
      }
    });
  }
}
