import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, Renderer2 } from '@angular/core';

import { ErrorMessageClass, GenericJobAndKeyClass, JobClass, ObjectUtilitiesClass } from '../../../../classes';
import {
  CANCEL,
  COMPLETE,
  ERROR,
  IN_PROGRESS,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR,
  PENDING,
  UNKNOWN
} from '../../../../constants/cvah.constants';
import { GlobalJobService } from '../../../../services/global-job.service';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { MipManagementComponent } from '../../../mip-mng/mip-mng.component';
import { NodeManagementComponent } from '../../../node-mng/node-mng.component';
import {
  CHECK_CIRCLE,
  DEFAULT_STEP_CLASSES,
  RADIO_BUTTON_CHECKED,
  RETRY,
  RETRY_DISABLED,
  TIMELAPSE
} from '../../constants/global-components.constant';

/**
 * Component used for displaying the current states for a node
 *
 * @export
 * @class NodeStateProgressBarComponent
 */
@Component({
  selector: 'cvah-node-state-progress-bar',
  templateUrl: './node-state-progress-bar.component.html',
  styleUrls: ['./node-state-progress-bar.component.scss'],
})
export class NodeStateProgressBarComponent {
  // Input passed form parent so jobs can be passed to html
  @Input() jobs: JobClass[];
  // Used for toggling the drop down for a stage
  toggle_drop_down: boolean;
  // Used for changing the class for a stage based on criteria
  private step_classes_: string[];
  // Used for storing a ref to a job toggled
  private current_toggle_job_: string;

  /**
   * Creates an instance of NodeStateProgressBarComponent.
   *
   * @param {Renderer2} renderer_
   * @param {MipManagementComponent} mip_management_component_
   * @param {NodeManagementComponent} node_management_component_
   * @param {GlobalJobService} global_job_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof NodeStateProgressBarComponent
   */
  constructor(private renderer_: Renderer2,
              private mip_management_component_: MipManagementComponent,
              private node_management_component_: NodeManagementComponent,
              private global_job_service_: GlobalJobService,
              private mat_snackbar_service_: MatSnackBarService) {
    this.toggle_drop_down = false;
    this.step_classes_ = DEFAULT_STEP_CLASSES;
    this.renderer_.listen('window', 'click', (e: Event) => {
      /* istanbul ignore else */
      if (this.toggle_drop_down && (<HTMLInputElement>e.target).localName !== 'mat-icon') {
        this.toggle_drop_down = false;
        this.current_toggle_job_ = '';
      }
    });
  }

  /**
   * Used for passing a class back to html so that a stage may change its render class
   *
   * @param {JobClass} job
   * @return {string[]}
   * @memberof NodeStateProgressBarComponent
   */
  get_classes(job: JobClass): string[] {
    const status: string = this.get_status(job).replace(' ', '').toLowerCase();
    return this.step_classes_.concat(status);
  }

  /**
   * Returns a string value based on boolean values
   *
   * @param {JobClass} job
   * @return {string}
   * @memberof NodeStateProgressBarComponent
   */
  get_status(job: JobClass): string {
    if (job.error) {
      return ERROR;
    } else if (job.complete) {
      return COMPLETE;
    } else if (job.inprogress) {
      return IN_PROGRESS;
    } else if (job.pending) {
      return PENDING;
    } else {
      return UNKNOWN;
    }
  }

  /**
   * Used for clicking a job state
   *
   * @param {JobClass} job
   * @memberof NodeStateProgressBarComponent
   */
  click_job_state(job: JobClass): void {
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(this.node_management_component_.progress_circles)) {
      for (const progress of this.node_management_component_.progress_circles) {
        progress.close_drop_down_();
      }
    }

    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(this.mip_management_component_.progress_circles)) {
      for (const progress of this.mip_management_component_.progress_circles) {
        progress.close_drop_down_();
      }
    }

    /* istanbul ignore else */
    if (!this.current_toggle_job_ || this.validate_drop_down_job(job)) {
      this.toggle_drop_down = !this.toggle_drop_down;
    }

    if (this.toggle_drop_down) {
      this.current_toggle_job_ = job._id;
    } else {
      this.current_toggle_job_ = '';
    }
  }

  /**
   * Used for displaying an icon depending on job criteria
   *
   * @param {JobClass} job
   * @return {string}
   * @memberof NodeStateProgressBarComponent
   */
  get_icon(job: JobClass): string {
    /* istanbul ignore else */
    if (job.error) {
      return CANCEL;
    } else if (job.complete) {
      return CHECK_CIRCLE;
    } else if (job.inprogress) {
      return TIMELAPSE;
    } else if (job.pending) {
      return RADIO_BUTTON_CHECKED;
    }
  }

  /**
   * Validate if job is the current job used for toggle
   *
   * @param {JobClass} job
   * @return {boolean}
   * @memberof NodeStateProgressBarComponent
   */
  validate_drop_down_job(job: JobClass): boolean {
    return job._id === this.current_toggle_job_;
  }

  /**
   * Used for calling a component ref and opening the server std out dialog window
   *
   * @param {JobClass} job
   * @memberof NodeStateProgressBarComponent
   */
  open_job_server_std_out_console(job: JobClass): void {
    if (!ObjectUtilitiesClass.notUndefNull(job.job_id)) {
      return;
    } else {
      this.node_management_component_.open_job_server_std_out_console(job.job_id);
    }
  }

  /**
   * Used for displaying the retry button tooltip
   *
   * @param {JobClass} job
   * @return {string}
   * @memberof NodeStateProgressBarComponent
   */
  retry_button_tooltip(job: JobClass): string {
    return job.error ? RETRY_DISABLED : RETRY;
  }

  /**
   * Used for making a private call accessible to html
   *
   * @param {JobClass} job
   * @memberof NodeStateProgressBarComponent
   */
  retry(job: JobClass): void {
    this.api_job_retry_(job);
  }

  /**
   * Used for closing drop down
   *
   * @private
   * @memberof NodeStateProgressBarComponent
   */
  private close_drop_down_(): void {
    this.toggle_drop_down = false;
  }

  /**
   * Used for making api rest call for job retry
   *
   * @private
   * @param {JobClass} job
   * @memberof NodeStateProgressBarComponent
   */
  private api_job_retry_(job: JobClass): void {
    this.global_job_service_.job_retry(job.job_id)
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
}
