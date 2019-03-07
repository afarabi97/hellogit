
import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { ModalLoadingComponent } from './modal-loading.component';
import { BrowserModule } from '@angular/platform-browser';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@NgModule({
  imports: [
    // FormsModule,
    // ReactiveFormsModule,
    CommonModule,
    BrowserModule
  ],
  declarations: [
    ModalLoadingComponent
  ],
  exports: [
    ModalLoadingComponent
  ],
  providers: [
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [
  ]
})

export class ModalLoadingModule {}
