import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockNotificationClassArray } from '../../../../../static-data/class-objects';
import { MockNotificationInterfaceArray } from '../../../../../static-data/interface-objects';
import { environment } from '../../../../environments/environment';
import { NotificationClass } from '../../../classes';
import { ApiService } from '../../../services/abstract/api.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { NotificationServiceInterface } from '../interface/service-interfaces/notification-service.interface';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetNotifications: jasmine.Spy<any>;
  let spyDeleteNotification: jasmine.Spy<any>;
  let spyDeleteAllNotifications: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const getType = 'GET';
  const deleteType = 'DELETE';

  // Test Data
  const errorRequest = 'Servers are not working as expected. The request is probably valid but needs to be requested again later.';
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
        NotificationService,
        ApiService
      ]
    });

    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyGetNotifications = spyOn(service, 'get_notifications').and.callThrough();
    spyDeleteNotification = spyOn(service, 'delete_notification').and.callThrough();
    spyDeleteAllNotifications = spyOn(service, 'delete_all_notifications').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetNotifications.calls.reset();
    spyDeleteNotification.calls.reset();
    spyDeleteAllNotifications.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create NotificationService', () => {
    expect(service).toBeTruthy();
  });

  describe('NotificationService methods', () => {

    describe('REST get_notifications()', () => {
      it('should call get_notifications()', () => {
        reset();

        service.get_notifications()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: NotificationClass[]) => {
            expect(response.length).toEqual(MockNotificationInterfaceArray.length);
            expect(service.get_notifications).toHaveBeenCalled();
          });

        const xhrURL: string = environment.NOTIFICATION_SERVICE_BASE_URL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockNotificationInterfaceArray);

        after();
      });

      it('should call get_notifications() and handle error', () => {
        reset();

        service.get_notifications()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: NotificationClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_notifications).toHaveBeenCalled();
            });

        const xhrURL: string = environment.NOTIFICATION_SERVICE_BASE_URL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST delete_notification()', () => {
      it('should call delete_notification()', () => {
        reset();

        service.delete_notification('0')
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: void) => {
            expect(service.delete_notification).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.NOTIFICATION_SERVICE_BASE_URL}/0`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(deleteType);

        xhrRequest.flush(null);

        after();
      });

      it('should call delete_notification() and handle error', () => {
        reset();

        service.delete_notification('0')
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: void) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.delete_notification).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.NOTIFICATION_SERVICE_BASE_URL}/0`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST delete_all_notifications()', () => {
      it('should call delete_all_notifications()', () => {
        reset();

        service.delete_all_notifications()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: void) => {
            expect(service.delete_all_notifications).toHaveBeenCalled();
          });

        const xhrURL: string = environment.NOTIFICATION_SERVICE_BASE_URL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(deleteType);

        xhrRequest.flush(null);

        after();
      });

      it('should call delete_all_notifications() and handle error', () => {
        reset();

        service.delete_all_notifications()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: void) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.delete_all_notifications).toHaveBeenCalled();
            });

        const xhrURL: string = environment.NOTIFICATION_SERVICE_BASE_URL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class NotificationServiceSpy implements NotificationServiceInterface {

  get_notifications = jasmine.createSpy('get_notifications').and.callFake(
    (): Observable<NotificationClass[]> => this.call_fake_get_notifications()
  );

  delete_notification = jasmine.createSpy('delete_notification').and.callFake(
    (id: any): Observable<void> => of(null)
  );

  delete_all_notifications = jasmine.createSpy('delete_all_notifications').and.callFake(
    (): Observable<void> => of(null)
  );

  call_fake_get_notifications(): Observable<NotificationClass[]> {
    return of(MockNotificationClassArray);
  }
}
