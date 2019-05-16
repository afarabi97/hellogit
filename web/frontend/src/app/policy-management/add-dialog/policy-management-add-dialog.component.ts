
import { Component, Inject, OnInit } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ErrorMessage, IHostInfo } from '../interface/rule.interface';
import { RuleSet, IRuleSet } from '../interface/ruleSet.interface';

/* Services */
import { PolicyManagementService } from '../services/policy-management.service';
import { HtmlModalPopUp, ModalType } from '../../html-elements';

@Component({
  selector: 'policy-management-add-dialog',
  templateUrl: 'policy-management-add-dialog.component.html',
  styleUrls: ['policy-management-add-dialog.component.css'],
})
export class PolicyManagementAddDialog  implements OnInit{
  sensorList: Array<IHostInfo>;
  sensor = new FormControl();
  ruleSetGroup: FormGroup;
  messageDialog2: HtmlModalPopUp;

  clearanceLevels: any[];
  ruleType: any[];

  constructor( public dialogRef: MatDialogRef<PolicyManagementAddDialog>,
               private formBuilder: FormBuilder,
               public _PolicyManagementService: PolicyManagementService,
               @Inject(MAT_DIALOG_DATA) public data: any) {
    this.messageDialog2 = new HtmlModalPopUp("msg_modal2");
    this.clearanceLevels = _PolicyManagementService.clearanceLevels
    this.ruleType = _PolicyManagementService.ruleType
  }

  ngOnInit() {
    this._PolicyManagementService.getSensorHostInfo().subscribe(data => {
      this.sensorList = data;
    });

    if (this.data === 'edit') {
      this.initializeForm(this._PolicyManagementService.editRuleSet);
    } else {
      this.initializeForm(this.ruleSetGroup);
    }
  }

  initializeForm(ruleSet: any) {
    this.ruleSetGroup = this.formBuilder.group({
      '_id': new FormControl(ruleSet ? ruleSet._id : '0'),
      'name': new FormControl(ruleSet ? ruleSet.name : '', Validators.compose([Validators.required])),
      'clearance': new FormControl(ruleSet ? ruleSet.clearance : ''),
      'sensors': new FormControl(ruleSet ? ruleSet.sensors : []),
      'appType': new FormControl(ruleSet ? ruleSet.appType : ''),
      'isEnabled': new FormControl(ruleSet ? ruleSet.isEnabled : true),
      'groupName': new FormControl(ruleSet ? ruleSet.groupName : '')
    });
  }

  onSubmit() {
    if (this.data === 'edit') {
      this._PolicyManagementService.updateRuleSet(this.ruleSetGroup.value as IRuleSet).subscribe(data => {
        if (data instanceof RuleSet){
          const index = this._PolicyManagementService.ruleSets.findIndex( i => i._id === data._id);
          this._PolicyManagementService.ruleSets[index] = data;          
          this._PolicyManagementService.dataSource.data = this._PolicyManagementService.ruleSets;
        } else if (data instanceof ErrorMessage) {
          this.messageDialog2.updateModal("ERROR", data.error_message, "Close", undefined, ModalType.error);
          this.messageDialog2.openModal();
        }
      });
    } else {
      this._PolicyManagementService.createRuleSet(this.ruleSetGroup.value as IRuleSet).subscribe(data => {
        if (data instanceof RuleSet){
          this._PolicyManagementService.ruleSets.push(data);
          this._PolicyManagementService.dataSource.data = this._PolicyManagementService.ruleSets;
        } else if (data instanceof ErrorMessage) {
          this.messageDialog2.updateModal("ERROR", data.error_message, "Close", undefined, ModalType.error);
          this.messageDialog2.openModal();
        }
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
