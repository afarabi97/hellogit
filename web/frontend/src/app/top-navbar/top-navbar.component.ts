import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { NotificationsComponent } from '../notifications/component/notifications.component';
import { CookieService } from '../services/cookies.service';
import { NavBarService } from './navbar.service';
import { interval } from "rxjs";
import { WebsocketService } from '../services/websocket.service';
import { WeaponSystemNameService } from '../services/weapon-system-name.service';
import { getSideNavigationButtons, NavGroup, NavLink } from './navigation';
import { ModalDialogMatComponent } from '../modal-dialog-mat/modal-dialog-mat.component';
import { DialogControlTypes, DialogFormControl } from '../modal-dialog-mat/modal-dialog-mat-form-types';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../user.service';

@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.scss'],
  host: {
    'class': 'app-top-navbar'
  }
})
export class TopNavbarComponent implements OnInit {
  public showLinkNames = true;
  public time: Date;
  public timezone: string;
  public version: string;
  public system_name: string;
  public sideNavigationButtons: Array<NavGroup>;
  public controllerMaintainer: boolean;

  @Output() themeChanged: EventEmitter<any> = new EventEmitter();

  emitTheme() {
    this.themeChanged.emit({ 'system_name': this.system_name });
  }

  @ViewChild('notifications', { static: false }) notifications: NotificationsComponent;

  constructor(private cookieService: CookieService,
              private navService: NavBarService,
              private socketSrv: WebsocketService,
              private sysNameSrv: WeaponSystemNameService,
              private ref: ChangeDetectorRef,
              private dialog: MatDialog,
              private userService: UserService) {
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  ngOnInit() {
    this.setSystemTheme();

    this.showLinkNames = this.cookieService.get('isOpen') === 'true' ? true : false;
    const clockCounter = interval(1000);

    this.navService.getCurrentDIPTime().subscribe(data => {
      this.setClock(data);
      clockCounter.subscribe(n => {
        this.time = new Date(this.time.getTime() + 1000);
      });
    });

    this.navService.getVersion().subscribe(versionObj => {
      this.version = versionObj.version;
    });

    this.socketRefresh();
  }

  private setSystemTheme() {
    this.system_name = this.sysNameSrv.getSystemName();
    this.sideNavigationButtons = getSideNavigationButtons(this.system_name,this.userService);
    this.emitTheme();
    this.ref.detectChanges();
  }

  selectSystem() {
    let control = new DialogFormControl('Pick your system', null, Validators.required);
    control.options = ['DIP', 'MIP', 'GIP'];

    control.controlType = DialogControlTypes.dropdown;

    let group = new FormGroup({ 'dropdown': control });

    const dialogRef = this.dialog.open(ModalDialogMatComponent, {
      width: '400px',
      maxHeight: '400px',
      data: {
        title: "Select the system type.",
        instructions: "",
        dialogForm: group,
        confirmBtnText: "OK"
      }
    });

    dialogRef.afterClosed().subscribe(response => {
      let system_name = response.controls['dropdown'].value;
      //Changes the system name once the dropdown is selected.
      document.getElementById("sysname").innerHTML = system_name;
    });
  }

  private setClock(data: Object) {
    this.timezone = data["timezone"];
    let datetime = data["datetime"];
    let dateParts = datetime.split(' ')[0].split("-");
    let timeParts = datetime.split(' ')[1].split(":");

    this.time = new Date(
      dateParts[2], //Year
      dateParts[0] - 1, //Month
      dateParts[1], //Day
      timeParts[0], // hours
      timeParts[1], // minutes
      timeParts[2] // seconds
    );
  }

  private restartClock() {
    this.navService.getCurrentDIPTime().subscribe(data => {
      this.setClock(data);
    });
  }

  openNotifications() {
    this.notifications.openNotification();
  }

  toggleSideNavigation() {
    this.showLinkNames = !this.showLinkNames;
    this.cookieService.set('isOpen', this.showLinkNames.toString());
  }

  private socketRefresh() {
    this.socketSrv.getSocket().on('clockchange', (data: any) => {
      this.restartClock();
    });
  }
}
