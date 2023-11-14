import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GlobalHiveSettingsService } from '../../services/global-hive-settings.service';
import { GlobalComponentsModule } from '../global-components/global-components.module';
import { ServerStdoutModule } from '../server-stdout/server-stdout.module';
import { MaterialModule } from '../utilily-modules/material.module';
import { GeneralSettingsComponent } from './components/general-settings/general-settings.component';
import { HiveSettingsComponent } from './components/hive-settings/hive-settings.component';
import { KitSettingsComponent } from './components/kit-settings/kit-settings.component';
import {
  AddKitTokenDialogComponent
} from './components/kit-token-settings/components/add-kit-token-dialog/add-kit-token-dialog.component';
import {
  CopyTokenDialogComponent
} from './components/kit-token-settings/components/copy-token-dialog/copy-token-dialog.component';
import { KitTokenSettingsComponent } from './components/kit-token-settings/kit-token-settings.component';
import { MIPSettingsPaneComponent } from './components/mip-settings/mip-settings-pane.component';
import { VMWareSettingsComponent } from './components/vmware-settings/vmware-settings.component';
import { HiveSettingsService } from './services/hive-settings.service';
import { KitTokenSettingsService } from './services/kit-token-settings.service';
import { SystemSettingsComponent } from './system-settings.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BrowserAnimationsModule,
    ServerStdoutModule,
    GlobalComponentsModule
  ],
  declarations: [
    GeneralSettingsComponent,
    HiveSettingsComponent,
    KitSettingsComponent,
    AddKitTokenDialogComponent,
    CopyTokenDialogComponent,
    KitTokenSettingsComponent,
    MIPSettingsPaneComponent,
    VMWareSettingsComponent,
    SystemSettingsComponent
  ],
  entryComponents: [
    KitTokenSettingsComponent,
    CopyTokenDialogComponent
  ],
  providers: [
    HiveSettingsService,
    GlobalHiveSettingsService,
    KitTokenSettingsService
  ]
})
export class SystemSettingsModule { }
