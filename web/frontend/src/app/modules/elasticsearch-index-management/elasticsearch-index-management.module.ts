import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../utilily-modules/material.module';
import { ElasticsearchIndexManagementComponent } from './elasticsearch-index-management.component';
import { IndexManagementService } from './services/index-management.service';

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
    ElasticsearchIndexManagementComponent
  ],
  exports: [
    ElasticsearchIndexManagementComponent
  ],
  entryComponents: [
    ElasticsearchIndexManagementComponent
  ],
  providers: [
    IndexManagementService
  ]
})
export class ElasticsearchIndexManagementModule { }
