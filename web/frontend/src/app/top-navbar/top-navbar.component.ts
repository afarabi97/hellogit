import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { forkJoin, interval, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ObjectUtilitiesClass, KitStatusClass } from '../classes';
import { returnDate } from '../functions/cvah.functions';
import { NotificationsComponent } from '../modules/notifications/notifications.component';
import { CookieService } from '../services/cookies.service';
import { UserService } from '../services/user.service';
import { ToolsService } from '../modules/tools/services/tools.service';
import { DIPTimeClass } from './classes/dip-time.class';
import { getSideNavigationButtons } from './functions/navbar.functions';
import { NavGroupInterface } from './interfaces';
import { NavBarService } from './services/navbar.service';
import { KitSettingsService } from '../system-setupv2/services/kit-settings.service';
import { WebsocketService } from '../services/websocket.service';
import { MatSnackBarService } from '../services/mat-snackbar.service';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../constants/cvah.constants';

/**
 * Component used for top navbar related functionality
 *
 * @export
 * @class TopNavbarComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.scss'],
  host: {
    'class': 'app-top-navbar'
  }
})
export class TopNavbarComponent implements OnInit, OnDestroy {
  @ViewChild('notifications') notifications: NotificationsComponent;
  showLinkNames: boolean;
  time: Date;
  timezone: string;
  sideNavigationButtons: NavGroupInterface[];
  controllerMaintainer: boolean;
  kitStatus: boolean;
  htmlSpaces: string[] = [];
  private clockCounter$_: Observable<number>;
  private ngUnsubscribe$_: Subject<void> = new Subject<void>();
  private ngUnsubscribeCounterInterval$_: Subject<void> = new Subject<void>();

  /**
   * Creates an instance of TopNavbarComponent.
   *
   * @param {CookieService} cookieService_
   * @param {ToolsService} toolService_
   * @param {NavBarService} navBarService_
   * @param {UserService} userService_
   * @param {KitService} kitService_
   * @param {ChangeDetectorRef} changeDetectorRef_
   * @memberof TopNavbarComponent
   */
  constructor(private cookieService_: CookieService,
              private toolService_: ToolsService,
              private navBarService_: NavBarService,
              private userService_: UserService,
              private changeDetectorRef_: ChangeDetectorRef,
              private kitSettingsSrv: KitSettingsService,
              private _WebsocketService: WebsocketService,
              private mat_snackbar_service_: MatSnackBarService) {
    this.showLinkNames = true;
    this.kitStatus = false;
    this.controllerMaintainer = this.userService_.isControllerMaintainer();
    this.showLinkNames = this.cookieService_.get('isOpen') === 'true';
  }

  /**
   * Used for calling subscription methods
   *
   * @memberof TopNavbarComponent
   */
  ngOnInit(): void {
    this.buildNavBar();
    this.getCurrentDipTime_();

    this._WebsocketService.getSocket().on('disk-pressure', (message) => {
      this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
    });
  }

  /**
   * Used for handeling unsubscribes
   *
   * @memberof TopNavbarComponent
   */
  ngOnDestroy(): void {
    this.ngUnsubscribe$_.next();
    this.ngUnsubscribe$_.complete();
    this.ngUnsubscribeCounterInterval$_.next();
    this.ngUnsubscribeCounterInterval$_.complete();
  }

  /**
   * Used for opeing the notifications window
   *
   * @memberof TopNavbarComponent
   */
  openNotifications(): void {
    this.notifications.open_notification_dialog_window();
  }


  /**
   * Used for toggling the sidenav open and close
   *
   * @memberof TopNavbarComponent
   */
  toggleSideNavigation(): void {
    this.showLinkNames = !this.showLinkNames;
    this.cookieService_.set('isOpen', this.showLinkNames.toString());
  }
  /**
   * Check to see if navGroup label is defined and that it is not equal empty string
   *
   * @param {NavGroupInterface} navGroup
   * @returns {boolean}
   * @memberof TopNavbarComponent
   */
  groupLabelCheck(navGroup: NavGroupInterface): boolean {
    return ObjectUtilitiesClass.notUndefNull(navGroup.label) && navGroup.label !== '';
  }

  /**
   * Used for setting the navigation bar
   *
   * @memberof TopNavbarComponent
   */
  buildNavBar(): void {
    this.sideNavigationButtons = getSideNavigationButtons(this.userService_, false, []);
    this.changeDetectorRef_.detectChanges();
    forkJoin({ htmlSpaces: this.toolService_.getSpaces(), kitData: this.kitSettingsSrv.getKitStatus() })
      .pipe(takeUntil(this.ngUnsubscribe$_))
      .subscribe((data: { htmlSpaces: string[]; kitData: KitStatusClass}) => {
        this.htmlSpaces = data.htmlSpaces;
        /* istanbul ignore else */
        if (ObjectUtilitiesClass.notUndefNull(data.kitData) &&
            ObjectUtilitiesClass.notUndefNull(data.kitData.base_kit_deployed)) {
          this.kitStatus = data.kitData.base_kit_deployed;
        }
        //TODO fix the nav bar with new kit status
        this.sideNavigationButtons = getSideNavigationButtons(this.userService_, this.kitStatus, this.htmlSpaces);
        this.changeDetectorRef_.detectChanges();
      });
  }

  /**
   * Used for setting a counter to keep time relative to current dip time
   *
   * @private
   * @memberof TopNavbarComponent
   */
  private startClockCounter_(): void {
    this.ngUnsubscribeCounterInterval$_.next();
    this.clockCounter$_ = undefined;
    this.clockCounter$_ = interval(1000);
    this.clockCounter$_
      .pipe(takeUntil(this.ngUnsubscribeCounterInterval$_))
      .subscribe(
        (_n: number) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(this.time)) {
            this.time = new Date(this.time.getTime() + 1000);
          }
        });
  }


  /**
   * Used for setting the clock time
   *
   * @private
   * @param {DIPTimeClass} data
   * @memberof TopNavbarComponent
   */
  private setClock_(data: DIPTimeClass): void {
    this.timezone = data.timezone;
    const datetime = data.datetime;
    const dateParts = datetime.split(' ')[0].split("-");
    const timeParts = datetime.split(' ')[1].split(":");

    this.time = returnDate( parseInt(dateParts[2], 10), parseInt(dateParts[0], 10) - 1, parseInt(dateParts[1], 10),
                            parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), parseInt(timeParts[2], 10) );
  }

  /**
   * Used for calling service to get the current dip time
   *
   * @private
   * @memberof TopNavbarComponent
   */
  private getCurrentDipTime_(): void {
    this.navBarService_.getCurrentDIPTime()
      .pipe(takeUntil(this.ngUnsubscribe$_))
      .subscribe((data: DIPTimeClass) => {
        this.setClock_(data);
        this.startClockCounter_();
      });
  }
}
