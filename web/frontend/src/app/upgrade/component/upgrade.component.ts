import { Component, OnInit } from '@angular/core';
import { UpgradeService } from '../services/upgrade.service';
import {FormBuilder, FormGroup, Validators, FormControl, FormArray, AbstractControl} from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { KickstartService } from 'src/app/services/kickstart.service';
import { validateFromArray } from '../../validators/generic-validators.validator';
import { COMMON_VALIDATORS } from 'src/app/frontend-constants';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-upgrade',
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.scss']
})
export class UpgradeComponent implements OnInit {
  upgradeFormGroup: FormGroup;
  upgradePathFormGroup: FormGroup;
  paths: Array<string>;
  ctrlDeviceFacts: Object;

  constructor(private upgradeSrv: UpgradeService,
              private formBuilder: FormBuilder,
              private kickStartSrv: KickstartService,
              private snackBar: MatSnackBar) {
    this.ctrlDeviceFacts = {"interfaces": []};
    this.paths = new Array<string>();
  }

  ngOnInit() {
    this.kickStartSrv.gatherDeviceFacts("localhost").subscribe(data => {
      this.ctrlDeviceFacts = data;
    });

    this.upgradeFormGroup = this.formBuilder.group({
      original_controller_ip: new FormControl('', Validators.compose([ validateFromArray(COMMON_VALIDATORS.isValidIP) ])),
      new_ctrl_ip: new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      hidden: new FormControl(undefined, Validators.compose([Validators.required])),
    });

    this.upgradePathFormGroup = this.formBuilder.group({
      selectedPath: new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      username: new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      password: new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
    });
  }

  upgradePaths(stepper: MatStepper) {
    this.upgradeSrv.getUpgradePaths(this.upgradeFormGroup.get('original_controller_ip').value).subscribe(data => {
      this.upgradeFormGroup.get('hidden').setValue("success"); // Used to ensure the user cannot go to next step until the upgrade paths return.
      this.paths = data as Array<string>;
      stepper.next();
    });
  }

  performUpgrade() {
    this.displaySnackBar("Initiated the upgrade task.  Open your notification panel to see its progress. \
    WARNING! Please wait for this process to either complete or fail before performing anyother operations on this Kit!");
    this.upgradeSrv.doUpgrade(this.upgradeFormGroup.value, this.upgradePathFormGroup.value).subscribe(data => {
      console.log(data);
    });
  }

  public getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }
}
