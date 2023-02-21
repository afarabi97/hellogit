import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GlobalJobService } from '../../services/global-job.service';
import { GlobalComponentsModule } from '../global-components/global-components.module';
import { MaterialModule } from '../utilily-modules/material.module';
import { ServerStdoutComponent } from './server-stdout.component';
import { JobService } from './services/job.service';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    BrowserAnimationsModule,
    GlobalComponentsModule
  ],
  declarations: [
    ServerStdoutComponent
  ],
  exports: [
    ServerStdoutComponent
  ],
  providers: [
    GlobalJobService,
    JobService
  ]
})
export class ServerStdoutModule { }
