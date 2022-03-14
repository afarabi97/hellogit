import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { UserService } from '../../services/user.service';

export const target_config_validators = {
  required: [
    { error_message: 'Required field', validatorFn: 'required' }
  ],
  url: [
    { error_message: 'Required field', validatorFn: 'required' },
    { error_message: `Link must start with either 'http://' or 'https://' without quotation marks.`,
      validatorFn: 'pattern', ops: { pattern: /^(http:[/][/])|(https:[/][/])/ } }
  ]
};

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html'
})
export class ToolsFormComponent implements OnInit {

  resetClock: FormGroup;
  controllerMaintainer: boolean;

  constructor(private title: Title,
              private formBuilder: FormBuilder,
              private userService: UserService) {
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  ngOnInit() {
    this.title.setTitle('Tools');
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

}
