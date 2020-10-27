import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ConfirmDailogComponent } from '../../confirm-dailog/confirm-dailog.component';
import { UserService } from '../../services/user.service';
import { WebsocketService } from '../../services/websocket.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notifications-module',
  templateUrl: './notifications-module.component.html',
  styleUrls: ['./notifications-module.component.scss'],
  host: {
    'class': 'app-notifications-module'
  }
})
export class NotificationsModuleComponent {
  public selectedButton: any = {"name": "All", "selected": true, "title": "All Messages","role": "all"};
  public notification:any = [];
  public controllerMaintainer: boolean;

  /**
   *Creates an instance of NotificationsModuleComponent.
   * @param {WebsocketService} _websocketService
   * @param {MatDialogRef<NotificationsModuleComponent>} dialogRef
   * @param {NotificationService} _notificationService
   * @param {MatDialog} dialog
   * @param {MatSnackBar} snackBar
   * @param {*} buttonList
   * @memberof NotificationsModuleComponent
   */
  constructor(public _websocketService: WebsocketService,
              public dialogRef: MatDialogRef<NotificationsModuleComponent>,
              public _notificationService: NotificationService,
              public dialog: MatDialog,
              private snackBar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public buttonList: any,
              private userService: UserService,) {
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  /**
   * changes the list of the notifications when this fuction is called
   *
   * @param {*} button
   * @memberof NotificationsModuleComponent
   */
  buttonPress(button: any) {
    this.buttonList.map( data => {
      if (data === button) {
        this.selectedButton = data;
        data.selected = !data.selected;
      }
    });
  }

  /**
   * changes the color of the button
   *
   * @param {*} button
   * @returns
   * @memberof NotificationsModuleComponent
   */
  getSelectedButton(button) {
    return button.name === this.selectedButton.name ? 'accent': 'primary';
  }

  /**
   * clears all the notifcations when called
   *
   * @memberof NotificationsModuleComponent
   */
  clearAll() {
    const message = "Are you sure you want to delete all notificaions?";
    const title = "Clear All Notifications";
    const option1 = "Close";
    const option2 = "Delete";

    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: '35%',
      data: {"paneString": message, "paneTitle": title, "option1": option1, "option2": option2},
    });

    dialogRef.afterClosed().subscribe(result => {

      if( result === option2) {
        this._notificationService.deleteAll().subscribe((m: any) => {
          this.snackBar.open("All Notifications Deleted", 'OK', { duration: 5000 });
        });
        this._notificationService.buttonList.map( buttons => {
          buttons.notifications = [];
        });
      }
    });
  }


  /**
   * clears a single notification
   *
   * @param {string} id
   * @memberof NotificationsModuleComponent
   */
  clearNotification(id: string) {
    this._notificationService.delete(id).subscribe((message:any) => {
    });
    this._notificationService.buttonList = this._notificationService.buttonList.map( buttons => {
      buttons.notifications = buttons.notifications.filter(notification => {
        if(notification._id !== id) {
          return notification;
        }
      });
      return buttons;
    });
  }

}
