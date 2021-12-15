import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { NotificationClass, ObjectUtilitiesClass } from '../../classes';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import {
  ACCENT_BUTTON_COLOR,
  DIALOG_WIDTH_35PERCENT,
  DIALOG_WIDTH_50VW,
  MAT_SNACKBAR_CONFIGURATION_3000_DUR,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR,
  PRIMARY_BUTTON_COLOR
} from '../../constants/cvah.constants';
import { DialogDataInterface, NotificationInterface } from '../../interfaces';
import { GenericDialogFactoryService } from '../../services/generic-dialog-factory.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { UserService } from '../../services/user.service';
import { WebsocketService } from '../../services/websocket.service';
import {
  DEFAULT_SELECTED_NOTIFICATION_BUTTON,
  DELETE_ALL_NOTIFICATIONS_CONFIRM_DIALOG,
  DIALOG_MAX_HEIGHT_762PX,
  NOTIFICATION_BUTTON_LIST,
  NOTIFICATION_DIALOG_TITLE,
  NUMBER_OF_NOTIFICATION_ITEMS
} from './constants/notifications.constant';
import { NotificationButtonInterface } from './interface/notification-button.interface';
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
  // Used for passing template ref to generic dialog window
  @ViewChild('notificationDialog') notification_dialog_template_ref: TemplateRef<any>;
  // Used for keeping track of when new notications have come across the websocket
  // the total is used for displaying number in html of new notifications
  new_notifications: NotificationInterface[];
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
   * Creates an instance of NotificationsComponent.
   *
   * @param {MatDialog} mat_dialog_ - Injected MatDialog
   * @param {GenericDialogFactoryService} generic_dialog_factory_service_ - Injected generic dialog factory service
   * @param {MatSnackBarService} mat_snackbar_service_ - Injected mat snackbar service
   * @param {UserService} user_service_ - Injected user service
   * @param {WebsocketService} websocket_service_ - Injected websocket service
   * @param {NotificationService} notification_service_ - Injected notification service
   * @memberof NotificationsComponent
   */
  constructor(private mat_dialog_: MatDialog,
              private generic_dialog_factory_service_: GenericDialogFactoryService,
              private mat_snackbar_service_: MatSnackBarService,
              private user_service_: UserService,
              private websocket_service_: WebsocketService,
              private notification_service_: NotificationService) {
    this.controller_maintainer = this.user_service_.isControllerMaintainer();
    this.notification_button_list = NOTIFICATION_BUTTON_LIST.map((nb: NotificationButtonInterface) => nb);
    this.selected_notification_button = DEFAULT_SELECTED_NOTIFICATION_BUTTON;
    this.new_notifications = [];
    this.offset_ = 0;
    this.end_of_scroll_ = false;
    this.button_select_gate_active_ = false;
  }

  /**
   * Used for listening to window scroll event so that notifications can
   * add more to list if available
   *
   * @param {*} event
   * @memberof NotificationsComponent
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
   * @memberof NotificationsComponent
   */
  ngOnInit(): void {
    this.setup_websocket_onbroadcast_();
  }

  /**
   * Used for passing selected button from html
   *
   * @param {NotificationButtonInterface} notification_button
   * @memberof NotificationsComponent
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
   * @param {*} button
   * @returns
   * @memberof NotificationsModuleComponent
   */
  get_selected_button_color(notification_button: NotificationButtonInterface): string {
    return notification_button.name === this.selected_notification_button.name ? ACCENT_BUTTON_COLOR : PRIMARY_BUTTON_COLOR;
  }

  /**
   * Used for passing private method call to html to delete a notification
   *
   * @param {string} id
   * @memberof NotificationsModuleComponent
   */
  delete_notification(notification: NotificationClass): void {
    this.api_delete_notification_(notification);
  }

  /**
   * Used for opening dialog window to delte all notifications
   *
   * @memberof NotificationsComponent
   */
  open_delete_all_notification_dialog_window(): void {
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_35PERCENT,
      data: DELETE_ALL_NOTIFICATIONS_CONFIRM_DIALOG,
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
   * Used for opening the notifications dialog window
   *
   * @memberof NotificationsComponent
   */
  open_notification_dialog_window(): void {
    this.new_notifications = [];
    const dialog_data: DialogDataInterface<any> = {
      title: NOTIFICATION_DIALOG_TITLE,
      template: this.notification_dialog_template_ref
    };
    const mat_dialog_config: MatDialogConfig = {
      width: DIALOG_WIDTH_50VW,
      height: DIALOG_MAX_HEIGHT_762PX,
      panelClass: 'mat-dialog-container-override',
      data: this.notification_button_list
    };

    // Reset the endOf scroll, offset_ and clear the notification button list.
    this.offset_ = 0;
    this.end_of_scroll_ = false;

    //Set the selected notification button
    for (let i = 0; i < this.notification_button_list.length; i++){
      this.notification_button_list[i].notifications.splice(0, this.notification_button_list[i].notifications.length);
      if (i === 0){
        this.notification_button_list[0].selected = true;
        this.selected_notification_button = this.notification_button_list[0];
      } else {
        this.notification_button_list[i].selected = false;
      }
    }

    // Make the api call to the notifcation manager for the new notificiations.
    this.api_get_notifications_();
    this.generic_dialog_factory_service_.open(dialog_data, mat_dialog_config);
  }

  /**
   * Used for adding a notification to the notifications array within corresponding
   * notifications button
   *
   * @private
   * @param {NotificationClass} notification
   * @memberof NotificationsComponent
   */
  private add_notification_to_button_list_(notification: NotificationClass, fromWebSocket=false): void {
    this.notification_button_list.forEach((nb: NotificationButtonInterface) => {
      this.set_notification_display_time_(notification);
      if ((nb.role === notification.role) || (nb.role === 'all')) {
        if (fromWebSocket) {
          nb.notifications.unshift(notification);
        } else {
          nb.notifications.push(notification);
        }
      }
    });
  }

  /**
   * Creates a display time that is used to show how old the notification is
   *
   * @private
   * @param {NotificationClass} notification
   * @returns {NotificationClass}
   * @memberof NotificationsComponent
   */
  private set_notification_display_time_(notification: NotificationClass): NotificationClass {
    const date: Date = new Date();
    const time_now: Date = new Date(date.toUTCString());
    const d1: Date = new Date(time_now.toISOString());
    const d2: Date = new Date(notification.timestamp + 'Z');
    const timeDifference: number = d1.getTime() - d2.getTime();
    const seconds: number = (timeDifference) / 1000;

    if (seconds < 60) {
      notification.displayTime = 'Now';
    } else if (seconds >= 60 && seconds < 3600) {
      notification.displayTime = Math.floor(seconds / 60) + ' minute(s) ago';
    } else if (seconds >= 3600 && seconds < 86400) {
      notification.displayTime = Math.floor(seconds / 3600) + ' hour(s) ago';
    } else if (seconds >= 86400 && seconds < 604800) {
      notification.displayTime = Math.floor(seconds / 86400) + ' day(s) ago';
    } else if (seconds >= 604800) {
      notification.displayTime = Math.floor(seconds / 604800) + ' week(s) ago';
    } else {
      notification.displayTime = '??';
    }

    return notification;
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
        (response: NotificationInterface) => {
          this.new_notifications.push(response);
          this.add_notification_to_button_list_(new NotificationClass(response), true);
        });
  }

  /**
   * Used for making api rest call to get - {notification}
   *
   * @private
   * @param {*} [scroll_element=null]
   * @memberof NotificationsComponent
   */
  private api_get_notifications_(scroll_element: any = null): void {
    this.notification_service_.get_notifications(this.offset_, this.selected_notification_button.role)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: NotificationClass[]) => {
          if (ObjectUtilitiesClass.notUndefNull(scroll_element) &&
              ObjectUtilitiesClass.notUndefNull(scroll_element.scrollTop)){
            const old_scroll_top: number = scroll_element.scrollTop;
            scroll_element.scrollTop = scroll_element.scrollTop - 100;
            response.forEach((ni: NotificationClass) => this.add_notification_to_button_list_(ni));
            scroll_element.scrollTop = old_scroll_top;
            this.end_of_scroll_ = response.length === 0;
          } else {
            response.forEach((ni: NotificationClass) => this.add_notification_to_button_list_(ni));
          }
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting all notifications';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to delete - {notification}
   *
   * @private
   * @param {NotificationClass} notification
   * @memberof NotificationsComponent
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
   * Used for making api rest call to delete all - {notifications}
   *
   * @private
   * @memberof NotificationsComponent
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
