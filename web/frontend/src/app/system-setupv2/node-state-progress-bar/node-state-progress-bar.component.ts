import { Injectable, Renderer2, Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import { Node, Job, RetryJob } from "../models/kit";
import { NodeManagementComponent } from "../node-mng/node-mng.component";
import { MatSnackBarService } from "../../services/mat-snackbar.service";
import { ServerStdoutService } from "../../server-stdout/server-stdout.service";


@Component({
  selector: "app-node-state-progress-bar",
  templateUrl: "./node-state-progress-bar.component.html",
  styleUrls: ["./node-state-progress-bar.component.css"],
})
export class NodeStateProgressBarComponent implements OnInit {
  @ViewChild("console")
  private consoleDiv: ElementRef;
  private jobName: string;
  public jobId: string;
  public scrollStatus: Boolean = true;
  public mouseOverRetryFailedNode: boolean;
  private toggleDropDown: boolean;
  private currentToggleJob: string;

  @Input() jobs: Job[];
  stepClasses = ["step", "tooltip"];
  messages: Array<{ msg: string; color: string }>;

  constructor(
    private nodeMng: NodeManagementComponent,
    private stdoutService: ServerStdoutService,
    private matSnackBarService: MatSnackBarService,
    private renderer: Renderer2
  ) {
    this.toggleDropDown = false;
    this.renderer.listen('window', 'click', (e:Event) => {
      if (this.toggleDropDown && (<HTMLInputElement>e.target).localName != 'mat-icon') {
        this.toggleDropDown = false;
        this.currentToggleJob = '';
      }
    });
  }

  ngOnInit(): void {}

  getCurrentStatus(job: Job): string {
    if (job.error) return "Error";
    if (job.complete) return "Complete";
    if (job.inprogress) return "In Progress";
    if (job.pending) return "Pending";
    return "Unknown";
  }

  getStepClasses(job: Job) {
    status = this.getCurrentStatus(job).replace(" ", "").toLowerCase();
    return this.stepClasses.concat(status);
  }

  getStateIcon(job: Job) {
    if (job.error) return "cancel";
    if (job.complete) return "check_circle";
    if (job.inprogress) return "timelapse";
    if (job.pending) return "radio_button_checked";
  }

  retryJob(job: Job) {
    this.stdoutService.retryJob(job.job_id).subscribe(
      (data: RetryJob) => {
        if (data) this.matSnackBarService.displaySnackBar(`Retry job started ${data.job_id}`);
      },
      (err) => {
        if (err && err.error && err.error["message"]) {
          this.matSnackBarService.displaySnackBar(err.error["message"]);
        } else {
          console.error(err);
          this.matSnackBarService.displaySnackBar(
            "Failed for an unknown reason."
          );
        }
      }
    );
  }

  openJobConsole(job: Job) {
    if (job.job_id === null) {
      return;
    } else {
      this.nodeMng.openConsole(job.job_id);
    }
  }

  dropDownHandler(job: Job) {
    if (!this.currentToggleJob || this.validateDropDownJob(job))
      this.toggleDropDown = !this.toggleDropDown;

    if (this.toggleDropDown) this.currentToggleJob = job._id;
    else this.currentToggleJob = '';
  }

  validateDropDownJob(job: Job) {
    return job._id == this.currentToggleJob;
  }

  displayButtonStatus(job: Job) {
    return this.getCurrentStatus(job) != "Error" ? "Retry Disabled" : "Retry";
  }
}
