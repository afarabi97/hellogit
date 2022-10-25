import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockHiveSettingsClass } from '../../../../../static-data/class-objects';
import { MockHiveSettingsInterface } from '../../../../../static-data/interface-objects';
import { environment } from '../../../../environments/environment';
import { ErrorMessageClass, HiveSettingsClass } from '../../../classes';
import { HiveSettingsInterface } from '../../../interfaces';
import { InjectorModule } from '../../../modules/utilily-modules/injector.module';
import { ApiService } from '../../../services/abstract/api.service';
import { HiveSettingsServiceInterface } from '../interfaces';
import { HiveSettingsService } from './hive-settings.service';

describe('HiveSettingsService', () => {
  let service: HiveSettingsService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spySaveHiveSettings: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const postType = 'POST';

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
        HiveSettingsService,
        ApiService
      ]
    });

    service = TestBed.inject(HiveSettingsService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spySaveHiveSettings = spyOn(service, 'save_hive_settings').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spySaveHiveSettings.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create HiveSettingsService', () => {
    expect(service).toBeTruthy();
  });

  describe('HiveSettingsService methods', () => {

    describe('REST save_hive_settings()', () => {
      it('should call save_hive_settings()', () => {
        reset();

        service.save_hive_settings(MockHiveSettingsInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: HiveSettingsClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockHiveSettingsClass[key]);
              }
            });

            expect(service.save_hive_settings).toHaveBeenCalled();
          });

        const xhrURL: string = environment.ALERT_SERVICE_SETTINGS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockHiveSettingsInterface);

        after();
      });

      it('should call save_hive_settings() and handle error message error', () => {
        reset();

        service.save_hive_settings(MockHiveSettingsInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: HiveSettingsClass) => {},
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
              expect(service.save_hive_settings).toHaveBeenCalled();
            });

        const xhrURL: string = environment.ALERT_SERVICE_SETTINGS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call save_hive_settings() and handle error', () => {
        reset();

        service.save_hive_settings(MockHiveSettingsInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: HiveSettingsClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.save_hive_settings).toHaveBeenCalled();
            });

        const xhrURL: string = environment.ALERT_SERVICE_SETTINGS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class HiveSettingsServiceSpy implements HiveSettingsServiceInterface {

  save_hive_settings = jasmine.createSpy('save_hive_settings').and.callFake(
    (hive_settings: HiveSettingsInterface): Observable<HiveSettingsClass> => this.call_fake_save_hive_settings(hive_settings)
  );

  call_fake_save_hive_settings(hive_settings: HiveSettingsInterface): Observable<HiveSettingsClass> {
    return of(MockHiveSettingsClass);
  }
}
