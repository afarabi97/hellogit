import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { NotificationClass, ObjectUtilitiesClass } from '../../classes';
import { DIALOG_WIDTH_50VW, MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../constants/cvah.constants';
import { NotificationInterface } from '../../interfaces';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { WebsocketService } from '../../services/websocket.service';
import { NotificationStaticMethodsClass } from './classes/notifications-static-methods.class';
import { NotificationsDialogComponent } from './components/notifications-dialog.component';
import {
  DIALOG_MAX_HEIGHT_762PX,
  NOTIFICATION_BUTTON_LIST,
  NOTIFICATION_DIALOG_TITLE
} from './constants/notifications.constant';
import { NotificationButtonInterface } from './interface/notification-button.interface';
import { NotificationDialogDataInterface } from './interface/notification-dialog-data.interface';
import { NotificationService } from './services/notification.service';

/**
 * Component used for displaying notification based alerts and notification dialog window
 *
 * @export
 * @class NotificationsComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: [
    './notifications.component.scss'
  ]
})
export class NotificationsComponent implements OnInit {
  // Used for keeping track of when new notications have come across the websocket
  // the total is used for displaying number in html of new notifications
  new_notifications: NotificationInterface[];
  // Used for passing const list of buttons to html
  notification_button_list: NotificationButtonInterface[];
  // Used for saving that a dialog is open
  private mat_dialog_ref_: MatDialogRef<NotificationsDialogComponent, any>;

  /**
   * Creates an instance of NotificationsComponent.
   *
   * @param {MatDialog} mat_dialog_ - Injected MatDialog
   * @param {MatSnackBarService} mat_snackbar_service_ - Injected mat snackbar service
   * @param {WebsocketService} websocket_service_ - Injected websocket service
   * @param {NotificationService} notification_service_ - Injected notification service
   * @memberof NotificationsComponent
   */
  constructor(private mat_dialog_: MatDialog,
              private mat_snackbar_service_: MatSnackBarService,
              private websocket_service_: WebsocketService,
              private notification_service_: NotificationService) {
    this.notification_button_list = NOTIFICATION_BUTTON_LIST.map((nb: NotificationButtonInterface) => nb);
    this.new_notifications = [];
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof NotificationsComponent
   */
  ngOnInit(): void {
    this.api_get_notifications_();
    this.setup_websocket_onbroadcast_();
  }

  /**
   * Used for opening the notifications dialog window
   *
   * @memberof NotificationsComponent
   */
  open_notification_dialog_window(): void {
    this.new_notifications = [];
    const notification_dialog_data: NotificationDialogDataInterface = {
      title: NOTIFICATION_DIALOG_TITLE,
      button_list: this.notification_button_list
    };
    this.mat_dialog_ref_ = this.mat_dialog_.open(NotificationsDialogComponent, {
      width: DIALOG_WIDTH_50VW,
      height: DIALOG_MAX_HEIGHT_762PX,
      panelClass: 'mat-dialog-container-override',
      data: notification_dialog_data
    });
    this.mat_dialog_ref_.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {
          this.notification_button_list = NOTIFICATION_BUTTON_LIST.map((nb: NotificationButtonInterface) => nb);
          this.api_get_notifications_();
          this.mat_dialog_ref_ = undefined;
        });
  }

  /**
   * Used for setting up onbroadcast for websocket notification responses
   *
   * @private
   * @memberof NotificationsComponent
   */
  // TODO - properly handle when websocket defined
  private setup_websocket_onbroadcast_(): void {
    this.websocket_service_.onBroadcast()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: NotificationClass) => {
          if (!ObjectUtilitiesClass.notUndefNull(this.mat_dialog_ref_)) {
            this.new_notifications.push(response);
            NotificationStaticMethodsClass.add_notification_to_button_list(response, this.notification_button_list, true);
          }
        });
  }

  /**
   * Used for making api rest call to get - {notification}
   *
   * @private
   * @memberof NotificationsComponent
   */
  private api_get_notifications_(): void {
    this.notification_service_.get_notifications(0, 'all')
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: NotificationClass[]) => {
          response.forEach((ni: NotificationClass) => NotificationStaticMethodsClass.add_notification_to_button_list(ni, this.notification_button_list));
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting all notifications';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}
