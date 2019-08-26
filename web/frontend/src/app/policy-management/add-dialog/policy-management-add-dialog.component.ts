
import { Component, Inject, OnInit } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ErrorMessage, IHostInfo } from '../interface/rule.interface';
import { RuleSet, IRuleSet } from '../interface/ruleSet.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

/* Services */
import { PolicyManagementService } from '../services/policy-management.service';

@Component({
  selector: 'policy-management-add-dialog',
  templateUrl: 'policy-management-add-dialog.component.html',
  styleUrls: ['policy-management-add-dialog.component.css'],
})
export class PolicyManagementAddDialog  implements OnInit{
  sensorList: Array<IHostInfo>;
  sensor = new FormControl();
  ruleSetGroup: FormGroup;  

  clearanceLevels: any[];
  ruleType: any[];

  constructor( public dialogRef: MatDialogRef<PolicyManagementAddDialog>,
               private formBuilder: FormBuilder,
               private snackBar: MatSnackBar,
               public _PolicyManagementService: PolicyManagementService,
               @Inject(MAT_DIALOG_DATA) public data: any) {    
    this.clearanceLevels = _PolicyManagementService.clearanceLevels
    this.ruleType = _PolicyManagementService.ruleType
  }

  ngOnInit() {
    this._PolicyManagementService.getSensorHostInfo().subscribe(data => {
      this.sensorList = data;
    });

    if (this.data === 'edit') {
      this.initializeForm(this._PolicyManagementService.editRuleSet, true);
    } else {
      this.initializeForm(this.ruleSetGroup);
    }
  }

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  initializeForm(ruleSet: any, isEdit: boolean=false) {
    this.ruleSetGroup = this.formBuilder.group({
      '_id': new FormControl(ruleSet ? ruleSet._id : '0'),
      'name': new FormControl(ruleSet ? ruleSet.name : '', Validators.compose([Validators.required])),
      'clearance': new FormControl(ruleSet ? ruleSet.clearance : ''),
      'sensors': new FormControl(ruleSet ? ruleSet.sensors : []),
      'appType': new FormControl(ruleSet ? ruleSet.appType : ''),
      'isEnabled': new FormControl(ruleSet ? ruleSet.isEnabled : true),
      'groupName': new FormControl(ruleSet ? ruleSet.groupName : '')
    });

    if (isEdit){
      this.ruleSetGroup.get('appType').disable();
    }
  }

  onSubmit() {
    if (this.data === 'edit') {
      this._PolicyManagementService.updateRuleSet(this.ruleSetGroup.value as IRuleSet).subscribe(data => {
        if (data instanceof RuleSet){
          const index = this._PolicyManagementService.ruleSets.findIndex( i => i._id === data._id);
          this._PolicyManagementService.ruleSets[index] = data;          
          this._PolicyManagementService.dataSource.data = this._PolicyManagementService.ruleSets;
        } else if (data instanceof ErrorMessage) {
          this.displaySnackBar(data.error_message);
        }
      }, err => {
        this.displaySnackBar("Failed ot update ruleset of unknown reason.");
        console.log(err);
      });
    } else {
      this._PolicyManagementService.createRuleSet(this.ruleSetGroup.value as IRuleSet).subscribe(data => {
        if (data instanceof RuleSet){
          this._PolicyManagementService.ruleSets.push(data);
          this._PolicyManagementService.dataSource.data = this._PolicyManagementService.ruleSets;
        } else if (data instanceof ErrorMessage) {
          this.displaySnackBar(data.error_message);
        }
      }, err => {
        this.displaySnackBar("Failed ot create ruleset of unknown reason.");
        console.log(err);
      });
    }    
  }

  isRuleSetEnabled(): boolean {
    return this.ruleSetGroup.get('isEnabled').value;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
