import { Component, OnInit } from '@angular/core';
import { Notification } from '../interface/notifications.interface';
import { WebsocketService } from '../../services/websocket.service';
import { NotificationsModuleComponent } from './../notification-module/notifications-module.component';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../services/notification.service';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  public newNotifications: any[] = [];
  public allNotification: any[] = [];
  private timeNow: Date = new Date();
  public messages: any[] = [];
  public messageContent: string;
  public ioConnection: any;
  public dialogRef: any;

  /**
   * Creates an instance of NotificationsComponent.
   * @param {WebsocketService} _WebsocketService
   * @param {MatDialog} dialog
   * @param {NotificationService} _NotificationService
   * @memberof NotificationsComponent
   */
  constructor(public _WebsocketService:WebsocketService,
              public dialog: MatDialog,
              public _NotificationService: NotificationService) {}

  /**
   * Gets notications from the database and listens on the websocket for new notications
   *
   * @memberof NotificationsComponent
   */
  ngOnInit() {
    this._NotificationService.get().subscribe((messages:any) => {
      messages.map(message => {
        this.makeArray(message);
      });
    });
    this.ioConnection = this._WebsocketService.onBroadcast()
    .subscribe((message: Notification) => {
      this.newNotifications.push(message);
      this.makeArray(message);
    });
  }

  /**
   * makes the array before it is passed to the notification dailog pane
   *
   * @param {*} message
   * @memberof NotificationsComponent
   */
  makeArray(message: any) {
    this.allNotification.push(message);
    this._NotificationService.buttonList.map(role => {
      if( (role.role === message.role) || role.role === 'all') {
        role.notifications.unshift(message);
      }
    });
  }

  /**
   * opens the notification dailog pane
   *
   * @memberof NotificationsComponent
   */
  openNotification(): void {
    this._NotificationService.buttonList.map( message => {
      message.notifications.map(notification => {
      this.setTime(notification);
      });
    });

    if (!this.dialogRef) {
      this.dialogRef = this.dialog.open(NotificationsModuleComponent, {
        width: '50vw',
        height: '732px',
        data: this._NotificationService.buttonList,
      });
      this.newNotifications = [];
      this.dialogRef.afterClosed().subscribe(result => {
        this.dialogRef = undefined;
      });
    }
}

  /**
   * Creates a display time that is used to show how old the notification is
   *
   * @param {*} message
   * @returns {Notification}
   * @memberof NotificationsComponent
   */
  setTime(message): Notification {
    let date = new Date();
    this.timeNow = new Date(date.toUTCString())

    let d1 = new Date(this.timeNow.toISOString());
    let d2 = new Date(message.timestamp + "Z");

    let timeDifference = d1.getTime() - d2.getTime();
    let seconds = (timeDifference) / 1000;

    if (seconds < 60 && seconds >=0 ) {
      message.displayTime = 'Now';
    } else if (seconds >= 60 && seconds < 3600) {
      message.displayTime = Math.floor(seconds / 60) + ' m';
    } else if (seconds >= 3600 && seconds < 86400) {
      message.displayTime = Math.floor(seconds / 3600) + ' h';
    } else if (seconds >= 86400 && seconds < 604800) {
      message.displayTime = Math.floor(seconds / 86400) + ' day(s)';
    } else if (seconds >= 604800) {
      message.displayTime = Math.floor(seconds / 604800) + ' week(s)';
    } else {
      message.displayTime = '';
    }
    return message;
  }
}
