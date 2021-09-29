import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockSystemVersionClass } from '../../../../../static-data/class-objects';
import { MockSystemVersionInterface } from '../../../../../static-data/interface-objects';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../services/abstract/api.service';
import { MatSnackBarService } from '../../../services/mat-snackbar.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { SystemVersionClass } from '../classes';
import { SystemVersionServiceInterface } from '../interfaces';
import { SystemVersionService } from './system-version.service';

describe('SystemVersionService', () => {
  let service: SystemVersionService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetSystemVersion: jasmine.Spy<any>;

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
        SystemVersionService,
        MatSnackBarService,
        ApiService
      ]
    });

    service = TestBed.inject(SystemVersionService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyGetSystemVersion = spyOn(service, 'get_system_version').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetSystemVersion.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create SystemVersionService', () => {
    expect(service).toBeTruthy();
  });

  describe('SystemVersionService methods', () => {

    describe('REST get_system_version()', () => {
      it('should call get_system_version()', () => {
        reset();

        service.get_system_version()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: SystemVersionClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (key === 'commit_hash') {
                expect(response[key]).toEqual(MockSystemVersionClass[key].substring(0, 8));
              } else {
                expect(response[key]).toEqual(MockSystemVersionClass[key]);
              }
            });
            expect(service.get_system_version).toHaveBeenCalled();
          });

        const xhrURL: string = environment.SYSTEM_VERSION_SERVICE_SYSTEM_VERSION;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockSystemVersionInterface);

        after();
      });

      it('should call get_system_version() and handle error', () => {
        reset();

        service.get_system_version()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SystemVersionClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_system_version).toHaveBeenCalled();
            });

        const xhrURL: string = environment.SYSTEM_VERSION_SERVICE_SYSTEM_VERSION;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class SystemVersionServiceSpy implements SystemVersionServiceInterface {

  get_system_version = jasmine.createSpy('get_system_version').and.callFake(
    (): Observable<SystemVersionClass> => this.callfake_get_system_version()
  );

  callfake_get_system_version(): Observable<SystemVersionClass> {
    return observableOf(MockSystemVersionClass);
  }
}
