import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockGenericJobAndKeyClass, MockJobLogClass } from '../../../../../static-data/class-objects';
import { MockGenericJobAndKeyInterface, MockJobLogInterface } from '../../../../../static-data/interface-objects';
import { environment } from '../../../../environments/environment';
import { ErrorMessageClass, GenericJobAndKeyClass } from '../../../classes';
import { InjectorModule } from '../../../modules/utilily-modules/injector.module';
import { ApiService } from '../../../services/abstract/api.service';
import { JobLogClass } from '../classes';
import { JobServiceInterface } from '../interfaces';
import { JobService } from './job.service';

describe('JobService', () => {
  let service: JobService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyJobLogs: jasmine.Spy<any>;
  let spyJobDelete: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const getType = 'GET';
  const deleteType = 'DELETE';

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
        JobService,
        ApiService
      ]
    });

    service = TestBed.inject(JobService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyJobLogs = spyOn(service, 'job_logs').and.callThrough();
    spyJobDelete = spyOn(service, 'job_delete').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyJobLogs.calls.reset();
    spyJobDelete.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create JobService', () => {
    expect(service).toBeTruthy();
  });

  describe('JobService methods', () => {

    describe('REST job_logs()', () => {
      it('should call job_logs()', () => {
        reset();

        service.job_logs(MockGenericJobAndKeyClass.job_id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: JobLogClass[]) => {
            expect(response.length).toEqual(1);

            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockJobLogClass[key]);
              }
            });

            expect(service.job_logs).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.JOB_SERVICE_LOG}${MockGenericJobAndKeyClass.job_id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([MockJobLogInterface]);

        after();
      });

      it('should call job_logs() and handle error message error', () => {
        reset();

        service.job_logs(MockGenericJobAndKeyClass.job_id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: JobLogClass[]) => {},
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
              expect(service.job_logs).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.JOB_SERVICE_LOG}${MockGenericJobAndKeyClass.job_id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call job_logs() and handle error', () => {
        reset();

        service.job_logs(MockGenericJobAndKeyClass.job_id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: JobLogClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.job_logs).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.JOB_SERVICE_LOG}${MockGenericJobAndKeyClass.job_id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST job_delete()', () => {
      it('should call job_delete()', () => {
        reset();

        service.job_delete(MockGenericJobAndKeyClass.job_id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: GenericJobAndKeyClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockGenericJobAndKeyClass[key]);
              }
            });

            expect(service.job_delete).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.GLOBAL_JOB_SERVICE_BASE}${MockGenericJobAndKeyClass.job_id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(deleteType);

        xhrRequest.flush(MockGenericJobAndKeyInterface);

        after();
      });

      it('should call job_delete() and handle error message error', () => {
        reset();

        service.job_delete(MockGenericJobAndKeyClass.job_id)
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
              expect(service.job_delete).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.GLOBAL_JOB_SERVICE_BASE}${MockGenericJobAndKeyClass.job_id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call job_delete() and handle error', () => {
        reset();

        service.job_delete(MockGenericJobAndKeyClass.job_id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: GenericJobAndKeyClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.job_delete).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.GLOBAL_JOB_SERVICE_BASE}${MockGenericJobAndKeyClass.job_id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class JobServiceSpy implements JobServiceInterface {

  job_logs = jasmine.createSpy('job_logs').and.callFake(
    (job_id: string): Observable<JobLogClass[]> => this.call_fake_job_logs(job_id)
  );

  job_delete = jasmine.createSpy('job_delete').and.callFake(
    (job_id: string): Observable<GenericJobAndKeyClass> => this.call_fake_job_delete(job_id)
  );

  call_fake_job_logs(job_id: string): Observable<JobLogClass[]> {
    return of([MockJobLogClass]);
  }

  call_fake_job_delete(job_id: string): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }
}
