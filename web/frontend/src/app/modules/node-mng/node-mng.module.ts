import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GlobalComponentsModule } from '../global-components/global-components.module';
import { ServerStdoutModule } from '../server-stdout/server-stdout.module';
import { MaterialModule } from '../utilily-modules/material.module';
import { AddNodeDialogComponent } from './components/add-node-dialog/add-node-dialog.component';
import { NodeManagementComponent } from './node-mng.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BrowserAnimationsModule,
    GlobalComponentsModule,
    ServerStdoutModule
  ],
  declarations: [
    NodeManagementComponent,
    AddNodeDialogComponent
  ],
  entryComponents: [
    AddNodeDialogComponent
  ],
  providers: [
    NodeManagementComponent
  ]
})
export class NodeMngModule { }
