import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ServerStdoutService } from './server-stdout.service';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ConfirmDailogComponent } from '../confirm-dailog/confirm-dailog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-server-stdout',
  templateUrl: './server-stdout.component.html',
  styleUrls: ['./server-stdout.component.css']
})
export class ServerStdoutComponent implements OnInit {

  @ViewChild('console', {static: false})
  private consoleDiv: ElementRef;
  private jobName: string;
  public scrollStatus: Boolean = true;

  messages: Array<{msg: string, color: string}>;
  constructor(private stdoutService: ServerStdoutService,
              private route: ActivatedRoute,
              private title: Title,
              private dialog: MatDialog
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
     //console.log("Width: " + event.target.innerWidth);
     this.resizeConsole();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.jobName = params['id'];

      this.stdoutService.getConsoleOutput(this.jobName).subscribe(data => {
        for (let item in data){
          this.messages.push({msg: data[item]['log'], color: data[item]['color']});
        }

        setTimeout(() => {
          this.scrollToBottom();
        }, 1000);

      });
    });

    this.stdoutService.getMessage().subscribe(data => {
      if ( this.jobName == "Kit" &&
      (data['jobName'] == "Kit" || data['jobName'] == "Stignode")) {
          this.messages.push({msg: data['log'], color: data['color']});
          this.scrollToBottom();
      }
      else if(this.jobName == data['jobName'] ) {
        this.messages.push({msg: data['log'], color: data['color']});
        this.scrollToBottom();
      }
    });
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

  clearConsole() {
    this.messages = new Array<{msg: string, color: string}>();
    this.stdoutService.removeConsoleOutput({jobName: this.jobName, jobid: "Not Implemented"}).subscribe();
  }

  openKillModal(){
    let option1 = "Cancel";
    let option2 = "Yes";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: '35%',
      data: {"paneString": 'Are you sure you want to kill this job?', "paneTitle": 'Kill ' + this.jobName, "option1": option1, "option2": option2},
    });

    dialogRef.afterClosed().subscribe(result => {
      if( result === option2) {
        this.killJob();
      }
    });
  }

  killJob() {
    this.stdoutService.killJob(this.jobName).subscribe();
  }

  pauseScroll() {
    this.scrollStatus = !this.scrollStatus;
  }
}
