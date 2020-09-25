import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, interval } from 'rxjs';

import { SystemNameClass } from '../classes';
import {
  DialogControlTypes,
  DialogFormControl,
  DialogFormControlConfigClass
} from '../modal-dialog-mat/modal-dialog-mat-form-types';
import { ModalDialogMatComponent } from '../modal-dialog-mat/modal-dialog-mat.component';
import { NotificationsComponent } from '../notifications/component/notifications.component';
import { CookieService } from '../services/cookies.service';
import { WeaponSystemNameService } from '../services/weapon-system-name.service';
import { WebsocketService } from '../services/websocket.service';
import { KitService } from '../system-setup/services/kit.service';
import { ToolsService } from '../tools-form/tools.service';
import { UserService } from '../user.service';
import { NavBarService } from './navbar.service';
import { getSideNavigationButtons, NavGroup } from './navigation';

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
  public html_spaces: Array<any> = [];
  public kitStatus: boolean = false;

  @Output() themeChanged: EventEmitter<any> = new EventEmitter();

  emitTheme() {
    const systemName: SystemNameClass = new SystemNameClass();
    systemName.system_name = this.system_name;

    this.themeChanged.emit(systemName);
  }

  @ViewChild('notifications', { static: false }) notifications: NotificationsComponent;

  constructor(private cookieService: CookieService,
              private navService: NavBarService,
              private socketSrv: WebsocketService,
              private sysNameSrv: WeaponSystemNameService,
              private ref: ChangeDetectorRef,
              private dialog: MatDialog,
              private userService: UserService,
              private toolSrv: ToolsService,
              private kitSrv: KitService) {
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  ngOnInit() {
    this.system_name = this.sysNameSrv.getSystemName();
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
    this.buildNavBar();
    this.emitTheme();
    this.ref.detectChanges();
  }

  public buildNavBar() {
    this.sideNavigationButtons = getSideNavigationButtons(this.system_name, this.userService, false, []);
    forkJoin({
        html_spaces: this.toolSrv.getspaces(),
        kitData: this.kitSrv.getKitForm()
      }).subscribe(data => {
        this.html_spaces = data['html_spaces'] as Array<any>;
        if(data['kitData'] != undefined && data['kitData']["complete"] != undefined) {
          this.kitStatus = data['kitData']["complete"] as boolean;
        }
        this.sideNavigationButtons = getSideNavigationButtons(this.system_name, this.userService, this.kitStatus, this.html_spaces);
    });
  }

  selectSystem() {
    const controlFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    controlFormControlConfig.label = 'Pick your system';
    controlFormControlConfig.formState = null;
    controlFormControlConfig.validatorOrOpts = Validators.required;
    const control = new DialogFormControl(controlFormControlConfig);
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
      this.system_name = response.controls['dropdown'].value;
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

    this.socketSrv.onBroadcast().subscribe((message: any) => {
      if(message["role"] === "kit" && message["status"] === "COMPLETED") {
        this.kitStatus = true;
        this.sideNavigationButtons = getSideNavigationButtons(this.system_name,this.userService, this.kitStatus, this.html_spaces);
      } else if(message["role"] === "kit" && message["status"] === "IN_PROGRESS") {
        this.kitStatus = false;
        this.sideNavigationButtons = getSideNavigationButtons(this.system_name,this.userService, this.kitStatus, this.html_spaces);
      }
    });
  }
}
