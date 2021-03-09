import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockHealthStatusClass } from '../../../../static-data/class-objects-v3_6';
import { MockHealthStatusInterface } from '../../../../static-data/interface-objects-v3_6';

import { environment } from '../../../environments/environment';
import { InjectorModule } from '../../modules/utilily-modules/injector.module';
import { ApiService } from '../../services/abstract/api.service';

import { HealthStatusClass } from '../classes';
import { SystemHealthServiceInterface } from '../interfaces';
import { SystemHealthService } from './system-health.service';

describe('SystemHealthService', () => {
  let service: SystemHealthService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetHealthStatus: jasmine.Spy<any>;

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
        SystemHealthService,
        ApiService
      ]
    });

    service = TestBed.inject(SystemHealthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyGetHealthStatus = spyOn(service, 'getHealthStatus').and.callThrough();

  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetHealthStatus.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create SystemHealthService', () => {
    expect(service).toBeTruthy();
  });

  describe('SystemHealthService methods', () => {

    describe('REST getHealthStatus()', () => {
      it('should call getHealthStatus()', () => {
        reset();

        service.getHealthStatus()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: HealthStatusClass) => {
            expect(response).toEqual(MockHealthStatusClass);
            expect(service.getHealthStatus).toHaveBeenCalled();
          });

        const xhrURL: string = environment.SYSTEM_HEALTH_SERVICE_GET_HEALTH_STATUS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockHealthStatusInterface);

        after();
      });

      it('should call getHealthStatus() and handle error', () => {
        reset();

        service.getHealthStatus()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: HealthStatusClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.getHealthStatus).toHaveBeenCalled();
            });

        const xhrURL: string = environment.SYSTEM_HEALTH_SERVICE_GET_HEALTH_STATUS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class SystemHealthServiceSpy implements SystemHealthServiceInterface {
  getHealthStatus = jasmine.createSpy('getHealthStatus').and.callFake((): Observable<HealthStatusClass> => this.callFakeGetHealthStatus());
  getPipelineStatus = jasmine.createSpy('getPipelineStatus').and.callFake((): Observable<Object> => this.callFakeGetPipelineStatus());
  describePod = jasmine.createSpy('describePod').and.callFake((pod_name: string, namespace: string): Observable<Object> => this.callFakeDescribePod(pod_name, namespace));
  podLogs = jasmine.createSpy('podLogs').and.callFake((pod_name: string, namespace: string): Observable<Object> => this.callFakePodLogs(pod_name, namespace));
  describeNode = jasmine.createSpy('describeNode').and.callFake((node_name: string): Observable<Object> => this.callFakeDesribeNode(node_name));

  callFakeGetHealthStatus(): Observable<HealthStatusClass> {
    return observableOf(MockHealthStatusClass);
  }

  callFakeGetPipelineStatus(): Observable<Object> {
    return observableOf({});
  }

  callFakeDescribePod(pod_name: string, namespace: string): Observable<Object> {
    return observableOf({});
  }

  callFakePodLogs(pod_name: string, namespace: string): Observable<Object> {
    return observableOf({});
  }

  callFakeDesribeNode(node_name: string): Observable<Object> {
    return observableOf({});
  }
}
