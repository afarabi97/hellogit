import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockHostInfoClass } from '../../../static-data/class-objects-v3_6';
import { MockHostInfoInterface } from '../../../static-data/interface-objects-v3_6';
import { environment } from '../../environments/environment';
import { HostInfoClass } from '../classes';
import { SensorHostInfoServiceInterface } from '../interfaces';
import { InjectorModule } from '../modules/utilily-modules/injector.module';
import { ApiService } from './abstract/api.service';
import { SensorHostInfoService } from './sensor-host-info.service';

describe('SensorHostInfoService', () => {
  let service: SensorHostInfoService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetSensorHostInfo: jasmine.Spy<any>;

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
        SensorHostInfoService,
        ApiService
      ]
    });

    service = TestBed.inject(SensorHostInfoService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyGetSensorHostInfo = spyOn(service, 'get_sensor_host_info').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetSensorHostInfo.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create SensorHostInfoService', () => {
    expect(service).toBeTruthy();
  });

  describe('SensorHostInfoService methods', () => {

    describe('REST get_sensor_host_info()', () => {
      it('should call get_sensor_host_info()', () => {
        reset();

        service.get_sensor_host_info()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: HostInfoClass[]) => {
            expect(response.length).toEqual(1);

            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => expect(response[0][key]).toEqual(MockHostInfoClass[key]));
            expect(service.get_sensor_host_info).toHaveBeenCalled();
          });

        const xhrURL: string = environment.SENSOR_HOST_INFO_SERVICE_GET_SENSOR_HOST_INFO;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([MockHostInfoInterface]);

        after();
      });

      it('should call get_sensor_host_info() and handle error', () => {
        reset();

        service.get_sensor_host_info()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: HostInfoClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_sensor_host_info).toHaveBeenCalled();
            });

        const xhrURL: string = environment.SENSOR_HOST_INFO_SERVICE_GET_SENSOR_HOST_INFO;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class SensorHostInfoServiceSpy implements SensorHostInfoServiceInterface {

  get_sensor_host_info = jasmine.createSpy('get_sensor_host_info').and.callFake(
    (): Observable<HostInfoClass[]> => this.call_fake_get_sensor_host_info()
  );

  call_fake_get_sensor_host_info(): Observable<HostInfoClass[]> {
    return observableOf([MockHostInfoClass]);
  }
}
