
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSelectChange } from '@angular/material';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { RuleSet } from '../interface/ruleSet.interface';

/* Services */
import { PolicyManagementService } from '../services/policy-management.service';

@Component({
  selector: 'policy-mng-upload',
  templateUrl: 'policy-mng-upload.component.html',
  styleUrls: ['policy-mng-upload.component.css'],
})
export class PolicyManagementUploadDialog  implements OnInit {
  sensor = new FormControl();
  ruleSetGroup: FormGroup;

  clearanceLevels: any[];
  ruleType: any[];

  rulesFileToUpload: File = null;

  constructor( public dialogRef: MatDialogRef<PolicyManagementUploadDialog>,
               private formBuilder: FormBuilder,
               public policySrv: PolicyManagementService,
               @Inject(MAT_DIALOG_DATA) public data: any) {
    this.clearanceLevels = policySrv.clearanceLevels
    this.ruleType = policySrv.ruleType
  }

  handleFileInput(files: FileList) {
    this.rulesFileToUpload = files.item(0);
  }

  ngOnInit() {
    this.initializeForm(this.policySrv.editRuleSet, true);
  }

  getRuleSetName(): string{
    return this.ruleSetGroup.get('name').value;
  }

  initializeForm(ruleSet: RuleSet, isEdit: boolean=false) {
    this.ruleSetGroup = this.formBuilder.group({
      '_id': new FormControl(ruleSet ? ruleSet._id : '0'),
      'name': new FormControl(ruleSet ? ruleSet.name : '', Validators.compose([Validators.required]))
    });

    this.ruleSetGroup.get('name').disable();
  }

  onSubmit() {
    let valuesToSendBack = [];
    this.dialogRef.close({'formGroup': this.ruleSetGroup, 'fileToUpload': this.rulesFileToUpload });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
