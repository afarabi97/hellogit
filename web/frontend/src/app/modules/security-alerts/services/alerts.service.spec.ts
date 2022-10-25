import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  MockAlertListClassSuricata,
  MockAlertListClassZeek,
  MockModifyRemoveReturnClass,
  MockUpdateAlertsClassArray,
  MockUpdateAlertsClassCaptureLoss
} from '../../../../../static-data/class-objects';
import {
  MockAlertListInterfaceSuricata,
  MockModifyRemoveReturnInterface,
  MockUpdateAlertsInterfaceArray
} from '../../../../../static-data/interface-objects';
import { MockAlertFields } from '../../../../../static-data/return-data';
import { environment } from '../../../../environments/environment';
import { ErrorMessageClass } from '../../../classes';
import { ApiService } from '../../../services/abstract/api.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { AlertListClass, ModifyRemoveReturnClass, UpdateAlertsClass } from '../classes';
import { AlertServiceInterface } from '../interfaces';
import { AlertService } from './alerts.service';

describe('AlertService', () => {
  let service: AlertService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetFields: jasmine.Spy<any>;
  let spyGetAlerts: jasmine.Spy<any>;
  let spyGetAlertList: jasmine.Spy<any>;
  let spyModifyAlert: jasmine.Spy<any>;
  let spyRemoveAlert: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const getType = 'GET';
  const postType = 'POST';

  // Test Data
  const start_time: string = '2022-09-25T19:14:07.256Z';
  const end_time: string = '2022-09-26T19:14:07.256Z';
  const fields: string = 'event.module,event.kind,rule.name';
  const errorRequest = 'Servers are not working as expected. The request is probably valid but needs to be requested again later.';
  const errorMessageRequest = {
    error_message: 'Servers are not working as expected. The request is probably valid but needs to be requested again later.'
  };
  const mockErrorResponse = { status: 500, statusText: 'Internal Server Error' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        InjectorModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        AlertService,
        ApiService
      ]
    });

    service = TestBed.inject(AlertService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyGetFields = spyOn(service, 'get_fields').and.callThrough();
    spyGetAlerts = spyOn(service, 'get_alerts').and.callThrough();
    spyGetAlertList = spyOn(service, 'get_alert_list').and.callThrough();
    spyModifyAlert = spyOn(service, 'modify_alert').and.callThrough();
    spyRemoveAlert = spyOn(service, 'remove_alerts').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetFields.calls.reset();
    spyGetAlerts.calls.reset();
    spyGetAlertList.calls.reset();
    spyModifyAlert.calls.reset();
    spyRemoveAlert.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create AlertService', () => {
    expect(service).toBeTruthy();
  });

  describe('AlertService methods', () => {

    describe('REST get_fields()', () => {
      it('should call get_fields()', () => {
        reset();

        service.get_fields()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: string[]) => {
            expect(response.length).toEqual(MockAlertFields.length);
            response.forEach((value: string, index: number) => {
              expect(value).toEqual(MockAlertFields[index]);
            });
            expect(service.get_fields).toHaveBeenCalled();
          });

        const xhrURL: string = environment.ALERT_SERVICE_FIELDS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockAlertFields);

        after();
      });

      it('should call get_fields() and handle error', () => {
        reset();

        service.get_fields()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: string[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_fields).toHaveBeenCalled();
            });

        const xhrURL: string = environment.ALERT_SERVICE_FIELDS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_alerts()', () => {
      it('should call get_alerts()', () => {
        reset();

        service.get_alerts(fields, start_time, end_time, true, false, false)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: Object[]) => {
            expect(response.length).toEqual(MockUpdateAlertsClassArray.length);

            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockUpdateAlertsClassArray[0][key]);
              }
            });

            expect(service.get_alerts).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.ALERT_SERVICE_BASE}yes/no/no/${start_time}/${end_time}/${fields}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockUpdateAlertsInterfaceArray);

        after();
      });

      it('should call get_alerts() and handle error message error', () => {
        reset();

        service.get_alerts(fields, start_time, end_time, true, false, false)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Object[]) => {},
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error['error'] instanceof ErrorMessageClass) {
                const objectKeys: string[] = Object.keys(error['error']);
                objectKeys.forEach((key: string) => {
                  if (!(error['error'][key] instanceof Array)) {
                    expect(error['error'][key]).toEqual(errorMessageRequest[key]);
                  }
                });
                expect(error['error']).toContain(errorMessageRequest);
              }
              expect(service.get_alerts).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.ALERT_SERVICE_BASE}yes/no/no/${start_time}/${end_time}/${fields}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call get_alerts() and handle error', () => {
        reset();

        service.get_alerts(fields, start_time, end_time, true, false, false)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Object[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_alerts).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.ALERT_SERVICE_BASE}yes/no/no/${start_time}/${end_time}/${fields}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_alert_list()', () => {
      it('should call get_alert_list()', () => {
        reset();

        service.get_alert_list(MockUpdateAlertsClassCaptureLoss)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: AlertListClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockAlertListClassSuricata[key]);
              }
            });

            expect(service.get_alert_list).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.ALERT_SERVICE_LIST}0`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockAlertListInterfaceSuricata);

        after();
      });

      it('should call get_alert_list() and handle error', () => {
        reset();

        service.get_alert_list(MockUpdateAlertsClassCaptureLoss)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: AlertListClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_alert_list).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.ALERT_SERVICE_LIST}0`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST modify_alert()', () => {
      it('should call modify_alert()', () => {
        reset();

        service.modify_alert(MockUpdateAlertsClassCaptureLoss)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: ModifyRemoveReturnClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockModifyRemoveReturnClass[key]);
              }
            });

            expect(service.modify_alert).toHaveBeenCalled();
          });

        const xhrURL: string = environment.ALERT_SERVICE_MODIFY;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockModifyRemoveReturnInterface);

        after();
      });

      it('should call modify_alert() and handle error message error', () => {
        reset();

        service.modify_alert(MockUpdateAlertsClassCaptureLoss)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: ModifyRemoveReturnClass) => {},
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error['error'] instanceof ErrorMessageClass) {
                const objectKeys: string[] = Object.keys(error['error']);
                objectKeys.forEach((key: string) => {
                  if (!(error['error'][key] instanceof Array)) {
                    expect(error['error'][key]).toEqual(errorMessageRequest[key]);
                  }
                });
                expect(error['error']).toContain(errorMessageRequest);
              }
              expect(service.modify_alert).toHaveBeenCalled();
            });

        const xhrURL: string = environment.ALERT_SERVICE_MODIFY;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call modify_alert() and handle error', () => {
        reset();

        service.modify_alert(MockUpdateAlertsClassCaptureLoss)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: ModifyRemoveReturnClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.modify_alert).toHaveBeenCalled();
            });

        const xhrURL: string = environment.ALERT_SERVICE_MODIFY;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST remove_alerts()', () => {
      it('should call remove_alerts()', () => {
        reset();

        service.remove_alerts(MockUpdateAlertsClassCaptureLoss)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: ModifyRemoveReturnClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockModifyRemoveReturnClass[key]);
              }
            });

            expect(service.remove_alerts).toHaveBeenCalled();
          });

        const xhrURL: string = environment.ALERT_SERVICE_REMOVE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockModifyRemoveReturnInterface);

        after();
      });

      it('should call remove_alerts() and handle error message error', () => {
        reset();

        service.remove_alerts(MockUpdateAlertsClassCaptureLoss)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: ModifyRemoveReturnClass) => {},
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error['error'] instanceof ErrorMessageClass) {
                const objectKeys: string[] = Object.keys(error['error']);
                objectKeys.forEach((key: string) => {
                  if (!(error['error'][key] instanceof Array)) {
                    expect(error['error'][key]).toEqual(errorMessageRequest[key]);
                  }
                });
                expect(error['error']).toContain(errorMessageRequest);
              }
              expect(service.remove_alerts).toHaveBeenCalled();
            });

        const xhrURL: string = environment.ALERT_SERVICE_REMOVE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call remove_alerts() and handle error', () => {
        reset();

        service.remove_alerts(MockUpdateAlertsClassCaptureLoss)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: ModifyRemoveReturnClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.remove_alerts).toHaveBeenCalled();
            });

        const xhrURL: string = environment.ALERT_SERVICE_REMOVE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class AlertServiceSpy implements AlertServiceInterface {

  get_fields = jasmine.createSpy('get_fields').and.callFake(
    (): Observable<string[]> => this.call_fake_get_fields()
  );

  get_alerts = jasmine.createSpy('get_alerts').and.callFake(
    (fields: string, start_time: string,
     end_time: string, acknowledged: boolean=false,
     escalated: boolean=false, show_closed: boolean=false): Observable<Object[]> => this.call_fake_get_alerts(fields, start_time, end_time, acknowledged, escalated, show_closed)
  );

  get_alert_list = jasmine.createSpy('get_alert_list').and.callFake(
    (update_alert: Object, size: number=0): Observable<AlertListClass> => this.call_fake_get_alert_list(update_alert, size)
  );

  modify_alert = jasmine.createSpy('modify_alert').and.callFake(
    (update_alert: Object): Observable<ModifyRemoveReturnClass> => this.call_fake_modify_alert(update_alert)
  );

  remove_alerts = jasmine.createSpy('remove_alerts').and.callFake(
    (update_alert: Object): Observable<ModifyRemoveReturnClass> => this.call_fake_remove_alerts(update_alert)
  );

  call_fake_get_fields(): Observable<string[]> {
    return of(MockAlertFields);
  }

  call_fake_get_alerts(fields: string, start_time: string,
                       end_time: string, acknowledged: boolean=false,
                       escalated: boolean=false, show_closed: boolean=false): Observable<Object[]> {
    return of(MockUpdateAlertsClassArray);
  }

  call_fake_get_alert_list(update_alert: Object, size: number=0): Observable<AlertListClass> {
    return of(MockAlertListClassZeek);
  }

  call_fake_modify_alert(update_alert: Object): Observable<ModifyRemoveReturnClass> {
    return of(MockModifyRemoveReturnClass);
  }

  call_fake_remove_alerts(update_alert: Object): Observable<ModifyRemoveReturnClass> {
    return of(MockModifyRemoveReturnClass);
  }
}
