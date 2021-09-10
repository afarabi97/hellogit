import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NGXMonacoTextEditorModule } from '../ngx-monaco-text-editor/ngx-monaco-text-editor.module';
import { MaterialModule } from '../utilily-modules/material.module';
import { ConfigmapsComponent } from './config-map.component';
import { ConfigMapService } from './services/config-map.service';

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
    ConfigmapsComponent
  ],
  exports: [
    ConfigmapsComponent
  ],
  entryComponents: [
    ConfigmapsComponent
  ],
  providers: [
    ConfigMapService
  ]
})
export class ConfigMapModule { }