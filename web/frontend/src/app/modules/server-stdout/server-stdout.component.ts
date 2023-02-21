import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { BackgroundJobClass, ErrorMessageClass, GenericJobAndKeyClass, ObjectUtilitiesClass } from '../../classes';
import {
  CONFIRM_DIALOG_OPTION,
  DIALOG_WIDTH_35PERCENT,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR
} from '../../constants/cvah.constants';
import { ServerStdoutMatDialogDataInterface } from '../../interfaces';
import { GlobalJobService } from '../../services/global-job.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { WebsocketService } from '../../services/websocket.service';
import { ConfirmDialogComponent } from '../global-components/components/confirm-dialog/confirm-dialog.component';
import { JobLogClass } from './classes';
import {
  CONFIRM_DIALOG_MAT_DIALOG_DATA_RETRY_JOB,
  CONFIRM_DIALOG_MAT_DIALOG_DATA_STOP_JOB
} from './constants/server-stdout.constant';
import { JobLogInterface } from './interfaces';
import { JobService } from './services/job.service';

/**
 * Component used for displaying job console output and job reltaed calls
 *
 * @export
 * @class ServerStdoutComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-server-stdout',
  templateUrl: './server-stdout.component.html',
  styleUrls: ['./server-stdout.component.scss']
})
export class ServerStdoutComponent implements OnInit {
  // Used for retrieving element ref for console output from server
  @ViewChild('console') private console_output_: ElementRef;
  // Used for passing boolean value for the ability to start/stop job scrolling
  scroll_status: Boolean;
  // Used for allowing the ability to retry a job
  allow_retry: boolean;
  // Used for holding all of the console log entries for a server job
  // Also used to pass logs to html
  job_logs: JobLogClass[];
  // Passed job id as dialog data
  private job_id_: string;

  /**
   * Creates an instance of ServerStdoutComponent.
   *
   * @param {MatDialog} mat_dialog_
   * @param {JobService} job_service_
   * @param {GlobalJobService} global_job_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {WebsocketService} websocket_service_
   * @param {ServerStdoutMatDialogDataInterface} mat_dialog_data
   * @memberof ServerStdoutComponent
   */
  constructor(private mat_dialog_: MatDialog,
              private job_service_: JobService,
              private global_job_service_: GlobalJobService,
              private mat_snackbar_service_: MatSnackBarService,
              private websocket_service_: WebsocketService,
              @Inject(MAT_DIALOG_DATA) public mat_dialog_data: ServerStdoutMatDialogDataInterface) {
    this.scroll_status = true;
    this.job_logs = [];
    this.job_id_ = mat_dialog_data.job_id;
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof ServerStdoutComponent
   */
  ngOnInit(): void {
    this.setup_websocket_get_socket_on_message_();
    this.api_job_logs_();
  }

  /**
   * Used for setting the scroll to true
   *
   * @memberof ServerStdoutComponent
   */
  start_scroll(): void {
    this.scroll_status = true;
  }

  /**
   * Used for setting the scroll to false
   *
   * @memberof ServerStdoutComponent
   */
  stop_scroll(): void {
    this.scroll_status = false;
  }

  /**
   * Used for calling confirm dialog to stop a job
   *
   * @memberof ServerStdoutComponent
   */
  stop_job_confirm_dialog(): void {
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_35PERCENT,
      data: CONFIRM_DIALOG_MAT_DIALOG_DATA_STOP_JOB
    });

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (response === CONFIRM_DIALOG_OPTION) {
            this.api_job_delete_();
          }
        });
  }

  /**
   * Used for calling confirm dialog to retry a job
   *
   * @memberof ServerStdoutComponent
   */
  retry_job_confirm_dialog(): void {
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_35PERCENT,
      data: CONFIRM_DIALOG_MAT_DIALOG_DATA_RETRY_JOB
    });

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (response === CONFIRM_DIALOG_OPTION) {
            this.api_job_retry_();
          }
        });
  }

  /**
   * Used to setup the websocket on message
   *
   * @private
   * @memberof ServerStdoutComponent
   */
  private setup_websocket_get_socket_on_message_(): void {
    this.websocket_service_.getSocket().on('message', (response: JobLogInterface) => {
      /* istanbul ignore else */
      if (response.jobid === this.job_id_) {
        const job_log: JobLogInterface = new JobLogClass(response);
        this.job_logs.push(job_log);
      }
    });
  }

  /**
   * Used for making api rest call to get job logs
   *
   * @private
   * @memberof ServerStdoutComponent
   */
  private api_job_logs_(): void {
    this.job_service_.job_logs(this.job_id_)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: JobLogClass[]) => {
          this.job_logs = response;
          this.api_job_get_();
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving job logs';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get job
   *
   * @private
   * @memberof ServerStdoutComponent
   */
  private api_job_get_(): void {
    this.global_job_service_.job_get(this.job_id_)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: BackgroundJobClass) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) && !ObjectUtilitiesClass.notUndefNull(response.status) ||
              ObjectUtilitiesClass.notUndefNull(response.status) && response.status === 'started') {
            this.allow_retry = false;
          }

          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response.status) && response.status === 'failed') {
            this.allow_retry = true;
          }
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving job';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to delete job
   *
   * @private
   * @memberof ServerStdoutComponent
   */
  private api_job_delete_(): void {
    this.job_service_.job_delete(this.job_id_)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          this.job_logs = [];
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

  /**
   * Used for making api rest call to retry job
   *
   * @private
   * @memberof ServerStdoutComponent
   */
  private api_job_retry_(): void {
    this.global_job_service_.job_retry(this.job_id_)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          this.job_logs = [];
          this.api_job_get_();
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
}
