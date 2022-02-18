import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NGXMonacoTextEditorModule } from '../ngx-monaco-text-editor/ngx-monaco-text-editor.module';
import { MaterialModule } from '../utilily-modules/material.module';
import { PipesModule } from '../utilily-modules/pipes.module';
import { CatalogComponent } from './catalog.component';
import { ApplicationCardComponent } from './components/application-card/application-card.component';
import { CatalogPageComponent } from './components/catalog-page/catalog-page.component';
import { ChartListComponent } from './components/chart-list/chart-list.component';
import { NodeBackgroundComponent } from './components/node-background/node-background.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    NGXMonacoTextEditorModule,
    PipesModule
  ],
  declarations: [
    CatalogComponent,
    ApplicationCardComponent,
    ChartListComponent,
    NodeBackgroundComponent,
    CatalogPageComponent
  ],
  exports: [
    CatalogComponent,
    CatalogPageComponent
  ]
})
export class CatalogModule { }
