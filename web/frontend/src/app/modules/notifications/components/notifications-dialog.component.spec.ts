import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import {
  MockNotificationClass_NotInArray,
  MockNotificationClass_ZeekPendingInstall,
  MockNotificationClassArray
} from '../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../static-data/functions/clean-dom.function';
import { NotificationClass } from '../../../classes';
import { ACCENT_BUTTON_COLOR, PRIMARY_BUTTON_COLOR } from '../../../constants/cvah.constants';
import { TestingModule } from '../../testing-modules/testing.module';
import {
  DELETE_ALL_NOTIFICATIONS_CONFIRM_DIALOG,
  NOTIFICATION_BUTTON_LIST,
  NOTIFICATION_DIALOG_TITLE,
  NUMBER_OF_NOTIFICATION_ITEMS
} from '../constants/notifications.constant';
import { NotificationButtonInterface } from '../interface/notification-button.interface';
import { NotificationsDialogComponent } from './notifications-dialog.component';
import { NotificationsModule } from '../notifications.module';
import { NotificationDialogDataInterface } from '../interface/notification-dialog-data.interface';

describe('NotificationsDialogComponent', () => {
  let component: NotificationsDialogComponent;
  let fixture: ComponentFixture<NotificationsDialogComponent>;

  // Setup spy references
  let spyHostListenerOnScroll: jasmine.Spy<any>;
  let spyNGOnInit: jasmine.Spy<any>;
  let spyCheckTitleDefined: jasmine.Spy<any>;
  let spyButtonSelect: jasmine.Spy<any>;
  let spyGetSelectedButtonColor: jasmine.Spy<any>;
  let spyDeleteNotification: jasmine.Spy<any>;
  let spyOpenDeleteAllNotificationDialogWindow: jasmine.Spy<any>;
  let spySetupWebsocketOnbroadcast: jasmine.Spy<any>;
  let spyApiGetNotifications: jasmine.Spy<any>;
  let spyApiDeleteNotification: jasmine.Spy<any>;
  let spyApiDeleteAllNotifications: jasmine.Spy<any>;

  // Test Data
  const notification_dialog_data: NotificationDialogDataInterface = {
    title: NOTIFICATION_DIALOG_TITLE,
    button_list: NOTIFICATION_BUTTON_LIST.map((nb: NotificationButtonInterface) => nb)
  };
  const mock_title: string = 'Test Title';
  const scroll_element: any = {
    scrollTop: 0
  };
  const mock_scroll_event: any = {
    target: {
      offsetHeight: 100,
      scrollTop: 200,
      scrollHeight: 250
    }
  };
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
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) },
        { provide: MAT_DIALOG_DATA, useValue: notification_dialog_data }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsDialogComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyHostListenerOnScroll = spyOn(component, 'host_listener_on_scroll').and.callThrough();
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyCheckTitleDefined = spyOn(component, 'check_title_defined').and.callThrough();
    spyButtonSelect = spyOn(component, 'button_select').and.callThrough();
    spyGetSelectedButtonColor = spyOn(component, 'get_selected_button_color').and.callThrough();
    spyDeleteNotification = spyOn(component, 'delete_notification').and.callThrough();
    spyOpenDeleteAllNotificationDialogWindow = spyOn(component, 'open_delete_all_notification_dialog_window').and.callThrough();
    spySetupWebsocketOnbroadcast = spyOn<any>(component, 'setup_websocket_onbroadcast_').and.callThrough();
    spyApiGetNotifications = spyOn<any>(component, 'api_get_notifications_').and.callThrough();
    spyApiDeleteNotification = spyOn<any>(component, 'api_delete_notification_').and.callThrough();
    spyApiDeleteAllNotifications = spyOn<any>(component, 'api_delete_all_notifications_').and.callThrough();

    // Websocket spy TODO - remove once proper implementation
    spyOn<any>(component['websocket_service_'], 'onBroadcast').and.returnValue(of(MockNotificationClass_ZeekPendingInstall));

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    component.notification_button_list.forEach((nb: NotificationButtonInterface) => {
      nb.notifications = [];
    });
    spyHostListenerOnScroll.calls.reset();
    spyNGOnInit.calls.reset();
    spyCheckTitleDefined.calls.reset();
    spyButtonSelect.calls.reset();
    spyGetSelectedButtonColor.calls.reset();
    spyDeleteNotification.calls.reset();
    spyOpenDeleteAllNotificationDialogWindow.calls.reset();
    spySetupWebsocketOnbroadcast.calls.reset();
    spyApiGetNotifications.calls.reset();
    spyApiDeleteNotification.calls.reset();
    spyApiDeleteAllNotifications.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create NotificationsDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('NotificationsDialogComponent methods', () => {
    describe('host_listener_on_scroll()', () => {
      it('should call host_listener_on_scroll()', () => {
        reset();

        component.host_listener_on_scroll(mock_scroll_event);

        expect(component.host_listener_on_scroll).toHaveBeenCalled();
      });

      it('should call host_listener_on_scroll() and set button_select_gate_active = false', () => {
        reset();

        component['button_select_gate_active_'] = true;
        component.host_listener_on_scroll(mock_scroll_event);

        expect(component['button_select_gate_active_']).toBeFalse();
      });

      it('should call host_listener_on_scroll() and set offset_ = 30', () => {
        reset();

        component['button_select_gate_active_'] = false;
        component.host_listener_on_scroll(mock_scroll_event);

        expect(component['offset_']).toEqual(NUMBER_OF_NOTIFICATION_ITEMS);
      });

      it('should call api_get_notifications_() from host_listener_on_scroll()', () => {
        reset();

        component['button_select_gate_active_'] = false;
        component.host_listener_on_scroll(mock_scroll_event);

        expect(component['api_get_notifications_']).toHaveBeenCalled();
      });
    });

    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call button_select() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['button_select']).toHaveBeenCalled();
      });

      it('should call setup_websocket_onbroadcast_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['setup_websocket_onbroadcast_']).toHaveBeenCalled();
      });
    });

    describe('check_title_defined()', () => {
      it('should call check_title_defined()', () => {
        reset();

        component.check_title_defined(mock_title);

        expect(component.check_title_defined).toHaveBeenCalled();
      });

      it('should call check_title_defined() and return true', () => {
        reset();

        const return_value: boolean = component.check_title_defined(mock_title);

        expect(return_value).toBeTrue();
      });

      it('should call check_title_defined() and return false', () => {
        reset();

        const return_value: boolean = component.check_title_defined(null);

        expect(return_value).toBeFalse();
      });
    });

    describe('button_select()', () => {
      it('should call button_select()', () => {
        reset();

        component.button_select(NOTIFICATION_BUTTON_LIST[0]);

        expect(component.button_select).toHaveBeenCalled();
      });

      it('should call button_select() and set selected_notification_button = passed notification button', () => {
        reset();

        component.button_select(NOTIFICATION_BUTTON_LIST[0]);

        expect(component.selected_notification_button).toEqual(NOTIFICATION_BUTTON_LIST[0]);
      });

      it('should call button_select() and set matching button slected value = true', () => {
        reset();

        component.button_select(NOTIFICATION_BUTTON_LIST[0]);

        expect(component.notification_button_list[0].selected).toBeTrue();
      });

      it('should call button_select() and set non matching buttons slected value = false', () => {
        reset();

        component.button_select(NOTIFICATION_BUTTON_LIST[0]);

        const random_button_index: number = Math.floor(Math.random() * 10) + 1;

        expect(component.notification_button_list[random_button_index].selected).toBeFalse();
      });
    });

    describe('get_selected_button_color()', () => {
      it('should call get_selected_button_color()', () => {
        reset();

        component.get_selected_button_color(NOTIFICATION_BUTTON_LIST[0]);

        expect(component.get_selected_button_color).toHaveBeenCalled();
      });

      it('should call get_selected_button_color() and return accent', () => {
        reset();

        const return_value: string = component.get_selected_button_color(NOTIFICATION_BUTTON_LIST[0]);

        expect(return_value).toEqual(ACCENT_BUTTON_COLOR);
      });

      it('should call get_selected_button_color() and return primary', () => {
        reset();

        const random_button_index: number = Math.floor(Math.random() * 10) + 1;
        const return_value: string = component.get_selected_button_color(NOTIFICATION_BUTTON_LIST[random_button_index]);

        expect(return_value).toEqual(PRIMARY_BUTTON_COLOR);
      });
    });

    describe('delete_notification()', () => {
      it('should call delete_notification()', () => {
        reset();

        component.delete_notification(MockNotificationClass_ZeekPendingInstall);

        expect(component.delete_notification).toHaveBeenCalled();
      });

      it('should call api_delete_notification_() from delete_notification()', () => {
        reset();

        component.delete_notification(MockNotificationClass_ZeekPendingInstall);

        expect(component['api_delete_notification_']).toHaveBeenCalled();
      });
    });

    describe('open_delete_all_notification_dialog_window()', () => {
      it('should call open_delete_all_notification_dialog_window()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.open_delete_all_notification_dialog_window();

        expect(component.open_delete_all_notification_dialog_window).toHaveBeenCalled();
      });

      it('should call api_delete_all_notifications_() after mat dialog ref closed from within open_delete_all_notification_dialog_window()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(DELETE_ALL_NOTIFICATIONS_CONFIRM_DIALOG.option2) } as MatDialogRef<typeof component>);

        component.open_delete_all_notification_dialog_window();

        expect(component['api_delete_all_notifications_']).toHaveBeenCalled();
      });

      it('should not call api_delete_all_notifications_() after mat dialog ref closed from within add_rule_set()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component.open_delete_all_notification_dialog_window();

        expect(component['api_delete_all_notifications_']).not.toHaveBeenCalled();
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

    describe('private api_delete_notification_()', () => {
      it('should call api_delete_notification_()', () => {
        reset();

        component['api_delete_notification_'](MockNotificationClass_NotInArray);

        expect(component['api_delete_notification_']).toHaveBeenCalled();
      });

      it('should call notification_service_.delete_all_notifications() from api_delete_all_notifications_()', () => {
        reset();

        component['api_delete_notification_'](MockNotificationClass_ZeekPendingInstall);

        expect(component['notification_service_'].delete_notification).toHaveBeenCalled();
      });

      it('should call notification_service_.delete_all_notifications() and handle response and should remove notification from corresponding notifications array within notifications_button_list', () => {
        reset();

        component.notification_button_list[0].notifications = MockNotificationClassArray;
        component['api_delete_notification_'](MockNotificationClass_ZeekPendingInstall);
        component.notification_button_list.forEach((nb: NotificationButtonInterface) => {
          const index_found: number = nb.notifications.findIndex((n: NotificationClass) => n._id === MockNotificationClass_ZeekPendingInstall._id);

          expect(index_found).toEqual(-1);
        });
      });

      it('should call notification_service_.delete_notification() and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['api_delete_notification_'](MockNotificationClass_ZeekPendingInstall);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call notification_service_.delete_notification() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['notification_service_'], 'delete_notification').and.returnValue(throwError(mock_http_error_response));

        component['api_delete_notification_'](MockNotificationClass_ZeekPendingInstall);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_delete_all_notifications_()', () => {
      it('should call api_delete_all_notifications_()', () => {
        reset();

        component['api_delete_all_notifications_']();

        expect(component['api_delete_all_notifications_']).toHaveBeenCalled();
      });

      it('should call notification_service_.delete_all_notifications() from api_delete_all_notifications_()', () => {
        reset();

        component['api_delete_all_notifications_']();

        expect(component['notification_service_'].delete_all_notifications).toHaveBeenCalled();
      });

      it('should call notification_service_.delete_all_notifications() and handle response and set notfications arrays in notficiation_button_ist = []', () => {
        reset();

        component['api_delete_all_notifications_']();
        component.notification_button_list.forEach((nb: NotificationButtonInterface) => {
          expect(nb.notifications.length).toEqual(0);
        });
      });

      it('should call notification_service_.delete_all_notifications() and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['api_delete_all_notifications_']();

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call notification_service_.delete_all_notifications() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['notification_service_'], 'delete_all_notifications').and.returnValue(throwError(mock_http_error_response));

        component['api_delete_all_notifications_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});
