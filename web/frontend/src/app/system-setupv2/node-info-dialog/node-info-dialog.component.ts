import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KitSettingsService } from '../services/kit-settings.service';

@Component({
  selector: 'node-info-dialog',
  templateUrl: 'node-info-dialog.component.html',
  styleUrls: ['node-info-dialog.component.css'],
})
export class NodeInfoDialog implements OnInit {

  constructor( public dialogRef: MatDialogRef<NodeInfoDialog>,
               private kitSettingsSrv: KitSettingsService,
               @Inject(MAT_DIALOG_DATA) public backingObj: any) {
  }

  ngOnInit(){
    //console.log(this.backingObj);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
