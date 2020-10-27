import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockSystemNameDIPClass } from '../../../static-data/class-objects-v3_4';
import { MockSystemNameDIPInterface } from '../../../static-data/interface-objects-v3_4';
import { environment } from '../../environments/environment';
import { SystemNameClass } from '../classes';
import { WeaponSystemNameServiceInterface } from '../interfaces';
import { InjectorModule } from '../modules/utilily-modules/injector.module';
import { ApiService } from './abstract/api.service';
import { MatSnackBarService } from './mat-snackbar.service';
import { WeaponSystemNameService } from './weapon-system-name.service';

describe('WeaponSystemNameService', () => {
  let service: WeaponSystemNameService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spySetSystemName: jasmine.Spy<any>;
  let spyGetSystemName: jasmine.Spy<any>;
  let spyGetSystemNameFromAPI: jasmine.Spy<any>;

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
        WeaponSystemNameService,
        MatSnackBarService,
        ApiService
      ]
    });

    service = TestBed.inject(WeaponSystemNameService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spySetSystemName = spyOn(service, 'setSystemName').and.callThrough();
    spyGetSystemName = spyOn(service, 'getSystemName').and.callThrough();
    spyGetSystemNameFromAPI = spyOn(service, 'getSystemNameFromAPI').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spySetSystemName.calls.reset();
    spyGetSystemName.calls.reset();
    spyGetSystemNameFromAPI.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create WeaponSystemNameService', () => {
    expect(service).toBeTruthy();
  });

  describe('WeaponSystemNameService methods', () => {
    describe('setSystemName()', () => {
      it('should call setSystemName()', () => {
        reset();

        service.setSystemName(MockSystemNameDIPClass);

        expect(service.setSystemName).toHaveBeenCalled();
      });

      it('should call setSystemName() and set system name', () => {
        reset();

        service.setSystemName(MockSystemNameDIPClass);

        expect(service['systemName_']).toEqual(MockSystemNameDIPClass);
      });
    });

    describe('getSystemName()', () => {
      it('should call getSystemName()', () => {
        reset();

        service.setSystemName(MockSystemNameDIPClass);
        service.getSystemName();

        expect(service.getSystemName).toHaveBeenCalled();
      });

      it('should call getSystemName() and return system name', () => {
        reset();

        service.setSystemName(MockSystemNameDIPClass);
        const value = service.getSystemName();

        expect(value).toEqual(MockSystemNameDIPClass.system_name);
      });
    });

    describe('CRUD getSystemNameFromAPI()', () => {
      it('should call getSystemNameFromAPI()', () => {
        reset();

        service.getSystemNameFromAPI()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((r: SystemNameClass) => {
            const objectKeys: string[] = Object.keys(r);
            objectKeys.forEach((key: string) => expect(r[key]).toEqual(MockSystemNameDIPClass[key]));
            expect(service.getSystemNameFromAPI).toHaveBeenCalled();
          });

        const xhrURL: string = environment.WEAPON_SYSTEM_NAME_SERVICE_SYSTEM_NAME;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockSystemNameDIPInterface);

        after();
      });

      it('should call getSystemNameFromAPI() and handle error', () => {
        reset();

        service.getSystemNameFromAPI()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (r: SystemNameClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.getSystemNameFromAPI).toHaveBeenCalled();
            });

        const xhrURL: string = environment.WEAPON_SYSTEM_NAME_SERVICE_SYSTEM_NAME;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class WeaponSystemNameServiceSpy implements WeaponSystemNameServiceInterface {

  setSystemName = jasmine.createSpy('setSystemName').and.callFake(
    (systemName: SystemNameClass): void => this.callFakeSetSystemName(systemName)
  );

  getSystemName = jasmine.createSpy('getSystemName').and.callFake(
    (): string => this.callFakeGetSystemName()
  );

  getSystemNameFromAPI = jasmine.createSpy('getSystemNameFromAPI').and.callFake(
    (): Observable<SystemNameClass> => this.callFakeGetSystemNameFromAPI()
  );

  private systemName_: SystemNameClass = MockSystemNameDIPClass;

  callFakeSetSystemName(systemName: SystemNameClass): void {
    this.systemName_ = systemName;
  }

  callFakeGetSystemName(): string {
    return this.systemName_.system_name;
  }

  callFakeGetSystemNameFromAPI(): Observable<SystemNameClass> {
    return observableOf(MockSystemNameDIPClass);
  }
}
