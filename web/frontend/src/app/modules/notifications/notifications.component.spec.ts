import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { MockNotificationClass_ZeekPendingInstall } from '../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { TestingModule } from '../testing-modules/testing.module';
import { NotificationButtonInterface } from './interface/notification-button.interface';
import { NotificationsComponent } from './notifications.component';
import { NotificationsModule } from './notifications.module';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyOpenNotificationDialogWindow: jasmine.Spy<any>;
  let spySetupWebsocketOnbroadcast: jasmine.Spy<any>;
  let spyApiGetNotifications: jasmine.Spy<any>;

  // Test Data
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NotificationsModule,
        TestingModule
      ],
      providers: [
        { provide: MatDialog, useFactory: () => jasmine.createSpyObj('MatDialog', ['open', 'closeAll']) },
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyOpenNotificationDialogWindow = spyOn(component, 'open_notification_dialog_window').and.callThrough();
    spySetupWebsocketOnbroadcast = spyOn<any>(component, 'setup_websocket_onbroadcast_').and.callThrough();
    spyApiGetNotifications = spyOn<any>(component, 'api_get_notifications_').and.callThrough();

    // Websocket spy TODO - remove once proper implementation
    spyOn<any>(component['websocket_service_'], 'onBroadcast').and.returnValue(of(MockNotificationClass_ZeekPendingInstall));

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    component.notification_button_list.forEach((nb: NotificationButtonInterface) => {
      nb.notifications = [];
    });
    spyNGOnInit.calls.reset();
    spyOpenNotificationDialogWindow.calls.reset();
    spySetupWebsocketOnbroadcast.calls.reset();
    spyApiGetNotifications.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create NotificationsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('NotificationsComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call api_get_notifications_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_notifications_']).toHaveBeenCalled();
      });

      it('should call setup_websocket_onbroadcast_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['setup_websocket_onbroadcast_']).toHaveBeenCalled();
      });
    });

    describe('open_notification_dialog_window()', () => {
      it('should call open_notification_dialog_window()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.open_notification_dialog_window();

        expect(component.open_notification_dialog_window).toHaveBeenCalled();
      });

      it('should call api_get_notifications_() after mat dialog ref closed from within open_notification_dialog_window()', () => {
        reset();

        // Add spy to return value from mat_dialog
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.open_notification_dialog_window();

        expect(component['api_get_notifications_']).toHaveBeenCalled();
      });
    });

    describe('private setup_websocket_onbroadcast_()', () => {
      it('should call setup_websocket_onbroadcast_()', () => {
        reset();

        component['setup_websocket_onbroadcast_']();

        expect(component['setup_websocket_onbroadcast_']).toHaveBeenCalled();
      });

      it('should call websocket_service_.onBroadcast() from setup_websocket_onbroadcast_()', () => {
        reset();

        component['setup_websocket_onbroadcast_']();

        expect(component['websocket_service_'].onBroadcast).toHaveBeenCalled();
      });

      it('should call websocket_service_.onBroadcast() and push notification to new_notifications', () => {
        reset();

        component.new_notifications = [];
        component['setup_websocket_onbroadcast_']();

        expect(component.new_notifications.length).toEqual(1);
      });
    });

    describe('private api_get_notifications_()', () => {
      it('should call api_get_notifications_()', () => {
        reset();

        component['api_get_notifications_']();

        expect(component['api_get_notifications_']).toHaveBeenCalled();
      });

      it('should call notification_service_.get_notifications() from api_get_notifications_()', () => {
        reset();

        component['api_get_notifications_']();

        expect(component['notification_service_'].get_notifications).toHaveBeenCalled();
      });

      it('should call notification_service_.get_notifications() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['notification_service_'], 'get_notifications').and.returnValue(throwError(mock_http_error_response));

        component['api_get_notifications_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});
