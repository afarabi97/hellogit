import { HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../constants/cvah.constants';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { SystemVersionClass } from './classes';
import { PMO_SUPPORT_TITLE } from './constants/pmo-support.constant';
import { SystemVersionService } from './services/system-version.service';
import { DiagnosticsService } from './services/diagnostics.service';
import { saveAs } from 'file-saver';
import { HttpEventType } from '@angular/common/http';
import { WebsocketService } from '../../services/websocket.service';
import { GenericJobAndKeyClass, ObjectUtilitiesClass } from '../../classes';

/**
 * Component used for displaying pmo support information
 *
 * @export
 * @class PmoSupportComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-pmo-support',
  templateUrl: './pmo-support.component.html',
  styleUrls: [
    './pmo-support.component.scss'
  ]
})
export class PmoSupportComponent implements OnInit {
  // Used for passing the system version info to display within html
  system_version: SystemVersionClass;
  // Used for passing diagnostics data to html
  diagnostics_job_id: string;
  diagnostics_download_progress: number;
  running_diagnostics_script: boolean;

  /**
   * Creates an instance of PmoSupportComponent.
   *
   * @param {Title} title_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {DiagnosticsService} diagnostics_service_
   * @param {SystemVersionService} system_version_service_
   * @param {WebsocketService} websocket_service_
   * @memberof PmoSupportComponent
   */
  constructor(private title_: Title,
              private mat_snackbar_service_: MatSnackBarService,
              private diagnostics_service_: DiagnosticsService,
              private system_version_service_: SystemVersionService,
              private websocket_service_: WebsocketService) { }

  /**
   * Used for setting up subscriptions
   *
   * @memberof PmoSupportComponent
   */
  ngOnInit(): void {
    this.mat_snackbar_service_.displaySnackBar("Be cognizant downloading log files and then uploading them to service now if they are from a classified network.", MAT_SNACKBAR_CONFIGURATION_60000_DUR);
    this.title_.setTitle(PMO_SUPPORT_TITLE);
    this.setup_websocket_diagnostics_finished_();
    this.api_get_system_version_();
  }

  /**
   * Used for returning boolean value when
   * system_version is defined
   *
   * @returns {boolean}
   * @memberof PmoSupportComponent
   */
  is_system_version_defined(): boolean {
    return ObjectUtilitiesClass.notUndefNull(this.system_version);
  }

  /**
   * Used for returning boolean value when
   * running_diagnostics_script is defined
   *
   * @returns {boolean}
   * @memberof PmoSupportComponent
   */
  is_running_diagnostics_script_defined(): boolean {
    return ObjectUtilitiesClass.notUndefNull(this.running_diagnostics_script);
  }

  /**
   * Used for returning boolean value when
   * diagnostics_download_progress is defined
   *
   * @returns {boolean}
   * @memberof PmoSupportComponent
   */
  is_diagnostics_download_progress_defined(): boolean {
    return ObjectUtilitiesClass.notUndefNull(this.diagnostics_download_progress);
  }

  /**
   * Used for returning boolean value when
   * diagnostics_job_id is defined
   *
   * @returns {boolean}
   * @memberof PmoSupportComponent
   */
  is_diagnostics_job_id_defined(): boolean {
    return ObjectUtilitiesClass.notUndefNull(this.diagnostics_job_id);
  }

  /**
   * Used for passing private method call to html
   *
   * @memberof PmoSupportComponent
   */
  diagnostics(): void {
    this.api_diagnostics_();
  }

  /**
   * Used for setting up listener to websocket notifications
   * for diagnostics_finished_running
   * TODO - Update when websocket has been flushed out
   *
   * @private
   * @memberof PmoSupportComponent
   */
  private setup_websocket_diagnostics_finished_(): void {
    this.websocket_service_.getSocket()
      .on('diagnostics_finished_running', (rc: number) => {
        this.running_diagnostics_script = null;
        if (rc === 0) {
          this.api_download_diagnostics_();
        } else {
          this.diagnostics_job_id = null;
          this.mat_snackbar_service_.generate_return_error_snackbar_message('Diagnostics script failed.', MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        }
      });
  }

  /**
   * Used for making api rest call to get system version
   *
   * @private
   * @memberof PmoSupportComponent
   */
  private api_get_system_version_(): void {
    this.system_version_service_.get_system_version()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SystemVersionClass) => this.system_version = response,
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving system version';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call for diagnostics
   *
   * @private
   * @memberof PmoSupportComponent
   */
  private api_diagnostics_(): void {
    this.diagnostics_service_.diagnostics()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          this.diagnostics_job_id = response.job_id;
          this.running_diagnostics_script = true;
        },
        (error: HttpErrorResponse) => {
          const message: string = 'starting diagnostics download';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to download diagnostics
   *
   * @private
   * @memberof PmoSupportComponent
   */
  private api_download_diagnostics_(): void {
    this.diagnostics_service_.download_diagnostics(this.diagnostics_job_id)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: HttpEvent<Blob>) => {
          /* istanbul ignore else */
          if (response.type === HttpEventType.DownloadProgress) {
            this.diagnostics_download_progress = 100 * response.loaded / response.total;
          }
          /* istanbul ignore else */
          if (response.type === HttpEventType.Response) {
            saveAs(response.body, 'diagnostics.tar.gz');
            this.diagnostics_job_id = null;
            this.diagnostics_download_progress = null;
          }
        },
        (error: HttpErrorResponse) => {
          const message: string = 'downloading diagnostics';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}
