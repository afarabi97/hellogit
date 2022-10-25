import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockHiveSettingsClass } from '../../../static-data/class-objects';
import { MockHiveSettingsInterface } from '../../../static-data/interface-objects';
import { environment } from '../../environments/environment';
import { HiveSettingsClass } from '../classes';
import { GlobalHiveSettingsServiceInterface } from '../interfaces';
import { InjectorModule } from '../modules/utilily-modules/injector.module';
import { ApiService } from './abstract/api.service';
import { GlobalHiveSettingsService } from './global-hive-settings.service';

describe('GlobalHiveSettingsService', () => {
  let service: GlobalHiveSettingsService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetHiveSettings: jasmine.Spy<any>;

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
        GlobalHiveSettingsService,
        ApiService
      ]
    });

    service = TestBed.inject(GlobalHiveSettingsService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyGetHiveSettings = spyOn(service, 'get_hive_settings').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetHiveSettings.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create GlobalHiveSettingsService', () => {
    expect(service).toBeTruthy();
  });

  describe('GlobalHiveSettingsService methods', () => {

    describe('REST get_hive_settings()', () => {
      it('should call get_hive_settings()', () => {
        reset();

        service.get_hive_settings()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: HiveSettingsClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockHiveSettingsClass[key]);
              }
            });

            expect(service.get_hive_settings).toHaveBeenCalled();
          });

        const xhrURL: string = environment.GLOBAL_ALERT_SERVICE_SETTINGS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockHiveSettingsInterface);

        after();
      });

      it('should call get_hive_settings() and handle error', () => {
        reset();

        service.get_hive_settings()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: HiveSettingsClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_hive_settings).toHaveBeenCalled();
            });

        const xhrURL: string = environment.GLOBAL_ALERT_SERVICE_SETTINGS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class GlobalHiveSettingsServiceSpy implements GlobalHiveSettingsServiceInterface {

  get_hive_settings = jasmine.createSpy('get_hive_settings').and.callFake(
    (): Observable<HiveSettingsClass> => this.call_fake_get_hive_settings()
  );

  call_fake_get_hive_settings(): Observable<HiveSettingsClass> {
    return of(MockHiveSettingsClass);
  }
}
