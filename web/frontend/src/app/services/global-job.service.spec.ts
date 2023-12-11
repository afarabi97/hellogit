import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockBackgroundJobClass, MockBackgroundJobClassStarted, MockGenericJobAndKeyClass } from '../../../static-data/class-objects';
import { MockBackgroundJobInterface, MockGenericJobAndKeyInterface } from '../../../static-data/interface-objects';
import { environment } from '../../environments/environment';
import { BackgroundJobClass, ErrorMessageClass, GenericJobAndKeyClass } from '../classes';
import { GlobalJobServiceInterface } from '../interfaces';
import { InjectorModule } from '../modules/utilily-modules/injector.module';
import { ApiService } from './abstract/api.service';
import { GlobalJobService } from './global-job.service';

describe('GlobalJobService', () => {
  let service: GlobalJobService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyJobGet: jasmine.Spy<any>;
  let spyJobRetry: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const getType = 'GET';
  const putType = 'PUT';

  // Test Data
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
        GlobalJobService,
        ApiService
      ]
    });

    service = TestBed.inject(GlobalJobService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyJobGet = spyOn(service, 'job_get').and.callThrough();
    spyJobRetry = spyOn(service, 'job_retry').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyJobGet.calls.reset();
    spyJobRetry.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create GlobalJobService', () => {
    expect(service).toBeTruthy();
  });

  describe('GlobalJobService methods', () => {

    describe('REST job_get()', () => {
      it('should call job_get()', () => {
        reset();

        service.job_get(MockGenericJobAndKeyClass.job_id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: BackgroundJobClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockBackgroundJobClass[key]);
              }
            });

            expect(service.job_get).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.JOB_SERVICE_BASE}${MockGenericJobAndKeyClass.job_id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockBackgroundJobInterface);

        after();
      });

      it('should call job_get() and handle error message error', () => {
        reset();

        service.job_get(MockGenericJobAndKeyClass.job_id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: BackgroundJobClass) => {},
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
              expect(service.job_get).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.JOB_SERVICE_BASE}${MockGenericJobAndKeyClass.job_id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call job_get() and handle error', () => {
        reset();

        service.job_get(MockGenericJobAndKeyClass.job_id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: BackgroundJobClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.job_get).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.JOB_SERVICE_BASE}${MockGenericJobAndKeyClass.job_id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST job_retry()', () => {
      it('should call job_retry()', () => {
        reset();

        service.job_retry(MockGenericJobAndKeyClass.job_id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: GenericJobAndKeyClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockGenericJobAndKeyClass[key]);
              }
            });

            expect(service.job_retry).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.GLOBAL_JOB_SERVICE_BASE}${MockGenericJobAndKeyClass.job_id}/retry`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(putType);

        xhrRequest.flush(MockGenericJobAndKeyInterface);

        after();
      });

      it('should call job_retry() and handle error message error', () => {
        reset();

        service.job_retry(MockGenericJobAndKeyClass.job_id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: GenericJobAndKeyClass) => {},
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
              expect(service.job_retry).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.GLOBAL_JOB_SERVICE_BASE}${MockGenericJobAndKeyClass.job_id}/retry`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call job_retry() and handle error', () => {
        reset();

        service.job_retry(MockGenericJobAndKeyClass.job_id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: GenericJobAndKeyClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.job_retry).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.GLOBAL_JOB_SERVICE_BASE}${MockGenericJobAndKeyClass.job_id}/retry`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class GlobalJobServiceSpy implements GlobalJobServiceInterface {

  job_get = jasmine.createSpy('job_get').and.callFake(
    (job_id: string): Observable<GenericJobAndKeyClass> => this.call_fake_job_get(job_id)
  );

  job_retry = jasmine.createSpy('job_retry').and.callFake(
    (job_id: string): Observable<GenericJobAndKeyClass> => this.call_fake_job_retry(job_id)
  );

  call_fake_job_get(job_id: string): Observable<BackgroundJobClass> {
    return of(MockBackgroundJobClassStarted);
  }

  call_fake_job_retry(job_id: string): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }
}
