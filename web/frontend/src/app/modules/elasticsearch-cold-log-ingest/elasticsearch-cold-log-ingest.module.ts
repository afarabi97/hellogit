import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NGXMonacoTextEditorModule } from '../ngx-monaco-text-editor/ngx-monaco-text-editor.module';
import { MaterialModule } from '../utilily-modules/material.module';
import { ColdLogIngestComponent } from './cold-log-ingest.component';
import { ColdLogIngestService } from './services/cold-log-ingest.service';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    NGXMonacoTextEditorModule
  ],
  declarations: [
    ColdLogIngestComponent
  ],
  exports: [
    ColdLogIngestComponent
  ],
  entryComponents: [
    ColdLogIngestComponent
  ],
  providers: [
    ColdLogIngestService
  ]
})
export class ElasticsearchColdLogIngestModule { }
