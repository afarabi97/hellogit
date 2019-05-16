import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { PolicyManagementService } from '../services/policy-management.service'

@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.css']
})
export class UploadDialogComponent implements OnInit {

  ruleSetGroup: FormGroup;
  error_message: string = '';
  clearanceLevels: any[];
  ruleType: any[];

  constructor( public dialogRef: MatDialogRef<UploadDialogComponent>,
               private formBuilder: FormBuilder,
               private policySrv: PolicyManagementService,
               @Inject(MAT_DIALOG_DATA) public data: any) { 
    this.clearanceLevels = this.policySrv.clearanceLevels;
    this.ruleType = this.policySrv.ruleType;
  }

  ngOnInit() {
    this.ruleSetGroup = this.formBuilder.group({
      'appType': new FormControl('', [Validators.required]),
      'ruleSetName': new FormControl('', [Validators.required]),
      'groupName': new FormControl('', [Validators.required]),
      'clearance': new FormControl('', [Validators.required])      
    });
    this.onChange()
  }

  selectFile(files: FileList) {
    this.data = files.item(0)
    this.eraseMessage()
  }

  onChange() {
    this.ruleSetGroup.valueChanges.subscribe( () => { this.eraseMessage() } )
  }

  eraseMessage() {
      this.error_message = ''
  }

  onSubmit() {
    if(this.data instanceof File && this.ruleSetGroup.valid) {
      let combined = Object.assign({}, {'file': this.data}, this.ruleSetGroup.value)
      this.data = combined 
      this.dialogRef.close(this.data)
    } else {
      this.error_message = 'Fill out all values'
    }
  }

  onCancel() {
    this.dialogRef.close()
  }

}
