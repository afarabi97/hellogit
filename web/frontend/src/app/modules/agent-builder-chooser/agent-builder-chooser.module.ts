import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../utilily-modules/material.module';
import { AgentBuilderChooserComponent } from './agent-builder-chooser.component';
import { AgentDetailsDialogComponent } from './components/agent-details-dialog/agent-details-dialog.component';
import { AgentInstallerDialogComponent } from './components/agent-installer-dialog/agent-installer-dialog.component';
import { AgentTargetDialogComponent } from './components/agent-target-dialog/agent-target-dialog.component';
import { EndgameService } from './services/endgame.service';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  declarations: [
    AgentBuilderChooserComponent,
    AgentInstallerDialogComponent,
    AgentDetailsDialogComponent,
    AgentTargetDialogComponent
  ],
  exports: [
    AgentBuilderChooserComponent
  ],
  entryComponents: [
    AgentInstallerDialogComponent,
    AgentDetailsDialogComponent,
    AgentTargetDialogComponent
  ],
  providers: [
    EndgameService
  ]
})
export class AgentBuilderChooserModule { }
