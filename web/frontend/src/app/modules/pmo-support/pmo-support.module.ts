import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../utilily-modules/material.module';
import { PmoSupportComponent } from './pmo-support.component';
import { SystemVersionService } from './services/system-version.service';
import { DiagnosticsService } from './services/diagnostics.service';

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
    PmoSupportComponent
  ],
  exports: [
    PmoSupportComponent
  ],
  providers: [
    SystemVersionService,
    DiagnosticsService
  ]
})
export class PmoSupportModule { }
