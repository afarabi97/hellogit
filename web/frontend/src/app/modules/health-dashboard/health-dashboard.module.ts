import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChartsModule } from 'ng2-charts';

import { GlobalComponentsModule } from '../global-components/global-components.module';
import { NGXMonacoTextEditorModule } from '../ngx-monaco-text-editor/ngx-monaco-text-editor.module';
import { MaterialModule } from '../utilily-modules/material.module';
import { PipesModule } from '../utilily-modules/pipes.module';
import { HealthDashboardDatastoresComponent } from './components/datastores/datastores.component';
import { HealthDashboardDialogComponent } from './components/health-dashboard-dialog/health-dashboard-dialog.component';
import { HealthDashboardNodeTableComponent } from './components/node-table/node-table.component';
import { PodLogDialogComponent } from './components/pod-table/components/pod-log-dialog/pod-log-dialog.component';
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
    ChartsModule,
    PipesModule,
    NGXMonacoTextEditorModule,
    GlobalComponentsModule
  ],
  declarations: [
    HealthDashboardDialogComponent,
    HealthDashboardComponent,
    HealthDashboardNodeTableComponent,
    PodLogDialogComponent,
    HealthDashboardPodTableComponent,
    HealthDashboardDatastoresComponent
  ],
  providers: [
    HealthDashboardStatusService,
    HealthService
  ],
  entryComponents: [
    HealthDashboardDialogComponent,
    PodLogDialogComponent
  ]
})
export class HealthDashboardModule { }
