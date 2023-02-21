import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockHealthDashboardStatusClass, MockKeyValueClassArray } from '../../../../../static-data/class-objects';
import {
  MockHealthDashboardStatusInterface,
  MockKeyValueInterfaceArray
} from '../../../../../static-data/interface-objects';
import { environment } from '../../../../environments/environment';
import { KeyValueClass } from '../../../classes';
import { ApiService } from '../../../services/abstract/api.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { HealthDashboardStatusClass } from '../classes';
import { HealthDashboardStatusServiceInterface } from '../interfaces';
import { HealthDashboardStatusService } from './health-dashboard-status.service';


describe('HealthDashboardStatusService', () => {
  let service: HealthDashboardStatusService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spy_get_health_dashboard_status: jasmine.Spy<any>;
  let spy_get_remote_health_dashboard_status: jasmine.Spy<any>;
  let spy_get_health_dashboard_status_kibana_info_remote: jasmine.Spy<any>;

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
        HealthDashboardStatusService,
        ApiService
      ]
    });

    service = TestBed.inject(HealthDashboardStatusService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spy_get_health_dashboard_status = spyOn(service, 'get_health_dashboard_status').and.callThrough();
    spy_get_remote_health_dashboard_status = spyOn(service, 'get_remote_health_dashboard_status').and.callThrough();
    spy_get_health_dashboard_status_kibana_info_remote = spyOn(service, 'get_health_dashboard_status_kibana_info_remote').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spy_get_health_dashboard_status.calls.reset();
    spy_get_remote_health_dashboard_status.calls.reset();
    spy_get_health_dashboard_status_kibana_info_remote.calls.reset();
  };

  const after = () => {
    httpMock.verify();
  };

  it('should create HealthDashboardStatusService', () => {
    expect(service).toBeTruthy();
  });

  describe('HealthDashboardStatusService methods', () => {
    describe('REST get_health_dashboard_status()', () => {
      it('should call get_health_dashboard_status()', () => {
        reset();

        service.get_health_dashboard_status()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: HealthDashboardStatusClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockHealthDashboardStatusClass[key]);
              }
            });

            expect(service.get_health_dashboard_status).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.HEALTH_DASHBOARD_STATUS}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([MockHealthDashboardStatusInterface]);

        after();
      });

      it('should call get_health_dashboard_status() and handle error', () => {
        reset();

        service.get_health_dashboard_status()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: HealthDashboardStatusClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_health_dashboard_status).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.HEALTH_DASHBOARD_STATUS}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_remote_health_dashboard_status()', () => {
      it('should call get_remote_health_dashboard_status()', () => {
        reset();

        service.get_remote_health_dashboard_status()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: HealthDashboardStatusClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockHealthDashboardStatusClass[key]);
              }
            });

            expect(service.get_remote_health_dashboard_status).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.HEALTH_REMOTE_DASHBOARD_STATUS}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([MockHealthDashboardStatusInterface]);

        after();
      });

      it('should call get_remote_health_dashboard_status() and handle error', () => {
        reset();

        service.get_remote_health_dashboard_status()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: HealthDashboardStatusClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_remote_health_dashboard_status).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.HEALTH_REMOTE_DASHBOARD_STATUS}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_health_dashboard_status_kibana_info_remote<ipaddress>', () => {
      it('should call get_health_dashboard_status_kibana_info_remote<ipaddress>', () => {
        reset();

        service.get_health_dashboard_status_kibana_info_remote(MockHealthDashboardStatusInterface.ipaddress)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: KeyValueClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockKeyValueClassArray[0][key]);
              }
            });

            expect(service.get_health_dashboard_status_kibana_info_remote).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.HEALTH_DASHBOARD_STATUS_KIBANA_INFO_REMOTE}/${MockHealthDashboardStatusInterface.ipaddress}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockKeyValueInterfaceArray);

        after();
      });

      it('should call get_health_dashboard_status_kibana_info_remote<ipaddress> and handle error', () => {
        reset();

        service.get_health_dashboard_status_kibana_info_remote(MockHealthDashboardStatusInterface.ipaddress)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: KeyValueClass[] ) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_health_dashboard_status_kibana_info_remote).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.HEALTH_DASHBOARD_STATUS_KIBANA_INFO_REMOTE}/${MockHealthDashboardStatusInterface.ipaddress}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class HealthDashboardStatusServiceSpy implements HealthDashboardStatusServiceInterface {

  get_health_dashboard_status = jasmine.createSpy('get_health_dashboard_status').and.callFake(
    (): Observable<HealthDashboardStatusClass[]> => this.call_fake_get_health_dashboard_status()
  );

  get_remote_health_dashboard_status = jasmine.createSpy('get_remote_health_dashboard_status').and.callFake(
    (): Observable<HealthDashboardStatusClass[]> => this.call_fake_remote_get_health_dashboard_status()
  );

  get_health_dashboard_status_kibana_info_remote = jasmine.createSpy('get_health_dashboard_status_kibana_info_remote').and.callFake(
    (ipaddress: string): Observable<Object> => this.call_fake_get_health_dashboard_status_kibana_info_remote(ipaddress)
  );

  call_fake_get_health_dashboard_status(): Observable<HealthDashboardStatusClass[]> {
    return of([MockHealthDashboardStatusInterface]);
  }

  call_fake_remote_get_health_dashboard_status(): Observable<HealthDashboardStatusClass[]> {
    return of([MockHealthDashboardStatusInterface]);
  }

  call_fake_get_health_dashboard_status_kibana_info_remote(ip_address: string): Observable<KeyValueClass[]> {
    return of(MockKeyValueClassArray);
  }
}
