import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { NotificationClass, ObjectUtilitiesClass } from '../../../classes';
import {
  ACCENT_BUTTON_COLOR,
  DIALOG_WIDTH_35PERCENT,
  MAT_SNACKBAR_CONFIGURATION_3000_DUR,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR,
  PRIMARY_BUTTON_COLOR
} from '../../../constants/cvah.constants';
import { MatSnackBarService } from '../../../services/mat-snackbar.service';
import { UserService } from '../../../services/user.service';
import { WebsocketService } from '../../../services/websocket.service';
import { ConfirmDialogComponent } from '../../global-components/components/confirm-dialog/confirm-dialog.component';
import { NotificationStaticMethodsClass } from '../classes/notifications-static-methods.class';
import { DELETE_ALL_NOTIFICATIONS_CONFIRM_DIALOG, NUMBER_OF_NOTIFICATION_ITEMS } from '../constants/notifications.constant';
import { NotificationButtonInterface } from '../interface/notification-button.interface';
import { NotificationDialogDataInterface } from '../interface/notification-dialog-data.interface';
import { NotificationService } from '../services/notification.service';

/**
 * Component used for displaying notification based alerts and notification dialog window
 *
 * @export
 * @class NotificationsDialogComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-notifications-dialog',
  templateUrl: './notifications-dialog.component.html',
  styleUrls: [
    './notifications-dialog.component.scss'
  ]
})
export class NotificationsDialogComponent implements OnInit {
  title: string;
  // Used for keeping track of selected notification button
  selected_notification_button: NotificationButtonInterface;
  // Used for passing const list of buttons to html
  notification_button_list: NotificationButtonInterface[];
  // Used for passing value to html is user is controller maintainer
  controller_maintainer: boolean;
  // Used for scrolling notifications
  private offset_: number;
  private end_of_scroll_: boolean;
  private button_select_gate_active_: boolean;

  /**
   * Creates an instance of NotificationsDialogComponent.
   *
   * @param {MatDialog} mat_dialog_ - Injected MatDialog
   * @param {MatSnackBarService} mat_snackbar_service_ - Injected mat snackbar service
   * @param {UserService} user_service_ - Injected user service
   * @param {WebsocketService} websocket_service_ - Injected websocket service
   * @param {NotificationService} notification_service_ - Injected notification service
   * @memberof NotificationsDialogComponent
   */
  constructor(private mat_dialog_: MatDialog,
              private mat_snackbar_service_: MatSnackBarService,
              private user_service_: UserService,
              private websocket_service_: WebsocketService,
              private notification_service_: NotificationService,
              @Inject(MAT_DIALOG_DATA) public mat_dialog_data: NotificationDialogDataInterface) {
    this.controller_maintainer = this.user_service_.isControllerMaintainer();
    this.title = mat_dialog_data.title;
    this.notification_button_list = mat_dialog_data.button_list;
    this.offset_ = 0;
    this.end_of_scroll_ = false;
    this.button_select_gate_active_ = false;
  }

  /**
   * Used for listening to window scroll event so that notifications can
   * add more to list if available
   *
   * @param {*} event
   * @memberof NotificationsDialogComponent
   */
  @HostListener('window:scroll')
  host_listener_on_scroll(event: any): void {
    //This button gate covers an annoying edge case in the event that the scroll handler
    // is triggered when user also pushes the one of the other filter buttons.
    if (this.button_select_gate_active_) {
      this.button_select_gate_active_ = false;
    } else {
      /* istanbul ignore else */
      if (!this.end_of_scroll_) {
        /* istanbul ignore else */
        if (ObjectUtilitiesClass.notUndefNull(event) &&
            ObjectUtilitiesClass.notUndefNull(event.target) &&
            ObjectUtilitiesClass.notUndefNull(event.target.offsetHeight) &&
            ObjectUtilitiesClass.notUndefNull(event.target.scrollTop) &&
            ObjectUtilitiesClass.notUndefNull(event.target.scrollHeight)) {
          /* istanbul ignore else */
          if (event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight) {
            this.offset_ += NUMBER_OF_NOTIFICATION_ITEMS;
            this.api_get_notifications_(event.target);
          }
        }
      }
    }
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof NotificationsDialogComponent
   */
  ngOnInit(): void {
    this.button_select(this.notification_button_list[0]);
    this.setup_websocket_onbroadcast_();
  }

  /**
   *
   *
   * @param {string} title
   * @return {boolean}
   * @memberof NotificationsDialogComponent
   */
  check_title_defined(title: string): boolean {
    return ObjectUtilitiesClass.notUndefNull(title);
  }

  /**
   * Used for passing selected button from html
   *
   * @param {NotificationButtonInterface} notification_button
   * @memberof NotificationsDialogComponent
   */
  button_select(notification_button: NotificationButtonInterface): void {
    // Reset the endOf scroll, offset_ and clear the notification button list.
    this.offset_ = 0;
    this.end_of_scroll_ = false;
    this.button_select_gate_active_ = true;

    //Set the selected notification button
    this.notification_button_list.forEach((nb: NotificationButtonInterface) => {
      nb.notifications.splice(0, nb.notifications.length);
      if (nb === notification_button) {
        nb.selected = true;
        this.selected_notification_button = nb;
      } else {
        nb.selected = false;
      }
    });

    // Make the api call to the notifcation manager for the new notificiations.
    this.api_get_notifications_();
  }

  /**
   * Used for changing the color of the button on selection
   *
   * @param {NotificationButtonInterface} notification_button
   * @returns
   * @memberof NotificationsModuleComponent
   */
  get_selected_button_color(notification_button: NotificationButtonInterface): string {
    return notification_button.name === this.selected_notification_button.name ? ACCENT_BUTTON_COLOR : PRIMARY_BUTTON_COLOR;
  }

  /**
   * Used for passing private method call to html to delete a notification
   *
   * @param {NotificationClass} notification
   * @memberof NotificationsModuleComponent
   */
  delete_notification(notification: NotificationClass): void {
    this.api_delete_notification_(notification);
  }

  /**
   * Used for opening dialog window to delte all notifications
   *
   * @memberof NotificationsDialogComponent
   */
  open_delete_all_notification_dialog_window(): void {
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_35PERCENT,
      disableClose: true,
      data: DELETE_ALL_NOTIFICATIONS_CONFIRM_DIALOG
    });

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (response === DELETE_ALL_NOTIFICATIONS_CONFIRM_DIALOG.option2) {
            this.api_delete_all_notifications_();
          }
        });
  }

  /**
   * Used for setting up onbroadcast for websocket notification responses
   *
   * @private
   * @memberof NotificationsDialogComponent
   */
  // TODO - properly handle when websocket defined
  private setup_websocket_onbroadcast_(): void {
    this.websocket_service_.onBroadcast()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: NotificationClass) => {
          NotificationStaticMethodsClass.add_notification_to_button_list(response, this.notification_button_list, true);
        });
  }

  /**
   * Used for making api rest call to get notifications
   *
   * @private
   * @param {*} [scroll_element=null]
   * @memberof NotificationsDialogComponent
   */
  private api_get_notifications_(scroll_element: any = null): void {
    this.notification_service_.get_notifications(this.offset_, this.selected_notification_button.role)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: NotificationClass[]) => {
          if (ObjectUtilitiesClass.notUndefNull(scroll_element) &&
              ObjectUtilitiesClass.notUndefNull(scroll_element.scrollTop)) {
            const old_scroll_top: number = scroll_element.scrollTop;
            scroll_element.scrollTop = scroll_element.scrollTop - 100;
            response.forEach((ni: NotificationClass) => NotificationStaticMethodsClass.add_notification_to_button_list(ni, this.notification_button_list));
            scroll_element.scrollTop = old_scroll_top;
            this.end_of_scroll_ = response.length === 0;
          } else {
            response.forEach((ni: NotificationClass) => NotificationStaticMethodsClass.add_notification_to_button_list(ni, this.notification_button_list));
          }
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting all notifications';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to delete notification
   *
   * @private
   * @param {NotificationClass} notification
   * @memberof NotificationsDialogComponent
   */
  private api_delete_notification_(notification: NotificationClass): void {
    this.notification_service_.delete_notification(notification._id)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: void) => {
          this.notification_button_list.forEach((nb: NotificationButtonInterface) => {
            nb.notifications = nb.notifications.filter((n: NotificationClass) => n._id !== notification._id);
            return nb;
          });
          const message: string = 'deleted notification';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_3000_DUR);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'deleting notification';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to delete all notifications
   *
   * @private
   * @memberof NotificationsDialogComponent
   */
  private api_delete_all_notifications_(): void {
    this.notification_service_.delete_all_notifications()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: void) => {
          this.notification_button_list.forEach((nb: NotificationButtonInterface) => nb.notifications = []);
          const message: string = 'deleted all notifications';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_3000_DUR);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'deleting all notifications';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}
