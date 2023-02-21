import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GlobalComponentsModule } from '../global-components/global-components.module';
import { MaterialModule } from '../utilily-modules/material.module';
import { PipesModule } from '../utilily-modules/pipes.module';
import { HealthDashboardDatastoresComponent } from './components/datastores/datastores.component';
import { HealthDashboardModalDialogComponent } from './components/health-dashboard-dialog/health-dashboard-dialog.component';
import { HealthDashboardNodeTableComponent } from './components/node-table/node-table.component';
import { PodLogModalDialogComponent } from './components/pod-table/components/pod-log-dialog/pod-log-dialog.component';
import { HealthDashboardPodTableComponent } from './components/pod-table/pod-table.component';
import { HealthDashboardComponent } from './health-dashboard.component';
import { HealthDashboardStatusService } from './services/health-dashboard-status.service';
import { HealthService } from './services/health.service';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BrowserAnimationsModule,
    PipesModule,
    GlobalComponentsModule
  ],
  declarations: [
    HealthDashboardModalDialogComponent,
    HealthDashboardComponent,
    HealthDashboardNodeTableComponent,
    PodLogModalDialogComponent,
    HealthDashboardPodTableComponent,
    HealthDashboardDatastoresComponent
  ],
  providers: [
    HealthDashboardStatusService,
    HealthService
  ],
  entryComponents: [
    HealthDashboardModalDialogComponent,
    PodLogModalDialogComponent
  ]
})
export class HealthDashboardModule { }
