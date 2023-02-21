import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GlobalComponentsModule } from '../global-components/global-components.module';
import { NGXMonacoTextEditorModule } from '../ngx-monaco-text-editor/ngx-monaco-text-editor.module';
import { MaterialModule } from '../utilily-modules/material.module';
import { ElasticsearchScaleComponent } from './elasticsearch-scale.component';
import { ElasticsearchService } from './services/elasticsearch.service';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    NGXMonacoTextEditorModule,
    GlobalComponentsModule
  ],
  declarations: [
    ElasticsearchScaleComponent
  ],
  exports: [
    ElasticsearchScaleComponent
  ],
  entryComponents: [
    ElasticsearchScaleComponent
  ],
  providers: [
    ElasticsearchService
  ]
})
export class ElasticsearchScaleModule { }
