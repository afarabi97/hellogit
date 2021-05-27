import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ServerStdoutService } from './server-stdout.service';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ConfirmDailogComponent } from '../confirm-dailog/confirm-dailog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarService } from '../services/mat-snackbar.service';

@Component({
  selector: 'app-server-stdout',
  templateUrl: './server-stdout.component.html',
  styleUrls: ['./server-stdout.component.css']
})
export class ServerStdoutComponent implements OnInit {

  @ViewChild('console')
  private consoleDiv: ElementRef;
  private jobName: string;
  private jobId: string;
  public scrollStatus: Boolean = true;
  public allowRetry: boolean;
  messages: Array<{msg: string, color: string}>;

  constructor(private stdoutService: ServerStdoutService,
              private route: ActivatedRoute,
              private title: Title,
              private dialog: MatDialog,
              private snackBar: MatSnackBarService,
            ) {
    this.title.setTitle("Console Output");
    this.messages = new Array<{msg: string, color: string}>();
    this.jobName = null;
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
    this.route.params.subscribe(params => {
      this.jobId = params['id'];
      this.stdoutService.getConsoleOutput(this.jobId).subscribe(data => {
        for (let item in data){
          this.messages.push({msg: data[item]['log'], color: data[item]['color']});
        }

        setTimeout(() => {
          this.scrollToBottom();
        }, 1000);

      });
    });

    this.stdoutService.getMessage().subscribe(data => {
      if ( data['jobid'] == this.jobId ) {
          this.messages.push({msg: data['log'], color: data['color']});
          this.scrollToBottom();
      }
    });

    this.validateAllowRetry();
  }

  ngAfterViewInit(){
    this.resizeConsole();
  }

  public scrollToBottom(){
    if(this.scrollStatus) {
      this.consoleDiv.nativeElement.scrollTop = this.consoleDiv.nativeElement.scrollHeight;
    }
  }

  private resizeConsole(){
    let height: string = "";
    if (window.innerHeight > 400){
      height = (window.innerHeight - 64) + "px";
    } else {
      height = "100px";
    }
    this.consoleDiv.nativeElement.style.maxHeight = height;
    this.consoleDiv.nativeElement.style.height = height;
  }

  private message = {
    message: 'this is a test message'
  }

  openKillModal(){
    let option1 = "Cancel";
    let option2 = "Yes";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: '35%',
      data: {"paneString": 'Are you sure you want to kill this job?', "paneTitle": 'Kill Job', "option1": option1, "option2": option2},
    });

    dialogRef.afterClosed().subscribe(result => {
      if( result === option2) {
        this.killJob();
      }
    });
  }

  killJob() {
    this.stdoutService.killJob(this.jobId).subscribe();
  }

  pauseScroll() {
    this.scrollStatus = !this.scrollStatus;
  }

  retryJob(){
    this.stdoutService.retryJob(this.jobId).subscribe(data => {
      console.log(data);
    }, err => {
      if (err && err.error && err.error['message']){
        this.snackBar.displaySnackBar(err.error['message']);
      } else {
        console.error(err);
        this.snackBar.displaySnackBar("Failed for an unknown reason.");
      }
    });
  }

  validateAllowRetry() {
    if (this.jobId == null || this.jobId === "undefined") return;

    this.stdoutService.getJob(this.jobId).subscribe(data => {

      if (data && !data['status'] || data['status'] === 'started'){
        this.allowRetry = false;

        setTimeout(() => {
          this.validateAllowRetry();
        }, data['timeout'] || 7200);
      }

      if (data['status'] === 'failed') this.allowRetry = true;
    });
  }

  openRetryJobModal(){
    let option1 = "Cancel";
    let option2 = "Yes";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: '35%',
      data: {"paneString": 'Are you sure you want to rerun this job?', "paneTitle": 'Retry Job', "option1": option1, "option2": option2},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === option2) {
        this.retryJob();
        this.validateAllowRetry();
      }
    });
  }
}
