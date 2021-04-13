import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../utilily-modules/material.module';
import { DateTimeComponent } from './date-time.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
    //NoopAnimationsModule
  ],
  declarations: [
    DateTimeComponent
  ],
  exports: [
    DateTimeComponent
  ],
  entryComponents: [
    DateTimeComponent
  ],
  providers: [
    DatePipe
  ]
})
export class DateTimeModule { }
