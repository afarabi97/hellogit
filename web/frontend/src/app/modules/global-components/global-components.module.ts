import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GlobalJobService } from '../../services/global-job.service';
import { MaterialModule } from '../utilily-modules/material.module';
import { NodeInfoDialogComponent } from './components/node-info-dialog/node-info-dialog.component';
import { NodeStateProgressBarComponent } from './components/node-state-progress-bar/node-state-progress-bar.component';
import {
  UnusedIpAddressAutoCompleteComponent
} from './components/unused-ipaddress-autocomplete-ctrl/unused-ipaddress-autocomplete-ctrl.component';
import { VirtualNodeFormComponent } from './components/virtual-node-form/virtual-node-form.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BrowserAnimationsModule
  ],
  declarations: [
    NodeInfoDialogComponent,
    UnusedIpAddressAutoCompleteComponent,
    NodeStateProgressBarComponent,
    VirtualNodeFormComponent
  ],
  entryComponents: [
    NodeInfoDialogComponent
  ],
  exports: [
    NodeInfoDialogComponent,
    UnusedIpAddressAutoCompleteComponent,
    NodeStateProgressBarComponent,
    VirtualNodeFormComponent
  ],
  providers: [
    GlobalJobService
  ]
})
export class GlobalComponentsModule { }
