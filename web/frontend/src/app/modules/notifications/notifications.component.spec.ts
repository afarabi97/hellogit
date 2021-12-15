import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import {
  MockNotificationClass_NotInArray,
  MockNotificationClass_ZeekPendingInstall,
  MockNotificationClassArray
} from '../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { NotificationClass } from '../../classes';
import { ACCENT_BUTTON_COLOR, PRIMARY_BUTTON_COLOR } from '../../constants/cvah.constants';
import { TestingModule } from '../testing-modules/testing.module';
import {
  DELETE_ALL_NOTIFICATIONS_CONFIRM_DIALOG,
  NOTIFICATION_BUTTON_LIST,
  NUMBER_OF_NOTIFICATION_ITEMS
} from './constants/notifications.constant';
import { NotificationButtonInterface } from './interface/notification-button.interface';
import { NotificationsComponent } from './notifications.component';
import { NotificationsModule } from './notifications.module';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;

  // Setup spy references
  let spyHostListenerOnScroll: jasmine.Spy<any>;
  let spyNGOnInit: jasmine.Spy<any>;
  let spyButtonSelect: jasmine.Spy<any>;
  let spyGetSelectedButtonColor: jasmine.Spy<any>;
  let spyDeleteNotification: jasmine.Spy<any>;
  let spyOpenDeleteAllNotificationDialogWindow: jasmine.Spy<any>;
  let spyOpenNotificationDialogWindow: jasmine.Spy<any>;
  let spyAddNotificationToButtonList: jasmine.Spy<any>;
  let spySetNotificationDisplayTime: jasmine.Spy<any>;
  let spySetupWebsocketOnbroadcast: jasmine.Spy<any>;
  let spyApiGetNotifications: jasmine.Spy<any>;
  let spyApiDeleteNotification: jasmine.Spy<any>;
  let spyApiDeleteAllNotifications: jasmine.Spy<any>;

  // Test Data
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
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyHostListenerOnScroll = spyOn(component, 'host_listener_on_scroll').and.callThrough();
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyButtonSelect = spyOn(component, 'button_select').and.callThrough();
    spyGetSelectedButtonColor = spyOn(component, 'get_selected_button_color').and.callThrough();
    spyDeleteNotification = spyOn(component, 'delete_notification').and.callThrough();
    spyOpenDeleteAllNotificationDialogWindow = spyOn(component, 'open_delete_all_notification_dialog_window').and.callThrough();
    spyOpenNotificationDialogWindow = spyOn(component, 'open_notification_dialog_window').and.callThrough();
    spyAddNotificationToButtonList = spyOn<any>(component, 'add_notification_to_button_list_').and.callThrough();
    spySetNotificationDisplayTime = spyOn<any>(component, 'set_notification_display_time_').and.callThrough();
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
    spyButtonSelect.calls.reset();
    spyGetSelectedButtonColor.calls.reset();
    spyDeleteNotification.calls.reset();
    spyOpenDeleteAllNotificationDialogWindow.calls.reset();
    spyOpenNotificationDialogWindow.calls.reset();
    spyAddNotificationToButtonList.calls.reset();
    spySetNotificationDisplayTime.calls.reset();
    spySetupWebsocketOnbroadcast.calls.reset();
    spyApiGetNotifications.calls.reset();
    spyApiDeleteNotification.calls.reset();
    spyApiDeleteAllNotifications.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create NotificationsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('NotificationsComponent methods', () => {
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

        component.host_listener_on_scroll(mock_scroll_event);

        expect(component['offset_']).toEqual(NUMBER_OF_NOTIFICATION_ITEMS);
      });

      it('should call api_get_notifications_() from host_listener_on_scroll()', () => {
        reset();

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

      it('should call setup_websocket_onbroadcast_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['setup_websocket_onbroadcast_']).toHaveBeenCalled();
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

    describe('open_notification_dialog_window()', () => {
      it('should call open_notification_dialog_window()', () => {
        reset();

        component.open_notification_dialog_window();

        expect(component.open_notification_dialog_window).toHaveBeenCalled();
      });

      it('should call generic_dialog_factory_service_.open() from within open_notification_dialog_window()', () => {
        reset();

        spyOn<any>(component['generic_dialog_factory_service_'], 'open').and.callThrough();

        component.open_notification_dialog_window();

        expect(component['generic_dialog_factory_service_'].open).toHaveBeenCalled();
      });
    });

    describe('private add_notification_to_button_list_()', () => {
      it('should call add_notification_to_button_list_()', () => {
        reset();

        component['add_notification_to_button_list_'](MockNotificationClass_ZeekPendingInstall);

        expect(component['add_notification_to_button_list_']).toHaveBeenCalled();
      });

      it('should call set_notification_display_time_() from within add_notification_to_button_list_()', () => {
        reset();

        component['add_notification_to_button_list_'](MockNotificationClass_ZeekPendingInstall);

        expect(component['set_notification_display_time_']).toHaveBeenCalled();
      });

      it('should call add_notification_to_button_list_() and set notification within proper notification button', () => {
        reset();

        component.notification_button_list.forEach((nb: NotificationButtonInterface) => nb.notifications = []);
        component['add_notification_to_button_list_'](MockNotificationClass_ZeekPendingInstall);
        component.notification_button_list.forEach((nb: NotificationButtonInterface) => {
          if ((nb.role === MockNotificationClass_ZeekPendingInstall.role) || (nb.role === 'all')) {
            expect(nb.notifications.length).toEqual(1);
          } else {
            expect(nb.notifications.length).toEqual(0);
          }
        });
      });
    });

    describe('private set_notification_display_time_()', () => {
      it('should call set_notification_display_time_()', () => {
        reset();

        component['set_notification_display_time_'](MockNotificationClass_ZeekPendingInstall);

        expect(component['set_notification_display_time_']).toHaveBeenCalled();
      });

      it('should call set_notification_display_time_() and return notification with displayTime set', () => {
        reset();

        const displaytime_ends_with: string[] = [ 'Now', 'minute(s) ago', 'hour(s) ago', 'day(s) ago', 'week(s) ago' ];
        // all values are based on method from component muliplied by 60000
        const multiply_values: number[] = [ 1000, 60000, 86399000, 604799000, 604800000, -60000 ];
        for (let i = 0; i < 5; i++) {
          const date_from_mock: Date = new Date();
          if (date_from_mock.toString().endsWith('(Central Standard Time)')) {
            MockNotificationClass_ZeekPendingInstall.timestamp = new Date((date_from_mock.getTime() + (date_from_mock.getTimezoneOffset() * 60000)) - multiply_values[i]);
          } else {
            MockNotificationClass_ZeekPendingInstall.timestamp = new Date(date_from_mock.getTime() - multiply_values[i]);
          }

          const return_value: NotificationClass = component['set_notification_display_time_'](MockNotificationClass_ZeekPendingInstall);
          const display_time: string = return_value.displayTime;

          expect(display_time.endsWith(displaytime_ends_with[i])).toBeTrue();
        }
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

      it('should call websocket_service_.onBroadcast() and call add_notification_to_button_list_()', () => {
        reset();

        component['setup_websocket_onbroadcast_']();

        expect(component['add_notification_to_button_list_']).toHaveBeenCalled();
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

      it('should call notification_service_.get_notifications() and call add_notification_to_button_list_()', () => {
        reset();

        component['api_get_notifications_']();

        expect(component['add_notification_to_button_list_']).toHaveBeenCalled();
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
