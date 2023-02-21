import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GlobalComponentsModule } from '../global-components/global-components.module';
import { ServerStdoutModule } from '../server-stdout/server-stdout.module';
import { MaterialModule } from '../utilily-modules/material.module';
import { AddMipDialogComponent } from './components/add-mip-dialog/add-mip-dialog.component';
import { MipManagementComponent } from './mip-mng.component';

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
    AddMipDialogComponent,
    MipManagementComponent
  ],
  entryComponents: [
    AddMipDialogComponent
  ],
  providers: [
    MipManagementComponent
  ]
})
export class MipMngModule { }
