import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GlobalJobService } from '../../services/global-job.service';
import { MaterialModule } from '../utilily-modules/material.module';
import { PipesModule } from '../utilily-modules/pipes.module';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { ModalDialogDisplayMatComponent } from './components/modal-dialog-display-mat/modal-dialog-display-mat.component';
import { ModalDialogMatComponent } from './components/modal-dialog-mat/modal-dialog-mat.component';
import { NodeInfoDialogComponent } from './components/node-info-dialog/node-info-dialog.component';
import { NodeStateProgressBarComponent } from './components/node-state-progress-bar/node-state-progress-bar.component';
import { PasswordMessageComponent } from './components/password-message/password-message.component';
import {
  UnusedIpAddressAutoCompleteComponent
} from './components/unused-ipaddress-autocomplete-ctrl/unused-ipaddress-autocomplete-ctrl.component';
import { VirtualNodeFormComponent } from './components/virtual-node-form/virtual-node-form.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BrowserAnimationsModule,
    PipesModule
  ],
  declarations: [
    ConfirmDialogComponent,
    ModalDialogMatComponent,
    ModalDialogDisplayMatComponent,
    NodeInfoDialogComponent,
    NodeStateProgressBarComponent,
    PasswordMessageComponent,
    UnusedIpAddressAutoCompleteComponent,
    VirtualNodeFormComponent
  ],
  entryComponents: [
    ConfirmDialogComponent,
    ModalDialogMatComponent,
    ModalDialogDisplayMatComponent,
    NodeInfoDialogComponent
  ],
  exports: [
    NodeInfoDialogComponent,
    UnusedIpAddressAutoCompleteComponent,
    NodeStateProgressBarComponent,
    VirtualNodeFormComponent
  ],
  providers: [
    GlobalJobService
  ]
})
export class GlobalComponentsModule { }
