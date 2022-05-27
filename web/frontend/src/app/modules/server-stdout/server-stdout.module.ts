import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../utilily-modules/material.module';
import { ServerStdoutComponent } from './server-stdout.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    BrowserAnimationsModule
  ],
  declarations: [
    ServerStdoutComponent
  ],
  exports: [
    ServerStdoutComponent
  ]
})
export class ServerStdoutModule { }
