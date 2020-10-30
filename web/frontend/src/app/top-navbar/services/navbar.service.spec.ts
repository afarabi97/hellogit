import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockDIPTimeClass, MockVersionClass } from '../../../../static-data/class-objects-v3_4';
import { MockDIPTimeInterface, MockVersionInterface } from '../../../../static-data/interface-objects-v3_4';
import { environment } from '../../../environments/environment';
import { VersionClass } from '../../classes';
import { ApiService } from '../../services/abstract/api.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { InjectorModule } from '../../modules/utilily-modules/injector.module';
import { DIPTimeClass } from '../classes/dip-time.class';
import { NavbarServiceInterface } from '../interfaces';
import { NavBarService } from './navbar.service';

describe('NavBarService', () => {
  let service: NavBarService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetCurrentDIPTime: jasmine.Spy<any>;
  let spyGetVersion: jasmine.Spy<any>;

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
        NavBarService,
        MatSnackBarService,
        ApiService
      ]
    });

    service = TestBed.get(NavBarService);
    httpMock = TestBed.get(HttpTestingController);

    // Add method spies
    spyGetCurrentDIPTime = spyOn(service, 'getCurrentDIPTime').and.callThrough();
    spyGetVersion = spyOn(service, 'getVersion').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetCurrentDIPTime.calls.reset();
    spyGetVersion.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create NavBarService', () => {
    expect(service).toBeTruthy();
  });

  describe('NavBarService methods', () => {
    describe('CRUD getCurrentDIPTime()', () => {
      it('should call getCurrentDIPTime()', () => {
        reset();

        service.getCurrentDIPTime()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((r: DIPTimeClass) => {
            const objectKeys: string[] = Object.keys(r);
            objectKeys.forEach((key: string) => expect(r[key]).toEqual(MockDIPTimeClass[key]));
            expect(service.getCurrentDIPTime).toHaveBeenCalled();
          });

        const xhrURL: string = environment.NAV_BAR_SERVICE_GET_CURRENT_DIP_TIME;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockDIPTimeInterface);

        after();
      });

      it('should call getCurrentDIPTime() and handle error', () => {
        reset();

        service.getCurrentDIPTime()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (r: DIPTimeClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.getCurrentDIPTime).toHaveBeenCalled();
            });

        const xhrURL: string = environment.NAV_BAR_SERVICE_GET_CURRENT_DIP_TIME;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('CRUD getVersion()', () => {
      it('should call getVersion()', () => {
        reset();

        service.getVersion()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((r: VersionClass) => {
            const objectKeys: string[] = Object.keys(r);
            objectKeys.forEach((key: string) => {
              if (key === 'commit_hash') {
                expect(r[key]).toEqual(MockVersionClass[key].substring(0, 8));
              } else {
                expect(r[key]).toEqual(MockVersionClass[key]);
              }
            });
            expect(service.getVersion).toHaveBeenCalled();
          });

        const xhrURL: string = environment.NAV_BAR_SERVICE_VERSION;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockVersionInterface);

        after();
      });

      it('should call getVersion() and handle error', () => {
        reset();

        service.getVersion()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (r: VersionClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.getVersion).toHaveBeenCalled();
            });

        const xhrURL: string = environment.NAV_BAR_SERVICE_VERSION;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class NavbarServiceSpy implements NavbarServiceInterface {

  getCurrentDIPTime = jasmine.createSpy('getCurrentDIPTime').and.callFake(
    (): Observable<DIPTimeClass> => this.callFakeGetCurrentDIPTime()
  );

  getVersion = jasmine.createSpy('getVersion').and.callFake(
    (): Observable<VersionClass> => this.callFakeGetVersion()
  );

  callFakeGetCurrentDIPTime(): Observable<DIPTimeClass> {
    return observableOf(MockDIPTimeClass);
  }

  callFakeGetVersion(): Observable<VersionClass> {
    return observableOf(MockVersionClass);
  }
}
