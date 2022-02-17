import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule
} from '@angular-material-components/datetime-picker';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../utilily-modules/material.module';
import { AlertDrillDownDialogComponent } from './components/alert-drilldown-dialog/alert-drilldown-dialog.component';
import { SecurityAlertsComponent } from './security-alerts.component';

@NgModule({
  imports: [
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  declarations: [
    SecurityAlertsComponent,
    AlertDrillDownDialogComponent
  ],
  exports: [
    SecurityAlertsComponent
  ],
  entryComponents: [
    SecurityAlertsComponent,
    AlertDrillDownDialogComponent
  ]
})
export class SecurityAlertsModule { }
