import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';

import { ErrorMessageClass, GenericJobAndKeyClass, ObjectUtilitiesClass } from '../../classes';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../constants/cvah.constants';
import { ConfirmDialogMatDialogDataInterface } from '../../interfaces';
import { GlobalPCAPService } from '../../services/global-pcap.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { ReplayPcapDialogComponent } from './components/replay-pcap-dialog/replay-pcap-dialog.component';
import { ReplayPCAPInterface } from './interfaces/replay-pcap.interface';
import { PCAPService } from './services/pcap.service';

const DIALOG_WIDTH = '800px';

@Component({
  selector: 'app-pcap-form',
  templateUrl: './pcap-form.component.html',
  styleUrls: ['./pcap-form.component.css']
})
export class PcapFormComponent implements OnInit {
  @ViewChild('pcapPaginator') private paginator: MatPaginator;
  pcaps: MatTableDataSource<Object>;
  hostname: string;
  pcapToUpload: File = null;
  pcapToDelete: string;
  showMd5: boolean;
  showSha1: boolean;
  showSha256: boolean;
  displayColumns = [ 'name', 'mod_date', 'hash', 'size', 'action' ];

  constructor(private global_pcap_service_: GlobalPCAPService,
              private pcap_service_: PCAPService,
              private title: Title,
              private dialog: MatDialog,
              private mat_snackbar_service_: MatSnackBarService,) {
    this.hostname = window.location.hostname;
    this.pcapToDelete = '';
    this.showMd5 = true;
    this.showSha1 = false;
    this.showSha256 = false;
  }

  ngOnInit() {
    this.title.setTitle('PCAP Test Files');
    this.initalizePage();
  }

  handleFileInput(files: FileList) {
    this.pcapToUpload = files.item(0);
  }

  uploadFile(){
    this.mat_snackbar_service_.displaySnackBar('Loading ' + this.pcapToUpload.name + '...');
    const pcap_form_data: FormData = new FormData();
    pcap_form_data.append('upload_file', this.pcapToUpload, this.pcapToUpload.name);
    this.pcap_service_.upload_pcap(pcap_form_data).subscribe(data => {
      //This timeout is put in place to ensure that the modal will hide.
      //For very small PCAPs its possible to upload them faster than the
      //Loading dialog has time to open thus causing the modal to stay open forever.
      setTimeout(() => {
        this.displayServiceResponse(data);
      }, 1000);
    },
    (error: ErrorMessageClass | HttpErrorResponse) => {
      if (error instanceof ErrorMessageClass) {
        this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
      } else {
        const message: string = 'uploading pcap file';
        this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
      }
    });
  }

  openConfirmModal(pcap: Object){
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      message: 'Are you sure you want to permanently delete ' + pcap['name']  + '?',
      option1: 'Cancel',
      option2: 'Yes'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: DIALOG_WIDTH,
        data: confirm_dialog
      });
      dialogRef.afterClosed().subscribe(
        result => {
          if(result === confirm_dialog.option2) {
            this.pcapToDelete = pcap['name'];
            this.deleteFile();
          }
        }
      );
  }

  getHash(hashes: Object): string {
    if(this.showMd5){
      return hashes['md5'];
    }

    if(this.showSha1){
      return hashes['sha1'];
    }

    return hashes['sha256'];
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
    this.pcap_service_.delete_pcap(this.pcapToDelete).subscribe(data => {
      this.displayServiceResponse(data);
    },
    (error: ErrorMessageClass | HttpErrorResponse) => {
      if (error instanceof ErrorMessageClass) {
        this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
      } else {
        const message: string = 'deleting pcap';
        this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
      }
    });
  }

  openPCAPReplayModal(pcap: Object){
    const dialogRef = this.dialog.open(ReplayPcapDialogComponent, {
      width: DIALOG_WIDTH,
      data: pcap['name']
    });

    dialogRef.afterClosed().subscribe((form : FormGroup) => {
      if (ObjectUtilitiesClass.notUndefNull(form) && form.valid){
        this.pcap_service_.replay_pcap(form.getRawValue() as ReplayPCAPInterface)
          .subscribe(
            (response: GenericJobAndKeyClass) => {
              this.mat_snackbar_service_.displaySnackBar('Replaying ' + form.get('pcap').value + ' on ' + form.get('sensor_hostname').value +
                                                         '. Open the notification manager to track its progress.');
            },
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error instanceof ErrorMessageClass) {
                this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
              } else {
                const message: string = 'replaying pcap';
                this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
              }
            });
      }
    });
  }

  private initalizePage(){
    this.global_pcap_service_.get_pcaps().subscribe(data => {
      this.pcaps = new MatTableDataSource<Object>(data as Array<Object>);
      this.pcaps.paginator = this.paginator;
    });
  }

  private displayServiceResponse(data: any){
    if (data['success_message']){
      this.mat_snackbar_service_.displaySnackBar(data['success_message']);
      this.initalizePage();
    } else if (data['error_message']){
      this.mat_snackbar_service_.displaySnackBar(data['error_message']);
    } else {
      this.mat_snackbar_service_.displaySnackBar('Failed for unknown reason');
    }
  }
}
