import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GlobalComponentsModule } from '../global-components/global-components.module';
import { MaterialModule } from '../utilily-modules/material.module';
import { NotificationsDialogComponent } from './components/notifications-dialog.component';
import { NotificationsComponent } from './notifications.component';
import { NotificationService } from './services/notification.service';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    BrowserAnimationsModule,
    GlobalComponentsModule
  ],
  declarations: [
    NotificationsDialogComponent,
    NotificationsComponent
  ],
  exports: [
    NotificationsComponent
  ],
  providers: [
    NotificationService
  ]
})
export class NotificationsModule { }
