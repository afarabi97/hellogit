import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../utilily-modules/material.module';
import { ChangePasswordFormComponent } from './components/change-password-form/change-password.component';
import { NodeMaintenanceFormComponent } from './components/node-maintenance-form/node-maintenance.component';
import { RepositorySettingsComponent } from './components/repository-settings/repository-settings.component';
import {
  UpdateDocumentationMessageComponent
} from './components/update-documentation-form/components/update-documentation-message.component';
import { UpdateDocsFormComponent } from './components/update-documentation-form/update-docs.component';
import { UpdateEsLicenseComponent } from './components/update-es-license-form/update-es-license-form.component';
import { ToolsService } from './services/tools.service';
import { ToolsFormComponent } from './tools.component';

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
    ChangePasswordFormComponent,
    NodeMaintenanceFormComponent,
    RepositorySettingsComponent,
    UpdateDocumentationMessageComponent,
    UpdateDocsFormComponent,
    UpdateEsLicenseComponent,
    ToolsFormComponent
  ],
  providers: [
    ToolsService
  ]
})
export class ToolsModule { }
