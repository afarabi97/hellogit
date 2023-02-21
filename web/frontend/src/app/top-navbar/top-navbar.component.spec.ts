import { NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { of as observableOf } from 'rxjs';

import { MockDIPTimeClass, MockKitStatusClass } from '../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../static-data/functions/clean-dom.function';
import { DateTimeModule } from '../modules/date-time/date-time.module';
import {
  ModalDialogMatComponent
} from '../modules/global-components/components/modal-dialog-mat/modal-dialog-mat.component';
import { NotificationsComponent } from '../modules/notifications/notifications.component';
import { TestingModule } from '../modules/testing-modules/testing.module';
import { ToolsService } from '../modules/tools/services/tools.service';
import { InjectorModule } from '../modules/utilily-modules/injector.module';
import { MaterialModule } from '../modules/utilily-modules/material.module';
import { CapitalizeFirstPipe } from '../pipes/capitalize-first.pipe';
import { ApiService } from '../services/abstract/api.service';
import { CookieService } from '../services/cookies.service';
import { WebsocketService } from '../services/websocket.service';
import { getSideNavigationButtons } from './functions/navbar.functions';
import { NavGroupInterface } from './interfaces';
import { TopNavbarComponent } from './top-navbar.component';

const MockWebsocketBroadcast = {
  role: 'kit',
  status: 'COMPLETED'
};

class MockSocket {
  getSocket() {
    return {'on': () => {}};
  }
  onBroadcast() {
    return observableOf(MockWebsocketBroadcast);
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
      CapitalizeFirstPipe
    ],
    entryComponents: [
      ModalDialogMatComponent,
      NotificationsComponent
    ],
    providers: [
      CookieService,
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
  let spyOpenNotifications: jasmine.Spy<any>;
  let spyToggleSideNavigation: jasmine.Spy<any>;
  let spyGroupLabelCheck: jasmine.Spy<any>;
  let spyBuildNavBar: jasmine.Spy<any>;
  let spyStartClockCounter: jasmine.Spy<any>;
  let spySetClock: jasmine.Spy<any>;
  let spyGetCurrentDipTime: jasmine.Spy<any>;

  // TODO - remove when toolServiceSpy created
  const htmlSpacesData: string[] = ['testdocs'];

  const navGroupGood: NavGroupInterface = { id: '', label: 'testdocs', children: [] };
  const navGroupBad: NavGroupInterface = { id: '', label: undefined, children: [] };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MockTopNavBarModule
      ],
      providers: [
        ApiService,
        { provide: WebsocketService, useClass: MockSocket }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopNavbarComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyOpenNotifications = spyOn(component, 'openNotifications').and.callThrough();
    spyToggleSideNavigation = spyOn(component, 'toggleSideNavigation').and.callThrough();
    spyGroupLabelCheck = spyOn(component, 'groupLabelCheck').and.callThrough();
    spyBuildNavBar = spyOn(component, 'buildNavBar').and.callThrough();
    spyStartClockCounter = spyOn<any>(component, 'startClockCounter_').and.callThrough();
    spySetClock = spyOn<any>(component, 'setClock_').and.callThrough();
    spyGetCurrentDipTime = spyOn<any>(component, 'getCurrentDipTime_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyOpenNotifications.calls.reset();
    spyToggleSideNavigation.calls.reset();
    spyGroupLabelCheck.calls.reset();
    spyBuildNavBar.calls.reset();
    spyStartClockCounter.calls.reset();
    spySetClock.calls.reset();
    spyGetCurrentDipTime.calls.reset();
  };

  afterAll(() => {
    component.ngOnDestroy();
    remove_styles_from_dom();
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
        expect(component.kitStatus).toEqual(MockKitStatusClass.base_kit_deployed);
        expect(component.sideNavigationButtons).toEqual(getSideNavigationButtons(component['userService_'],
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
  });
});
