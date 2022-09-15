import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { MockErrorMessageClass, MockGenericJobAndKeyClass } from '../../../../static-data/class-objects';
import {
  MockBackgroundJobClassFailed,
  MockBackgroundJobClassStarted
} from '../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { MockServerStdoutMatDialogDataInterface } from '../../../../static-data/interface-objects';
import { CANCEL_DIALOG_OPTION, CONFIRM_DIALOG_OPTION } from '../../constants/cvah.constants';
import { TestingModule } from '../testing-modules/testing.module';
import { ServerStdoutComponent } from './server-stdout.component';
import { ServerStdoutModule } from './server-stdout.module';

describe('ServerStdoutComponent', () => {
  let component: ServerStdoutComponent;
  let fixture: ComponentFixture<ServerStdoutComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyStartScroll: jasmine.Spy<any>;
  let spyStopScroll: jasmine.Spy<any>;
  let spyStopJobConfirmDialog: jasmine.Spy<any>;
  let spyRetryJobConfirmDialog: jasmine.Spy<any>;
  let spySetupWebsocketGetSocketOnMessage: jasmine.Spy<any>;
  let spyApiJobLogs: jasmine.Spy<any>;
  let spyApiJobGet: jasmine.Spy<any>;
  let spyApiJobDelete: jasmine.Spy<any>;
  let spyApiJobRetry: jasmine.Spy<any>;

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
        ServerStdoutModule,
        TestingModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: MockServerStdoutMatDialogDataInterface }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerStdoutComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyStartScroll = spyOn(component, 'start_scroll').and.callThrough();
    spyStopScroll = spyOn(component, 'stop_scroll').and.callThrough();
    spyStopJobConfirmDialog = spyOn(component, 'stop_job_confirm_dialog').and.callThrough();
    spyRetryJobConfirmDialog = spyOn(component, 'retry_job_confirm_dialog').and.callThrough();
    spySetupWebsocketGetSocketOnMessage = spyOn<any>(component, 'setup_websocket_get_socket_on_message_').and.callThrough();
    spyApiJobLogs = spyOn<any>(component, 'api_job_logs_').and.callThrough();
    spyApiJobGet = spyOn<any>(component, 'api_job_get_').and.callThrough();
    spyApiJobDelete = spyOn<any>(component, 'api_job_delete_').and.callThrough();
    spyApiJobRetry = spyOn<any>(component, 'api_job_retry_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyStartScroll.calls.reset();
    spyStopScroll.calls.reset();
    spyStopJobConfirmDialog.calls.reset();
    spyRetryJobConfirmDialog.calls.reset();
    spySetupWebsocketGetSocketOnMessage.calls.reset();
    spyApiJobLogs.calls.reset();
    spyApiJobGet.calls.reset();
    spyApiJobDelete.calls.reset();
    spyApiJobRetry.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create ServerStdoutComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ServerStdoutComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call setup_websocket_get_socket_on_message_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['setup_websocket_get_socket_on_message_']).toHaveBeenCalled();
      });

      it('should call api_job_logs_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_job_logs_']).toHaveBeenCalled();
      });
    });

    describe('start_scroll()', () => {
      it('should call start_scroll()', () => {
        reset();

        component.start_scroll();

        expect(component.start_scroll).toHaveBeenCalled();
      });

      it('should call start_scroll() and set scroll_status = true', () => {
        reset();

        component.scroll_status = false;
        component.start_scroll();

        expect(component.scroll_status).toBeTrue();
      });
    });

    describe('stop_scroll()', () => {
      it('should call stop_scroll()', () => {
        reset();

        component.stop_scroll();

        expect(component.stop_scroll).toHaveBeenCalled();
      });

      it('should call stop_scroll() and set scroll_status = false', () => {
        reset();

        component.scroll_status = true;
        component.stop_scroll();

        expect(component.scroll_status).toBeFalse();
      });
    });

    describe('stop_job_confirm_dialog()', () => {
      it('should call stop_job_confirm_dialog()', () => {
        reset();

        component.stop_job_confirm_dialog();

        expect(component.stop_job_confirm_dialog).toHaveBeenCalled();
      });

      it('should call api_job_delete_() after mat dialog ref closed from within stop_job_confirm_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.stop_job_confirm_dialog();

        expect(component['api_job_delete_']).toHaveBeenCalled();
      });

      it('should not call api_job_delete_() after mat dialog ref closed from within stop_job_confirm_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CANCEL_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.stop_job_confirm_dialog();

        expect(component['api_job_delete_']).not.toHaveBeenCalled();
      });
    });

    describe('retry_job_confirm_dialog()', () => {
      it('should call retry_job_confirm_dialog()', () => {
        reset();

        component.retry_job_confirm_dialog();

        expect(component.retry_job_confirm_dialog).toHaveBeenCalled();
      });

      it('should call api_job_retry_() after mat dialog ref closed from within retry_job_confirm_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.retry_job_confirm_dialog();

        expect(component['api_job_retry_']).toHaveBeenCalled();
      });

      it('should not call api_job_retry_() after mat dialog ref closed from within retry_job_confirm_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CANCEL_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.retry_job_confirm_dialog();

        expect(component['api_job_retry_']).not.toHaveBeenCalled();
      });
    });

    // TODO - Update when websocket has been flushed out
    describe('private setup_websocket_get_socket_on_message_()', () => {
      it('should call setup_websocket_get_socket_on_message_()', () => {
        reset();

        component['setup_websocket_get_socket_on_message_']();

        expect(component['setup_websocket_get_socket_on_message_']).toHaveBeenCalled();
      });
    });

    describe('private api_job_logs_()', () => {
      it('should call api_job_logs_()', () => {
        reset();

        component['api_job_logs_']();

        expect(component['api_job_logs_']).toHaveBeenCalled();
      });

      it('should call job_service_.job_logs() from api_job_logs_()', () => {
        reset();

        component['api_job_logs_']();

        expect(component['job_service_'].job_logs).toHaveBeenCalled();
      });

      it('should call from job_service_.job_logs() and handle response and call api_job_get_()', () => {
        reset();

        component['api_job_logs_']();

        expect(component['api_job_get_']).toHaveBeenCalled();
      });

      it('should call job_service_.job_logs() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['job_service_'], 'job_logs').and.returnValue(throwError(MockErrorMessageClass));

        component['api_job_logs_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call job_service_.job_logs() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['job_service_'], 'job_logs').and.returnValue(throwError(mock_http_error_response));

        component['api_job_logs_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_job_get_()', () => {
      it('should call api_job_get_()', () => {
        reset();

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_get_']();

        expect(component['api_job_get_']).toHaveBeenCalled();
      });

      it('should call job_service_.job_get() from api_job_get_()', () => {
        reset();

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_get_']();

        expect(component['job_service_'].job_get).toHaveBeenCalled();
      });

      it('should call from job_service_.job_get() and handle response and set allow_retry = false', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClassStarted));

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component.allow_retry = true;
        component['api_job_get_']();

        expect(component.allow_retry).toBeFalse();
      });

      it('should call from job_service_.job_get() and handle response and set allow_retry = true', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClassFailed));

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component.allow_retry = false;
        component['api_job_get_']();

        expect(component.allow_retry).toBeTrue();
      });

      it('should call job_service_.job_get() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['job_service_'], 'job_get').and.returnValue(throwError(MockErrorMessageClass));

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_get_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call job_service_.job_get() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['job_service_'], 'job_get').and.returnValue(throwError(mock_http_error_response));

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_get_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_job_delete_()', () => {
      it('should call api_job_delete_()', () => {
        reset();

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_delete_']();

        expect(component['api_job_delete_']).toHaveBeenCalled();
      });

      it('should call job_service_.job_delete() from api_job_delete_()', () => {
        reset();

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_delete_']();

        expect(component['job_service_'].job_delete).toHaveBeenCalled();
      });

      it('should call from job_service_.job_delete() and handle response and set job_logs = []', () => {
        reset();

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_delete_']();

        expect(component.job_logs).toEqual([]);
      });

      it('should call job_service_.job_delete() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_delete_']();

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call job_service_.job_delete() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['job_service_'], 'job_delete').and.returnValue(throwError(MockErrorMessageClass));

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_delete_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call job_service_.job_delete() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['job_service_'], 'job_delete').and.returnValue(throwError(mock_http_error_response));

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_delete_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_job_retry_()', () => {
      it('should call api_job_retry_()', () => {
        reset();

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_retry_']();

        expect(component['api_job_retry_']).toHaveBeenCalled();
      });

      it('should call global_job_service_.job_retry() from api_job_retry_()', () => {
        reset();

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_retry_']();

        expect(component['global_job_service_'].job_retry).toHaveBeenCalled();
      });

      it('should call from global_job_service_.job_retry() and handle response and set job_logs = []', () => {
        reset();

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_retry_']();

        expect(component.job_logs).toEqual([]);
      });

      it('should call global_job_service_.job_retry() and handle response and call api_job_get_()', () => {
        reset();

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_retry_']();

        expect(component['api_job_get_']).toHaveBeenCalled();
      });

      it('should call global_job_service_.job_retry() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_retry_']();

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call global_job_service_.job_retry() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_retry').and.returnValue(throwError(MockErrorMessageClass));

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_retry_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call global_job_service_.job_retry() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_retry').and.returnValue(throwError(mock_http_error_response));

        component['job_id_'] = MockGenericJobAndKeyClass.job_id;
        component['api_job_retry_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});
