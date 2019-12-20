import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl,
         FormGroup, Validators } from '@angular/forms';
import { validateFromArray } from 'src/app/validators/generic-validators.validator';
import { MatStepper } from '@angular/material';
import { COMMON_VALIDATORS } from 'src/app/frontend-constants';
import { ToolsService } from '../../tools.service';
import { ConfirmActionPopup } from 'src/app/classes/ConfirmActionPopup';


@Component({
  selector: 'snap-setup-wizard',
  templateUrl: 'snap-setup-wizard.component.html',
  styleUrls: ['./snap-setup-wizard.component.scss']
})
export class SnapShotSetupComponent implements OnInit {
  nfsSetup: FormGroup;
  elkRestart: FormGroup;

  isMountBtnDisabled: boolean;
  isRegisterBtnDisabled: boolean;
  private associatedPods: Array<{podName:string, namespace: string}>;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SnapShotSetupComponent>,
    private toolSvc: ToolsService,
    private confirmer: ConfirmActionPopup
  ) {
    this.isMountBtnDisabled = false;
    this.isRegisterBtnDisabled = false;
    this.associatedPods = new Array();
    dialogRef.disableClose = true;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  mountShares(stepper: MatStepper){
    this.isMountBtnDisabled = true;
    this.toolSvc.displaySnackBar("Mounting shares on Nodes. Please wait.");
    this.toolSvc.mountNFSshares(this.nfsSetup).subscribe(data => {
      if (data && data["success_message"]){
        this.toolSvc.displaySnackBar(data["success_message"]);
        this.nfsSetup.get('is_successful').setValue(true);
        stepper.next();
      } else if (data && data["error_message"]){
        this.toolSvc.displaySnackBar(data["error_message"]);
      }
      this.isMountBtnDisabled = false;
    }, err => {
      this.toolSvc.displaySnackBar(err.message);
      console.log(err);
      this.isMountBtnDisabled = false;
    });
  }

  private restartELK(stepper: MatStepper){
    this.toolSvc.restartElasticSearch(this.associatedPods).subscribe(data => {
      this.elkRestart.get('is_successful').setValue(true);
      this.toolSvc.displaySnackBar("Restarting Elasticsearch cluster and finishing repo Registration! \
                                    To track its progress open the notification manager.");
      this.dialogRef.close();
    }, err => {
      console.error(err);
      this.toolSvc.displaySnackBar(err.message);
    });
  }

  restartElasticSearchAndCompleteRegistration(stepper: MatStepper){
    let confirmText = 'Are you sure you want to restart your Elasticsearch cluster and \
                       complete snapshot registration? Doing so may cause Elasticsearch to become temporarily unavailable.';
    this.confirmer.confirmAction(
      "Restart ELK",
      confirmText,
      "Confirm",
      "Restart ELK",
      "Could not save.",
      () => { this.restartELK(stepper) }
    );
  }

  ngOnInit() {
    this.nfsSetup = this.fb.group({
      nfs_host: new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      is_successful: new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]))
    });

    this.elkRestart = this.fb.group({
      is_successful: new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]))
    });
  }

  public getErrorMessage(form: FormGroup, control_name: string): string {
    let control = form.get(control_name);
    return control.errors ? control.errors.error_message : '';
  }
}
