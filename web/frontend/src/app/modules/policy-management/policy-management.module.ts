import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NGXMonacoTextEditorModule } from '../ngx-monaco-text-editor/ngx-monaco-text-editor.module';
import { MaterialModule } from '../utilily-modules/material.module';
import {
  RuleSetAddEditComponent
} from './components/rule-set-add-edit/rule-set-add-edit.component';
import { RuleAddEditComponent } from './components/rule-add-edit/rule-add-edit.component';
import {
  RulesUploadComponent
} from './components/rules-upload/rules-upload.component';
import { PolicyManagementComponent } from './policy-management.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BrowserAnimationsModule,
    NGXMonacoTextEditorModule
  ],
  declarations: [
    RuleSetAddEditComponent,
    RuleAddEditComponent,
    RulesUploadComponent,
    PolicyManagementComponent
  ],
  exports: [
    PolicyManagementComponent
  ],
  entryComponents: [
    RuleSetAddEditComponent,
    RuleAddEditComponent,
    RulesUploadComponent,
    PolicyManagementComponent
  ]
})
export class PolicyManagementModule { }
