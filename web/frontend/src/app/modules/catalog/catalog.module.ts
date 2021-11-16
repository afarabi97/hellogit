import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../utilily-modules/material.module';
import { PipesModule } from '../utilily-modules/pipes.module';
import { CatalogComponent } from './catalog.component';
import { CardComponent } from './components/card/card.component';
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
    PipesModule
  ],
  declarations: [
    CatalogComponent,
    CardComponent,
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
