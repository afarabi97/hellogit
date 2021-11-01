import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AgentInstallerConfig, AppConfig } from '../../agent-builder.service';

@Component({
    selector: 'agent-details-dialog',
    templateUrl: 'agent-details-dialog.component.html',
    styleUrls: ['./agent-details-dialog.component.scss']
  })
export class AgentDetailsDialogComponent {
  appConfigs: AppConfig[];
  config: AgentInstallerConfig;

  constructor(public dialogRef: MatDialogRef<AgentDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.config = data['config'];
    const appConfigs = data['appConfigs'];
    const customPackages = this.config.customPackages;
    const packageNames = customPackages ? Object.keys(customPackages) : [];
    this.appConfigs = customPackages ? appConfigs.filter(e => packageNames.includes(e.name)) : [];
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
