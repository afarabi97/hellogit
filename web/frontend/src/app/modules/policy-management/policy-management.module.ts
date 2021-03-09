import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../utilily-modules/material.module';
import {
  PolicyManagementAddDialogComponent
} from './components/policy-management-add-dialog/policy-management-add-dialog.component';
import { PolicyManagementDialogComponent } from './components/policy-management-dialog/policy-management-dialog.component';
import { PolicyManagementTableComponent } from './components/policy-management-table/policy-management-table.component';
import {
  PolicyManagementUploadDialogComponent
} from './components/policy-management-upload-dialog/policy-management-upload-dialog.component';
import { PolicyManagementComponent } from './policy-management.component';

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
    PolicyManagementAddDialogComponent,
    PolicyManagementDialogComponent,
    PolicyManagementTableComponent,
    PolicyManagementUploadDialogComponent,
    PolicyManagementComponent
  ],
  exports: [
    PolicyManagementComponent
  ],
  entryComponents: [
    PolicyManagementAddDialogComponent,
    PolicyManagementDialogComponent,
    PolicyManagementTableComponent,
    PolicyManagementUploadDialogComponent,
    PolicyManagementComponent
  ]
})
export class PolicyManagementModule { }
