import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, Renderer2 } from '@angular/core';

import { ErrorMessageClass, GenericJobAndKeyClass, JobClass } from '../../../../classes';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { GlobalJobService } from '../../../../services/global-job.service';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { MipManagementComponent } from '../../../mip-mng/mip-mng.component';
import { NodeManagementComponent } from '../../../node-mng/node-mng.component';

@Component({
  selector: 'app-node-state-progress-bar',
  templateUrl: './node-state-progress-bar.component.html',
  styleUrls: ['./node-state-progress-bar.component.css'],
})
export class NodeStateProgressBarComponent implements OnInit {
  @Input() jobs: JobClass[];
  public jobId: string;
  public scrollStatus: Boolean = true;
  public mouseOverRetryFailedNode: boolean;

  stepClasses = ['step', 'tooltip'];
  messages: Array<{ msg: string; color: string }>;
  private toggleDropDown: boolean;
  private currentToggleJob: string;

  constructor(
    private nodeMng: NodeManagementComponent,
    private global_job_service_: GlobalJobService,
    private mipMng: MipManagementComponent,
    private mat_snackbar_service_: MatSnackBarService,
    private renderer: Renderer2
  ) {
    this.toggleDropDown = false;
    this.renderer.listen('window', 'click', (e:Event) => {
      if (this.toggleDropDown && (<HTMLInputElement>e.target).localName !== 'mat-icon') {
        this.toggleDropDown = false;
        this.currentToggleJob = '';
      }
    });
  }

  ngOnInit(): void {}

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

  getStepClasses(job: JobClass) {
    const status = this.getCurrentStatus(job).replace(' ', '').toLowerCase();
    return this.stepClasses.concat(status);
  }

  getStateIcon(job: JobClass) {
    if (job.error) {
      return 'cancel';
    }
    if (job.complete) {
      return 'check_circle';
    }
    if (job.inprogress) {
      return 'timelapse';
    }
    if (job.pending) {
      return 'radio_button_checked';
    }
  }

  retryJob(job: JobClass) {
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

  openJobConsole(job: JobClass) {
    if (job.job_id === null) {
      return;
    } else {
      this.nodeMng.openConsole(job.job_id);
    }
  }

  closeDropDown(){
    this.toggleDropDown = false;
  }

  dropDownHandler(job: JobClass) {
    // Close the previous dropdowns
    if (this.nodeMng.progressCircles){
      for (const progress of this.nodeMng.progressCircles.toArray()){
        progress.closeDropDown();
      }
    }

    if (this.mipMng.progressCircles){
      for (const progress of this.mipMng.progressCircles.toArray()){
        progress.closeDropDown();
      }
    }

    if (!this.currentToggleJob || this.validateDropDownJob(job)) {
      this.toggleDropDown = !this.toggleDropDown;
    }

    if (this.toggleDropDown) {
      this.currentToggleJob = job._id;
    } else {
      this.currentToggleJob = '';
    }
  }

  validateDropDownJob(job: JobClass) {
    return job._id === this.currentToggleJob;
  }

  displayButtonStatus(job: JobClass) {
    return this.getCurrentStatus(job) !== 'Error' ? 'Retry Disabled' : 'Retry';
  }
}
