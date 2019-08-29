
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { IHostInfo } from '../interface/rule.interface';
import { RuleSet } from '../interface/ruleSet.interface';

/* Services */
import { PolicyManagementService } from '../services/policy-management.service';

@Component({
  selector: 'policy-management-add-dialog',
  templateUrl: 'policy-management-add-dialog.component.html',
  styleUrls: ['policy-management-add-dialog.component.css'],
})
export class PolicyManagementAddDialog  implements OnInit {
  sensorList: Array<IHostInfo>;
  sensorListSelection: Array<string>;
  sensor = new FormControl();
  ruleSetGroup: FormGroup;

  clearanceLevels: any[];
  ruleType: any[];

  constructor( public dialogRef: MatDialogRef<PolicyManagementAddDialog>,
               private formBuilder: FormBuilder,
               public policySrv: PolicyManagementService,
               @Inject(MAT_DIALOG_DATA) public data: any) {
    this.clearanceLevels = policySrv.clearanceLevels
    this.ruleType = policySrv.ruleType
  }

  ngOnInit() {
    this.policySrv.getSensorHostInfo().subscribe(data => {
      this.sensorList = data;
      this.sensorListSelection = [];

      for (let item of this.sensorList){
        this.sensorListSelection.push(item.hostname);
      }
    });

    if (this.data === 'edit') {
      this.initializeForm(this.policySrv.editRuleSet, true);
    } else {
      this.initializeForm(null);
    }
  }

  initializeForm(ruleSet: RuleSet, isEdit: boolean=false) {
    this.ruleSetGroup = this.formBuilder.group({
      '_id': new FormControl(ruleSet ? ruleSet._id : '0'),
      'name': new FormControl(ruleSet ? ruleSet.name : '', Validators.compose([Validators.required])),
      'clearance': new FormControl(ruleSet ? ruleSet.clearance : ''),
      'sensors': new FormControl(),
      'appType': new FormControl(ruleSet ? ruleSet.appType : ''),
      'isEnabled': new FormControl(ruleSet ? ruleSet.isEnabled : true),
      'groupName': new FormControl(ruleSet ? ruleSet.groupName : '')
    });

    if (isEdit){
      this.ruleSetGroup.get('appType').disable();
      let valuesToSelect = [];
      for (let item of ruleSet.sensors){
        valuesToSelect.push(item.hostname);
      }

      this.ruleSetGroup.get('sensors').setValue(valuesToSelect);
    }
  }

  onSubmit() {
    let valuesToSendBack = [];
    for (let hostname of this.ruleSetGroup.get("sensors").value){
      for (let hostObj of this.sensorList){
        if (hostname === hostObj.hostname){
          valuesToSendBack.push(hostObj);
          break;
        }
      }
    }
    this.ruleSetGroup.get('sensors').setValue(valuesToSendBack);
    this.dialogRef.close(this.ruleSetGroup);
  }

  isRuleSetEnabled(): boolean {
    return this.ruleSetGroup.get('isEnabled').value;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
