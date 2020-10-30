import { NgModule } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';

import {
  MockDIPTimeClass,
  MockKitFormClass,
  MockSystemNameDIPClass,
  MockSystemNameMIPClass,
} from '../../../static-data/class-objects-v3_4';
import { SnackbarWrapper } from '../classes/snackbar-wrapper';
import { ModalDialogMatComponent } from '../modal-dialog-mat/modal-dialog-mat.component';
import { DateTimeModule } from '../modules/date-time/date-time.module';
import { TestingModule } from '../modules/testing-modules/testing.module';
import { InjectorModule } from '../modules/utilily-modules/injector.module';
import { MaterialModule } from '../modules/utilily-modules/material.module';
import { NotificationsComponent } from '../notifications/component/notifications.component';
import { NotificationsModuleComponent } from '../notifications/notification-module/notifications-module.component';
import { CapitalizeFirstPipe } from '../pipes/capitalize-first.pipe';
import { ApiService } from '../services/abstract/api.service';
import { CookieService } from '../services/cookies.service';
import { ToolsService } from '../tools-form/services/tools.service';
import { getSideNavigationButtons } from './functions/navbar.functions';
import { NavGroupInterface } from './interfaces';
import { TopNavbarComponent } from './top-navbar.component';

export function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

@NgModule({
    imports: [
      MaterialModule,
      TestingModule,
      RouterModule,
      InjectorModule,
      BrowserAnimationsModule,
      RouterModule.forRoot([]),
      FormsModule,
      ReactiveFormsModule,
      DateTimeModule
    ],
    declarations: [
      TopNavbarComponent,
      NotificationsComponent,
      ModalDialogMatComponent,
      CapitalizeFirstPipe,
      NotificationsModuleComponent
    ],
    entryComponents: [
      ModalDialogMatComponent,
      NotificationsComponent,
      NotificationsModuleComponent
    ],
    providers: [
      CookieService,
      SnackbarWrapper,
      FormBuilder,
      ToolsService
    ]
})
export class MockTopNavBarModule { }

describe('TopNavbarComponent', () => {
  let component: TopNavbarComponent;
  let fixture: ComponentFixture<TopNavbarComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spySelectSystem: jasmine.Spy<any>;
  let spyOpenNotifications: jasmine.Spy<any>;
  let spyToggleSideNavigation: jasmine.Spy<any>;
  let spyGroupLabelCheck: jasmine.Spy<any>;
  let spyBuildNavBar: jasmine.Spy<any>;
  let spyStartClockCounter: jasmine.Spy<any>;
  let spySetClock: jasmine.Spy<any>;
  let spyGetCurrentDipTime: jasmine.Spy<any>;
  let spyGetVersion: jasmine.Spy<any>;
  let spySocketRefresh: jasmine.Spy<any>;

  // TODO - remove when toolServiceSpy created
  const htmlSpacesData: string[] = ['test'];

  const navGroupGood: NavGroupInterface = { id: '', label: 'test', system: [], children: [] };
  const navGroupBad: NavGroupInterface = { id: '', label: undefined, system: [], children: [] };
  const formGroup: FormGroup = new FormGroup({ 'dropdown': new FormControl(MockSystemNameMIPClass.system_name) });
  class MatDialogMock {
    // When the component calls this.dialog.open(...) we'll return an object
    // with an afterClosed method that allows to subscribe to the dialog result observable.
    open() {
      return {
        afterClosed: () => of(formGroup)
      };
    }
    closeAll() {
      return {
        afterClosed: () => of(formGroup)
      };
    }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MockTopNavBarModule
      ],
      providers: [
        ApiService,
        { provide: MatDialog, useClass: MatDialogMock }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopNavbarComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spySelectSystem = spyOn(component, 'selectSystem').and.callThrough();
    spyOpenNotifications = spyOn(component, 'openNotifications').and.callThrough();
    spyToggleSideNavigation = spyOn(component, 'toggleSideNavigation').and.callThrough();
    spyGroupLabelCheck = spyOn(component, 'groupLabelCheck').and.callThrough();
    spyBuildNavBar = spyOn(component, 'buildNavBar').and.callThrough();
    spyStartClockCounter = spyOn<any>(component, 'startClockCounter_').and.callThrough();
    spySetClock = spyOn<any>(component, 'setClock_').and.callThrough();
    spyGetCurrentDipTime = spyOn<any>(component, 'getCurrentDipTime_').and.callThrough();
    spyGetVersion = spyOn<any>(component, 'getVersion_').and.callThrough();
    spySocketRefresh = spyOn<any>(component, 'socketRefresh_').and.callThrough();

    // TODO - Remove once toolService_, kitService has proper spy service in place
    spyOn<any>(component['toolService_'], 'getSpaces').and.returnValue(of(htmlSpacesData));
    spyOn<any>(component['kitService_'], 'getKitForm').and.returnValue(of(MockKitFormClass));

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spySelectSystem.calls.reset();
    spyOpenNotifications.calls.reset();
    spyToggleSideNavigation.calls.reset();
    spyGroupLabelCheck.calls.reset();
    spyBuildNavBar.calls.reset();
    spyStartClockCounter.calls.reset();
    spySetClock.calls.reset();
    spyGetCurrentDipTime.calls.reset();
    spyGetVersion.calls.reset();
    spySocketRefresh.calls.reset();
  };

  afterAll(() => {
    component.ngOnDestroy();
    cleanStylesFromDOM();
  });

  it('should create TopNavbarComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('TopNavbarComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });
    });

    describe('selectSystem()', () => {
      it('should call selectSystem()', () => {
        reset();

        component.selectSystem(component.systemNames);

        expect(component.selectSystem).toHaveBeenCalled();
      });

      it('should call selectSystem() and set component.systemName', () => {
        reset();

        expect(component.systemName).toEqual(MockSystemNameDIPClass.system_name);

        component.selectSystem(component.systemNames);
        component['matDialog_'].closeAll();

        console.log(component.systemName);

        expect(component.systemName).toEqual(MockSystemNameMIPClass.system_name);
      });
    });

    describe('openNotifications()', () => {
      it('should call openNotifications()', () => {
        reset();

        component.openNotifications();

        expect(component.openNotifications).toHaveBeenCalled();
      });
    });

    describe('toggleSideNavigation()', () => {
      it('should call toggleSideNavigation()', () => {
        reset();

        component.toggleSideNavigation();

        expect(component.toggleSideNavigation).toHaveBeenCalled();
      });

      it('should call toggleSideNavigation() and set component.showLinkNames = !component.showLinkNames', () => {
        reset();

        const showLinkNames = component.showLinkNames;
        component.toggleSideNavigation();

        expect(component.showLinkNames).toEqual(!showLinkNames);
      });
    });

    describe('groupLabelCheck()', () => {
      it('should call groupLabelCheck()', () => {
        reset();

        component.groupLabelCheck(navGroupGood);

        expect(component.groupLabelCheck).toHaveBeenCalled();
      });

      it('should call groupLabelCheck() and return boolean true', () => {
        reset();

        const value = component.groupLabelCheck(navGroupGood);

        expect(value).toBeTrue();
      });

      it('should call groupLabelCheck() and return boolean false', () => {
        reset();

        const value = component.groupLabelCheck(navGroupBad);

        expect(value).toBeFalse();
      });
    });

    describe('buildNavBar()', () => {
      it('should call buildNavBar()', () => {
        reset();

        component.buildNavBar();

        expect(component.buildNavBar).toHaveBeenCalled();
      });

      it('should call buildNavBar() and set component.sideNavigationButtons, component.htmlSpaces, component.kitStatus', () => {
        reset();

        component.kitStatus = false;
        component.buildNavBar();

        expect(component.htmlSpaces).toEqual(htmlSpacesData);
        expect(component.kitStatus).toEqual(MockKitFormClass.complete);
        expect(component.sideNavigationButtons).toEqual(getSideNavigationButtons(component.systemName, component['userService_'],
                                                                                 component.kitStatus, component.htmlSpaces));
      });
    });

    describe('private startClockCounter_()', () => {
      it('should call startClockCounter_()', () => {
        reset();

        component['startClockCounter_']();

        expect(component['startClockCounter_']).toHaveBeenCalled();
      });

      it('should call startClockCounter_() and set component.time plus 1000ms', fakeAsync(() => {
        reset();

        const setTime = new Date();
        component.time = setTime;
        component['startClockCounter_']();

        tick(1000);

        expect(component.time.getTime()).toBeLessThanOrEqual(setTime.getTime() + 1000);

        component.ngOnDestroy();
        component['clockCounter$_'] = undefined;

        tick(1000);
      }));
    });

    describe('private setClock_()', () => {
      it('should call setClock_()', () => {
        reset();

        component['setClock_'](MockDIPTimeClass);

        expect(component['setClock_']).toHaveBeenCalled();
      });

      it('should call setClock_() and set component.timezone, component.time', () => {
        reset();

        const datetime = MockDIPTimeClass.datetime;
        const dateParts = datetime.split(' ')[0].split("-");
        const timeParts = datetime.split(' ')[1].split(":");
        const time = new Date(
          parseInt(dateParts[2], 10),     // Year
          parseInt(dateParts[0], 10) - 1, // Month
          parseInt(dateParts[1], 10),     // Day
          parseInt(timeParts[0], 10),     // hours
          parseInt(timeParts[1], 10),     // minutes
          parseInt(timeParts[2], 10)      // seconds
        );
        component['setClock_'](MockDIPTimeClass);

        expect(component.time).toEqual(time);
      });
    });

    describe('private getCurrentDipTime_()', () => {
      it('should call getCurrentDipTime_()', () => {
        reset();

        component['getCurrentDipTime_']();

        expect(component['getCurrentDipTime_']).toHaveBeenCalled();
      });
    });

    describe('private getVersion_()', () => {
      it('should call getVersion_()', () => {
        reset();

        component['getVersion_']();

        expect(component['getVersion_']).toHaveBeenCalled();
      });
    });

    // TODO - Update when websocket has been flushed out
    describe('private socketRefresh_()', () => {
      it('should call socketRefresh_()', () => {
        reset();

        component['socketRefresh_']();

        expect(component['socketRefresh_']).toHaveBeenCalled();
      });
    });
  });
});
