import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { AppConfig, AgentInstallerConfig } from '../agent-builder.service';

@Component({
    selector: 'agent-details-dialog',
    templateUrl: 'agent-details-dialog.component.html',
    styleUrls: ['./agent-details-dialog.component.scss']
  })
export class AgentDetailsDialogComponent implements OnInit {
  appConfigs: Array<AppConfig>;
  config: AgentInstallerConfig;

  constructor(public dialogRef: MatDialogRef<AgentDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){
    let config = data['config'];
    let appConfigs = data['appConfigs'];

    let customPackages = config['customPackages'];
    let packageNames = [];

    if (customPackages) {
      for (let packageName in customPackages) {
        packageNames.push(packageName);
      }
      this.appConfigs = appConfigs.filter(e => {return packageNames.includes(e.name)});
    } else {
      this.appConfigs = [];
    }

    this.config = config;
    
  }

  ngOnInit() {}

  onClose(): void {
    this.dialogRef.close();
  }
}
