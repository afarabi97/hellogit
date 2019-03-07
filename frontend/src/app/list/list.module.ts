import { CommonModule } from '@angular/common';
import {  MatListModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
//import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { ListComponent } from './list.component';


@NgModule({
  imports: [
    MatListModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule,
    //FlexLayoutModule
  ],
  declarations: [
    ListComponent
  ],
  exports: [
    ListComponent,
    CommonModule,
    FormsModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})

export class ListModule {}
