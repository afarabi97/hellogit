import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PcapService } from '../../services/pcap.service';
import { MaterialModule } from '../utilily-modules/material.module';
import { ReplayPcapDialogComponent } from './components/replay-pcap-dialog/replay-pcap-dialog.component';
import { PcapFormComponent } from './pcap-form.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BrowserAnimationsModule
  ],
  declarations: [
    PcapFormComponent,
    ReplayPcapDialogComponent
  ],
  entryComponents: [
    ReplayPcapDialogComponent
  ],
  providers: [
    PcapService
  ]
})
export class PCAPFormModule { }
