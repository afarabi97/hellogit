import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GlobalPCAPService } from '../../services/global-pcap.service';
import { SensorHostInfoService } from '../../services/sensor-host-info.service';
import { GlobalComponentsModule } from '../global-components/global-components.module';
import { MaterialModule } from '../utilily-modules/material.module';
import { ReplayPcapDialogComponent } from './components/replay-pcap-dialog/replay-pcap-dialog.component';
import { PcapFormComponent } from './pcap-form.component';
import { PCAPService } from './services/pcap.service';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BrowserAnimationsModule,
    GlobalComponentsModule
  ],
  declarations: [
    PcapFormComponent,
    ReplayPcapDialogComponent
  ],
  entryComponents: [
    ReplayPcapDialogComponent
  ],
  providers: [
    PCAPService,
    GlobalPCAPService,
    SensorHostInfoService
  ]
})
export class PCAPFormModule { }
