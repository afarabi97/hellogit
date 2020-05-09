import { Component, OnInit } from '@angular/core';
import { ToolsService } from './tools.service';
import { Title } from '@angular/platform-browser';
import { ConfirmDailogComponent } from '../confirm-dailog/confirm-dailog.component'
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../user.service';

const DIALOG_WIDTH = "800px";

export const target_config_validators = {
  required: [
    { error_message: 'Required field', validatorFn: 'required' }
  ],
  url: [
    { error_message: 'Required field', validatorFn: 'required' },
    { error_message: "Link must start with either 'http://' or 'https://' without quotation marks.",
      validatorFn: 'pattern', ops: { pattern: /^(http:[/][/])|(https:[/][/])/ } }
  ]
}

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})
export class ToolsFormComponent implements OnInit {

  resetClock: FormGroup;
  controllerMaintainer: boolean;

  constructor(private toolsSrv: ToolsService,
              private title: Title,
              private dialog: MatDialog,
              private formBuilder: FormBuilder,
              private snackBar: MatSnackBar,
              private userService: UserService) {
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  ngOnInit() {
    this.title.setTitle("Tools");
    this.resetClock = this.formBuilder.group({
      date: new FormControl(),
      timezone: new FormControl('UTC')
    });
  }

  getDate(): FormControl{
    return this.resetClock.get('date') as FormControl;
  }

  getTimezone(): FormControl {
    return this.resetClock.get('timezone') as FormControl;
  }

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  openConfirmResetClockDialog(){

    const option2 = "Confirm";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: DIALOG_WIDTH,
      data: { "paneString": "Are you sure you want to the system clock on your entire Kit setup?",
              "paneTitle": "Change Clock", "option1": "Cancel", "option2": option2 },
    });

    dialogRef.afterClosed().subscribe(response => {
      const err_msg = "Failed to change the time on your DIP for an unknown reason.  Check /var/log/tfplenum/*.log for more details.";
      if (response === option2) {
        this.displaySnackBar("Initiated a change clock task. Please wait for confirmation of changes.");
        this.toolsSrv.changeKitClock(this.resetClock.value).subscribe(data => {
          if (data && data['message']){
            this.displaySnackBar(data['message']);
          } else {
            this.displaySnackBar(err_msg);
          }
        }, err => {
          this.displaySnackBar(err_msg);
        });
      }
    });
  }
}
