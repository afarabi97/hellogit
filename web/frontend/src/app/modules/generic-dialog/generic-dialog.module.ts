import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MaterialModule } from '../utilily-modules/material.module';
import { GenericButtonComponent } from './components/generic-dialog-button/generic-dialog-button.component';
import { GenericDialogComponent } from './generic-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    GenericDialogComponent,
    GenericButtonComponent
  ],
  declarations: [
    GenericDialogComponent,
    GenericButtonComponent
  ],
  entryComponents: [
    GenericDialogComponent
  ]
})
export class GenericDialogModule { }
