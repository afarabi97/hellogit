import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../utilily-modules/material.module';
import { GeneralSettingsPaneComponent } from './components/general-settings/general-settings-pane.component';
import { KitSettingsPaneComponent } from './components/kit-settings/kit-settings-pane.component';
import {
  AddKitTokenComponent
} from './components/kit-token-settings/components/add-kit-token-dialog/add-kit-token.component';
import {
  CopyTokenModalDialogComponent
} from './components/kit-token-settings/components/copy-token-dialog/copy-token-dialog.component';
import { KitTokenSettingsPaneComponent } from './components/kit-token-settings/kit-token-settings-pane.component';
import { MIPSettingsPaneComponent } from './components/mip-settings/mip-settings-pane.component';
import { VMWareSettingsComponent } from './components/vmware-settings/vmware-settings.component';
import { SystemSettingsComponent } from './system-settings.component';

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
    GeneralSettingsPaneComponent,
    KitSettingsPaneComponent,
    AddKitTokenComponent,
    CopyTokenModalDialogComponent,
    KitTokenSettingsPaneComponent,
    MIPSettingsPaneComponent,
    VMWareSettingsComponent,
    SystemSettingsComponent
  ],
  entryComponents: [
    CopyTokenModalDialogComponent
  ]
})
export class SystemSettingsModule { }
