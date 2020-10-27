import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockUserAllTrueClass } from '../../../static-data/class-objects-v3_4';
import { MockUserAllTrueInterface } from '../../../static-data/interface-objects-v3_4';
import { environment } from '../../environments/environment';
import { UserClass } from '../classes';
import { UserServiceInterface } from '../interfaces';
import { InjectorModule } from '../modules/utilily-modules/injector.module';
import { ApiService } from './abstract/api.service';
import { MatSnackBarService } from './mat-snackbar.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spySetUser: jasmine.Spy<any>;
  let spyGetUser: jasmine.Spy<any>;
  let spyIsControllerAdmin: jasmine.Spy<any>;
  let spyIsControllerMaintainer: jasmine.Spy<any>;
  let spyIsOperator: jasmine.Spy<any>;
  let spyIsRealmAdmin: jasmine.Spy<any>;
  let spyGetUserFromAPI: jasmine.Spy<any>;

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
        UserService,
        MatSnackBarService,
        ApiService
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spySetUser = spyOn(service, 'setUser').and.callThrough();
    spyGetUser = spyOn(service, 'getUser').and.callThrough();
    spyIsControllerAdmin = spyOn(service, 'isControllerAdmin').and.callThrough();
    spyIsControllerMaintainer = spyOn(service, 'isControllerMaintainer').and.callThrough();
    spyIsOperator = spyOn(service, 'isOperator').and.callThrough();
    spyIsRealmAdmin = spyOn(service, 'isRealmAdmin').and.callThrough();
    spyGetUserFromAPI = spyOn(service, 'getUserFromAPI').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spySetUser.calls.reset();
    spyGetUser.calls.reset();
    spyIsControllerAdmin.calls.reset();
    spyIsControllerMaintainer.calls.reset();
    spyIsOperator.calls.reset();
    spyIsRealmAdmin.calls.reset();
    spyGetUserFromAPI.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create UserService', () => {
    expect(service).toBeTruthy();
  });

  describe('UserService methods', () => {
    describe('setUser()', () => {
      it('should call setUser()', () => {
        reset();

        service.setUser(MockUserAllTrueClass);

        expect(service.setUser).toHaveBeenCalled();
      });

      it('should call setUser() and set user', () => {
        reset();

        service.setUser(MockUserAllTrueClass);

        expect(service['user_']).toEqual(MockUserAllTrueClass);
      });
    });

    describe('getUser()', () => {
      it('should call getUser()', () => {
        reset();

        service.setUser(MockUserAllTrueClass);
        service.getUser();

        expect(service.getUser).toHaveBeenCalled();
      });

      it('should call getUser() and return user', () => {
        reset();

        service.setUser(MockUserAllTrueClass);
        const value = service.getUser();

        expect(value).toEqual(MockUserAllTrueClass);
      });
    });

    describe('isControllerAdmin()', () => {
      it('should call isControllerAdmin()', () => {
        reset();

        service.setUser(MockUserAllTrueClass);
        service.isControllerAdmin();

        expect(service.isControllerAdmin).toHaveBeenCalled();
      });

      it('should call isControllerAdmin() and return admin bool value', () => {
        reset();

        service.setUser(MockUserAllTrueClass);
        const value = service.isControllerAdmin();

        expect(value).toEqual(MockUserAllTrueClass.controller_admin);
      });
    });

    describe('isControllerMaintainer()', () => {
      it('should call isControllerMaintainer()', () => {
        reset();

        service.setUser(MockUserAllTrueClass);
        service.isControllerMaintainer();

        expect(service.isControllerMaintainer).toHaveBeenCalled();
      });

      it('should call isControllerMaintainer() and return maintainer bool value', () => {
        reset();

        service.setUser(MockUserAllTrueClass);
        const value = service.isControllerMaintainer();

        expect(value).toEqual(MockUserAllTrueClass.controller_maintainer);
      });
    });

    describe('isOperator()', () => {
      it('should call isOperator()', () => {
        reset();

        service.setUser(MockUserAllTrueClass);
        service.isOperator();

        expect(service.isOperator).toHaveBeenCalled();
      });

      it('should call isOperator() and return operator bool value', () => {
        reset();

        service.setUser(MockUserAllTrueClass);
        const value = service.isOperator();

        expect(value).toEqual(MockUserAllTrueClass.operator);
      });
    });

    describe('isRealmAdmin()', () => {
      it('should call isRealmAdmin()', () => {
        reset();

        service.setUser(MockUserAllTrueClass);
        service.isRealmAdmin();

        expect(service.isRealmAdmin).toHaveBeenCalled();
      });

      it('should call isRealmAdmin() and return realm admin bool value', () => {
        reset();

        service.setUser(MockUserAllTrueClass);
        const value = service.isRealmAdmin();

        expect(value).toEqual(MockUserAllTrueClass.realm_admin);
      });
    });

    describe('CRUD getUserFromAPI()', () => {
      it('should call getUserFromAPI()', () => {
        reset();

        service.getUserFromAPI()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((r: UserClass) => {
            const objectKeys: string[] = Object.keys(r);
            objectKeys.forEach((key: string) => expect(r[key]).toEqual(MockUserAllTrueClass[key]));
            expect(service.getUserFromAPI).toHaveBeenCalled();
          });

        const xhrURL: string = environment.USER_SERVICE_CURRENT_USER;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockUserAllTrueInterface);

        after();
      });

      it('should call getUserFromAPI() and handle error', () => {
        reset();

        service.getUserFromAPI()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (r: UserClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.getUserFromAPI).toHaveBeenCalled();
            });

        const xhrURL: string = environment.USER_SERVICE_CURRENT_USER;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class UserServiceSpy implements UserServiceInterface {

  setUser = jasmine.createSpy('setUser').and.callFake(
    (user: UserClass): void => this.callFakeSetUser(user)
  );

  getUser = jasmine.createSpy('getUser').and.callFake(
    (): UserClass => this.callFakeGetUser()
  );

  isControllerAdmin = jasmine.createSpy('isControllerAdmin').and.callFake(
    (): boolean => this.callFakeIsControllerAdmin()
  );

  isControllerMaintainer = jasmine.createSpy('isControllerMaintainer').and.callFake(
    (): boolean => this.callFakeIsControllerMaintainer()
  );

  isOperator = jasmine.createSpy('isOperator').and.callFake(
    (): boolean => this.callFakeIsOperator()
  );

  isRealmAdmin = jasmine.createSpy('isRealmAdmin').and.callFake(
    (): boolean => this.callFakeIsRealmAdmin()
  );

  getUserFromAPI = jasmine.createSpy('getUserFromAPI').and.callFake(
    (): Observable<UserClass> => this.callFakeGetUserFromAPI()
  );

  private user_: UserClass = MockUserAllTrueClass;

  callFakeSetUser(user: UserClass): void {
    this.user_ = user;
  }

  callFakeGetUser(): UserClass {
    return this.user_;
  }

  callFakeIsControllerAdmin(): boolean {
    return this.user_.controller_admin;
  }

  callFakeIsControllerMaintainer(): boolean {
    return this.user_.controller_maintainer;
  }

  callFakeIsOperator(): boolean {
    return this.user_.operator;
  }

  callFakeIsRealmAdmin(): boolean {
    return this.user_.realm_admin;
  }

  callFakeGetUserFromAPI(): Observable<UserClass> {
    return observableOf(MockUserAllTrueClass);
  }
}
