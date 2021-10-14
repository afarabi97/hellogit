import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../utilily-modules/material.module';
import { NotificationsComponent } from './notifications.component';
import { NotificationService } from './services/notification.service';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    BrowserAnimationsModule
  ],
  declarations: [
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
