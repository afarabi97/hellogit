import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockCatalogStatusClass, MockJobClass } from '../../../../../static-data/class-objects-v3_6';
import { MockCatalogStatusInterface, MockJobInterface } from '../../../../../static-data/interface-objects-v3_6';
import { environment } from '../../../../environments/environment';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { ApiService } from '../../../services/abstract/api.service';
import { CatalogStatusClass, JobClass } from '../classes';
import { SURICATA } from '../constants/policy-management.constant';
import { PolicyManagementServiceInterface } from '../interfaces';
import { PolicyManagementService } from './policy-management.service';

describe('PolicyManagementService', () => {
  let service: PolicyManagementService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyCheckCatalogStatus: jasmine.Spy<any>;
  let spyGetJobs: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const getType = 'GET';

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
        PolicyManagementService,
        ApiService
      ]
    });

    service = TestBed.inject(PolicyManagementService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyCheckCatalogStatus = spyOn(service, 'check_catalog_status').and.callThrough();
    spyGetJobs = spyOn(service, 'get_jobs').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyCheckCatalogStatus.calls.reset();
    spyGetJobs.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create PolicyManagementService', () => {
    expect(service).toBeTruthy();
  });

  describe('PolicyManagementService methods', () => {

    describe('REST check_catalog_status()', () => {
      it('should call check_catalog_status()', () => {
        reset();

        service.check_catalog_status(SURICATA)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: CatalogStatusClass[]) => {
            expect(response.length).toEqual(1);

            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => expect(response[0][key]).toEqual(MockCatalogStatusClass[key]));
            expect(service.check_catalog_status).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.POLICY_MANAGEMENT_SERVICE_CHECK_CATALOG_STATUS}/${SURICATA}/status`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([MockCatalogStatusInterface]);

        after();
      });

      it('should call check_catalog_status() and handle error', () => {
        reset();

        service.check_catalog_status(SURICATA)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: CatalogStatusClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.check_catalog_status).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.POLICY_MANAGEMENT_SERVICE_CHECK_CATALOG_STATUS}/${SURICATA}/status`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_jobs()', () => {
      it('should call get_jobs()', () => {
        reset();

        service.get_jobs()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: JobClass[]) => {
            expect(response.length).toEqual(1);

            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => expect(response[0][key]).toEqual(MockJobClass[key]));
            expect(service.get_jobs).toHaveBeenCalled();
          });

        const xhrURL: string = environment.POLICY_MANAGEMENT_SERVICE_GET_JOBS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([MockJobInterface]);

        after();
      });

      it('should call get_jobs() and handle error', () => {
        reset();

        service.get_jobs()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: JobClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_jobs).toHaveBeenCalled();
            });

        const xhrURL: string = environment.POLICY_MANAGEMENT_SERVICE_GET_JOBS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class PolicyManagementServiceSpy implements PolicyManagementServiceInterface {

  check_catalog_status = jasmine.createSpy('check_catalog_status').and.callFake(
    (): Observable<CatalogStatusClass[]> => this.call_fake_check_catalog_status()
  );

  get_jobs = jasmine.createSpy('get_jobs').and.callFake(
    (): Observable<JobClass[]> => this.call_fake_get_jobs()
  );

  call_fake_check_catalog_status(): Observable<CatalogStatusClass[]> {
    return observableOf([MockCatalogStatusClass]);
  }

  call_fake_get_jobs(): Observable<JobClass[]> {
    return observableOf([MockJobClass]);
  }
}
