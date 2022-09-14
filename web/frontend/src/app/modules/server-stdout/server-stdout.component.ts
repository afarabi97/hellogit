import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';

import { ErrorMessageClass, GenericJobAndKeyClass } from '../../classes';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../constants/cvah.constants';
import { ConfirmDialogMatDialogDataInterface } from '../../interfaces';
import { GlobalJobService } from '../../services/global-job.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { WebsocketService } from '../../services/websocket.service';
import { BackgroundJobClass, JobLogClass } from './classes';
import { JobLogInterface } from './interfaces';
import { JobService } from './services/job.service';

@Component({
  selector: 'app-server-stdout',
  templateUrl: './server-stdout.component.html',
  styleUrls: ['./server-stdout.component.css']
})
export class ServerStdoutComponent implements OnInit {

  @ViewChild('console') private consoleDiv: ElementRef;
  scrollStatus: Boolean = true;
  allowRetry: boolean;
  logs: JobLogClass[];
  private job_id_: string;

  constructor(private route: ActivatedRoute,
              private title: Title,
              private dialog: MatDialog,
              private job_service_: JobService,
              private global_job_service_: GlobalJobService,
              private mat_snackbar_service_: MatSnackBarService,
              private websocket_service_: WebsocketService) {
    this.title.setTitle('Console Output');
    this.logs = [];
  }

  /**
   * Triggers when the browser window resizes.
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  onResize(event){
     this.resizeConsole();
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.job_id_ = params['id'];
      this.api_job_logs_();
      this.setup_websocket__get_socket_on_message();
      this.api_job_get_();
    });
  }

  ngAfterViewInit(){
    this.resizeConsole();
  }

  scrollToBottom(){
    if(this.scrollStatus) {
      this.consoleDiv.nativeElement.scrollTop = this.consoleDiv.nativeElement.scrollHeight;
    }
  }

  openKillModal(){
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: 'Kill',
      message: 'Are you sure you want to kill this job?',
      option1: 'Cancel',
      option2: 'Yes'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '35%',
      data: confirm_dialog,
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === confirm_dialog.option2) {
        this.api_job_delete_();
      }
    });
  }

  pauseScroll() {
    this.scrollStatus = !this.scrollStatus;
  }

  openRetryJobModal() {
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: 'Retry Job',
      message: 'Are you sure you want to rerun this job?',
      option1: 'Cancel',
      option2: 'Yes'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '35%',
      data: confirm_dialog,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === confirm_dialog.option2) {
        this.api_job_retry_();
        this.api_job_get_();
      }
    });
  }

  private resizeConsole(){
    let height: string = '';
    if (window.innerHeight > 400){
      height = (window.innerHeight - 64) + 'px';
    } else {
      height = '100px';
    }
    this.consoleDiv.nativeElement.style.maxHeight = height;
    this.consoleDiv.nativeElement.style.height = height;
  }

  private setup_websocket__get_socket_on_message(): void {
    this.websocket_service_.getSocket().on('message', (response: JobLogInterface) => {
      if (response.jobid === this.job_id_) {
        const job_log: JobLogInterface = new JobLogClass(response);
        this.logs.push(job_log);
        this.scrollToBottom();
      }
    });
  }

  private api_job_logs_(): void {
    this.job_service_.job_logs(this.job_id_)
      .subscribe(
        (response: JobLogClass[]) => {
          response.forEach((job_log: JobLogClass) => {
            this.logs.push(job_log);
          });
          setTimeout(() => {
            this.scrollToBottom();
          }, 1000);
        });
  }

  private api_job_get_(): void {
    this.job_service_.job_get(this.job_id_)
      .subscribe(
        (response: BackgroundJobClass) => {
          if (response && !response.status || response.status === 'started') {
            this.allowRetry = false;

            setTimeout(() => {
              this.api_job_get_();
            }, response.timeout || 7200);
          }

          if (response.status === 'failed') {
            this.allowRetry = true;
          }
        });
  }

  private api_job_retry_(): void {
    this.global_job_service_.job_retry(this.job_id_)
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          const message: string = 'requested system to retry job.';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'requesting retry job';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  private api_job_delete_(): void {
    this.job_service_.job_delete(this.job_id_)
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          const message: string = `deleted job ${response.job_id}`;
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'requesting delete job';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }
}
