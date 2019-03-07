import { CommonModule } from '@angular/common';
import {  MaterialModule } from '../utilily-modules/material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
//import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { PolicyManagementComponent } from './component/policy-management.component';
import { PolicyManagementDialog } from './dialog/policy-management-dialog.component';
import { PolicyManagementTable } from './table/policy-management-table.component';
import { BrowserModule } from '@angular/platform-browser';
import { PolicyManagementService } from './services/policy-management.service';
import { PolicyManagementAddDialog } from './add-dialog/policy-management-add-dialog.component';
import { ModelDialogModule } from '../modal-dialog/modal-dialog.module';
import { ModalLoadingModule } from '../modal-loading/modal-loading.module';
import { UploadDialogComponent } from './upload-dialog/upload-dialog.component';

@NgModule({
  imports: [
    MaterialModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule,
    //FlexLayoutModule,
    BrowserModule,
    ModelDialogModule,
    ModalLoadingModule
  ],
  declarations: [
    PolicyManagementDialog,
    PolicyManagementComponent,
    PolicyManagementTable,
    PolicyManagementAddDialog,
    UploadDialogComponent
  ],
  exports: [
    PolicyManagementComponent,
    PolicyManagementDialog,
    CommonModule,
    FormsModule
  ],
  providers: [
    PolicyManagementService
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [
    PolicyManagementDialog,
    PolicyManagementComponent,
    PolicyManagementTable,
    PolicyManagementAddDialog,
    UploadDialogComponent
  ]
})

export class PolicyManagementModule {}
