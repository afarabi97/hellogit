import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import {
  ErrorMessageClass,
  GenericJobAndKeyClass,
  ObjectUtilitiesClass,
  PCAPClass,
  PCAPHashesClass,
  SuccessMessageClass
} from '../../classes';
import {
  CANCEL_DIALOG_OPTION,
  CONFIRM_DIALOG_OPTION,
  DIALOG_WIDTH_800PX,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR
} from '../../constants/cvah.constants';
import { ConfirmDialogMatDialogDataInterface } from '../../interfaces';
import { GlobalPCAPService } from '../../services/global-pcap.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { ConfirmDialogComponent } from '../global-components/components/confirm-dialog/confirm-dialog.component';
import { ReplayPcapDialogComponent } from './components/replay-pcap-dialog/replay-pcap-dialog.component';
import { PCAP_DISPLAY_COLUMNS, PCAP_FORM_TITLE } from './constants/pcap-form.constants';
import { ReplayPCAPInterface } from './interfaces/replay-pcap.interface';
import { PCAPService } from './services/pcap.service';

/**
 * Component used for pcap related functionality
 *
 * @export
 * @class PcapFormComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-pcap-form',
  templateUrl: './pcap-form.component.html',
  styleUrls: [
    './pcap-form.component.scss'
  ]
})
export class PcapFormComponent implements OnInit {
  // Used for grab
  @ViewChild('pcapPaginator') private paginator_: MatPaginator;
  // Used for passing MatTableDataSource to html table
  pcaps: MatTableDataSource<PCAPClass>;
  // Used for passing the display coulmns in for the table
  display_columns: string[];
  // Used for passing pcap file to api call to upload
  pcap_for_upload: File;

  /**
   * Creates an instance of PcapFormComponent.
   *
   * @param {Title} title_
   * @param {MatDialog} mat_dialog_
   * @param {PCAPService} pcap_service_
   * @param {GlobalPCAPService} global_pcap_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof PcapFormComponent
   */
  constructor(private title_: Title,
              private mat_dialog_: MatDialog,
              private pcap_service_: PCAPService,
              private global_pcap_service_: GlobalPCAPService,
              private mat_snackbar_service_: MatSnackBarService) {
    this.display_columns = PCAP_DISPLAY_COLUMNS;
    this.pcap_for_upload = null;
  }

  /**
   * Used for setting up subscriptions
   *
   * @memberof PcapFormComponent
   */
  ngOnInit(): void {
    this.title_.setTitle(PCAP_FORM_TITLE);
    this.api_get_pcaps_();
  }

  /**
   * Used for grabbing the first item from a filelist and setting as pcap_for_upload
   *
   * @param {FileList} files
   * @memberof PcapFormComponent
   */
  handle_file_input(files: FileList): void {
    this.pcap_for_upload = files.item(0);
  }

  /**
   * Used for taking pcap file selected and send to api call to upload
   *
   * @memberof PcapFormComponent
   */
  upload_file(): void {
    this.mat_snackbar_service_.displaySnackBar(`Loading ${this.pcap_for_upload.name}...`);
    const pcap_form_data: FormData = new FormData();
    pcap_form_data.append('upload_file', this.pcap_for_upload, this.pcap_for_upload.name);
    this.api_upload_pcap_(pcap_form_data);
  }

  /**
   * Used for returning a string with all pcap hashes
   *
   * @param {PCAPHashesClass} pcap_hashes
   * @return {string}
   * @memberof PcapFormComponent
   */
  get_pcap_hashes(pcap_hashes: PCAPHashesClass): string {
    return `MD5: ${pcap_hashes.md5}\nSHA1: ${pcap_hashes.sha1}\nSHA256: ${pcap_hashes.sha256}`;
  }

  /**
   * Used for calling dialog to replay a pcap
   *
   * @param {PCAPClass} pcap
   * @memberof PcapFormComponent
   */
  replay_pcap_dialog(pcap: PCAPClass): void {
    const mat_dialog_ref: MatDialogRef<ReplayPcapDialogComponent, any> = this.mat_dialog_.open(ReplayPcapDialogComponent, {
      width: DIALOG_WIDTH_800PX,
      disableClose: true,
      data: pcap.name
    });

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response : FormGroup) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) && response.valid) {
            this.api_replay_pcap_(response.getRawValue() as ReplayPCAPInterface);
          }
        });
  }

  /**
   * Used for calling confirm dialog to delete a pcap
   *
   * @param {PCAPClass} pcap
   * @memberof PcapFormComponent
   */
  delete_pcap_confirm_dialog(pcap: PCAPClass): void {
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      message: `Are you sure you want to permanently delete ${pcap.name}?`,
      option1: CANCEL_DIALOG_OPTION,
      option2: CONFIRM_DIALOG_OPTION
    };
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_800PX,
      disableClose: true,
      data: confirm_dialog
    });

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (response === CONFIRM_DIALOG_OPTION) {
            this.api_delete_pcap_(pcap);
          }
        });
  }

  /**
   * Used for making api rest call to get pcaps
   *
   * @private
   * @memberof PcapFormComponent
   */
  private api_get_pcaps_(): void {
    this.global_pcap_service_.get_pcaps()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: PCAPClass[]) => {
          this.pcaps = new MatTableDataSource<PCAPClass>(response);
          this.pcaps.paginator = this.paginator_;
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving pcaps';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to post upload pcap
   *
   * @private
   * @param {FormData} pcap_form_data
   * @memberof PcapFormComponent
   */
  private api_upload_pcap_(pcap_form_data: FormData): void {
    this.pcap_service_.upload_pcap(pcap_form_data)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          this.pcap_for_upload = null;
          this.mat_snackbar_service_.displaySnackBar(response.success_message);
          this.api_get_pcaps_();
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

  /**
   * Used for making api rest call to post replay pcap
   *
   * @private
   * @param {ReplayPCAPInterface} replay_pcap_interface
   * @memberof PcapFormComponent
   */
  private api_replay_pcap_(replay_pcap_interface: ReplayPCAPInterface): void {
    this.pcap_service_.replay_pcap(replay_pcap_interface)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          const message: string = `Replaying ${replay_pcap_interface.pcap} on ${replay_pcap_interface.sensor_hostname}. Open the notification manager to track its progress.`;
          this.mat_snackbar_service_.displaySnackBar(message);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'replaying pcap';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to delete pcap
   *
   * @private
   * @param {PCAPClass} pcap
   * @memberof PcapFormComponent
   */
  private api_delete_pcap_(pcap: PCAPClass): void {
    this.pcap_service_.delete_pcap(pcap.name)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          this.mat_snackbar_service_.displaySnackBar(response.success_message);
          this.api_get_pcaps_();
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
}
