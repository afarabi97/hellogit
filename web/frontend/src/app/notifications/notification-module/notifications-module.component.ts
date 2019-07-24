import { Component, Inject } from '@angular/core';
import { WebsocketService } from '../../websocket.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationService } from '../services/notification.service';
import { ConfirmDailogComponent } from '../../confirm-dailog/confirm-dailog.component';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-notifications-module',
  templateUrl: './notifications-module.component.html',
  styleUrls: ['./notifications-module.component.scss']
})
export class NotificationsModuleComponent {
  public selectedButton: any = {"name": "All", "selected": true, "title": "All Messages","role": "all"};
  public notification:any = [];

  /**
   *Creates an instance of NotificationsModuleComponent.
   * @param {WebsocketService} _WebsocketService
   * @param {MatDialogRef<NotificationsModuleComponent>} dialogRef
   * @param {NotificationService} _NotificationService
   * @param {MatDialog} dialog
   * @param {MatSnackBar} snackBar
   * @param {*} buttonList
   * @memberof NotificationsModuleComponent
   */
  constructor(public _WebsocketService:WebsocketService,
              public dialogRef: MatDialogRef<NotificationsModuleComponent>,
              public _NotificationService: NotificationService,
              public dialog: MatDialog,
              private snackBar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public buttonList: any,) {

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
    return button.name === this.selectedButton.name ? 'warn' : 'accent';
  }

  /**
   * clears all the notifcations when called
   *
   * @memberof NotificationsModuleComponent
   */
  clearAll() {
    let message = "Are you sure you want to delete all notificaions?";
    let title = "Clear All Notifications";
    let option1 = "Close";
    let option2 = "Delete";

    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: '35%',
      data: {"paneString": message, "paneTitle": title, "option1": option1, "option2": option2},
    });

    dialogRef.afterClosed().subscribe(result => {

      if( result === option2) {
        this._NotificationService.deleteAll().subscribe((message:any) => {
            this.snackBar.open("All Notifications Deleted", 'OK', {
              duration: 5000,
            });
        });
        this._NotificationService.buttonList.map( buttons => {
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
    this._NotificationService.delete(id).subscribe((message:any) => {
    });
    this._NotificationService.buttonList = this._NotificationService.buttonList.map( buttons => {
      buttons.notifications = buttons.notifications.filter(notification => {
        if(notification._id !== id) {
          return notification;
        }
      });
      return buttons;
    });
  }

}
