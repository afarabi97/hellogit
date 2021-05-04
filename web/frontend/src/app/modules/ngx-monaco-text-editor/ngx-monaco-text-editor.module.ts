import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MonacoEditorModule } from 'ngx-monaco-editor';

import { MaterialModule } from '../utilily-modules/material.module';
import { NGXMonacoEditorComponent } from './components/ngx-monaco-editor/ngx-monaco-editor.component';
import { NGXMonacoTextEditorComponent } from './ngx-monaco-text-editor.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    MonacoEditorModule,
    MonacoEditorModule.forRoot()
  ],
  declarations: [
    NGXMonacoTextEditorComponent,
    NGXMonacoEditorComponent
  ],
  exports: [
    NGXMonacoTextEditorComponent,
    NGXMonacoEditorComponent
  ],
  entryComponents: [
    NGXMonacoTextEditorComponent,
    NGXMonacoEditorComponent
  ]
})

export class NGXMonacoTextEditorModule { }
