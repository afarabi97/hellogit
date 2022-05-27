import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ServerStdoutService } from './services/server-stdout.service';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { ConfirmDialogMatDialogDataInterface } from '../../interfaces';

@Component({
  selector: 'app-server-stdout',
  templateUrl: './server-stdout.component.html',
  styleUrls: ['./server-stdout.component.css']
})
export class ServerStdoutComponent implements OnInit {

  @ViewChild('console') private consoleDiv: ElementRef;
  public scrollStatus: Boolean = true;
  public allowRetry: boolean;
  messages: Array<{msg: string; color: string}>;
  private jobName: string;
  private jobId: string;

  constructor(private stdoutService: ServerStdoutService,
              private route: ActivatedRoute,
              private title: Title,
              private dialog: MatDialog,
              private snackBar: MatSnackBarService,
            ) {
    this.title.setTitle('Console Output');
    this.messages = new Array<{msg: string; color: string}>();
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
        for (const item in data){
          if (item) {
            this.messages.push({msg: data[item]['log'], color: data[item]['color']});
          }
        }

        setTimeout(() => {
          this.scrollToBottom();
        }, 1000);

      });
    });

    this.stdoutService.getMessage().subscribe(data => {
      if ( data['jobid'] === this.jobId ) {
          this.messages.push({msg: data['log'], color: data['color']});
          this.scrollToBottom();
      }
    });

    this.validateAllowRetry();
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
      if( result === confirm_dialog.option2) {
        this.killJob();
      }
    });
  }

  killJob() {
    this.stdoutService.killJob(this.jobId).subscribe( data => {
      this.snackBar.displaySnackBar(`Deleted job ${data['job_id']}`);
    },
      err => {
        this.snackBar.displaySnackBar(err.error['error_message']);
      }
    );
  }

  pauseScroll() {
    this.scrollStatus = !this.scrollStatus;
  }

  retryJob(){
    this.stdoutService.retryJob(this.jobId).subscribe(data => {
      console.log(data);
    }, err => {
      if (err && err.error && err.error['error_message']){
        this.snackBar.displaySnackBar(err.error['error_message']);
      } else {
        console.error(err);
        this.snackBar.displaySnackBar('Failed for an unknown reason.');
      }
    });
  }

  validateAllowRetry() {
    if (this.jobId == null || this.jobId === 'undefined') {
      return;
    }

    this.stdoutService.getJob(this.jobId).subscribe(data => {

      if (data && !data['status'] || data['status'] === 'started'){
        this.allowRetry = false;

        setTimeout(() => {
          this.validateAllowRetry();
        }, data['timeout'] || 7200);
      }

      if (data['status'] === 'failed') {
        this.allowRetry = true;
      }
    });
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
        this.retryJob();
        this.validateAllowRetry();
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
}
