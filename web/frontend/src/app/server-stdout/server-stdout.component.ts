import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ServerStdoutService } from './server-stdout.service';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HtmlModalPopUp } from '../html-elements';

@Component({
  selector: 'app-server-stdout',
  templateUrl: './server-stdout.component.html',
  styleUrls: ['./server-stdout.component.css']
})
export class ServerStdoutComponent implements OnInit {

  @ViewChild('console')
  private consoleDiv: ElementRef;
  private jobName: string;
  killModal: HtmlModalPopUp;

  messages: Array<{msg: string, color: string}>;
  constructor(private stdoutService: ServerStdoutService,
              private route: ActivatedRoute,
              private title: Title
            ) {
    this.title.setTitle("Console Output");
    this.messages = new Array<{msg: string, color: string}>();
    this.jobName = null;
    this.killModal = new HtmlModalPopUp('kill_modal');
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
      this.messages.push({msg: data['log'], color: data['color']});
      this.scrollToBottom();
    });

  }

  ngAfterViewInit(){
    this.resizeConsole();
  }

  public scrollToBottom(){
    this.consoleDiv.nativeElement.scrollTop = this.consoleDiv.nativeElement.scrollHeight;
  }

  private resizeConsole(){
    let height: string = "";
    if (window.innerHeight > 400){
      height = (window.innerHeight - 170) + "px";
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
    this.killModal.updateModal('WARNING',
      'Are you sure you want to kill this job?',
      "Yes",
      'Cancel'
    )
    this.killModal.openModal();
  }

  killJob() {
    this.stdoutService.killJob(this.jobName).subscribe();
  }
}
