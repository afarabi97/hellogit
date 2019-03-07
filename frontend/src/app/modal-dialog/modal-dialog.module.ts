
import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { ModalDialogComponent } from './modal-dialog.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    BrowserModule
  ],
  declarations: [
    ModalDialogComponent
  ],
  exports: [
    ModalDialogComponent
  ],
  providers: [
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [
  ]
})

export class ModelDialogModule {}
