import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  MockPortalLinkClass,
  MockPortalLinkFakeClass,
  MockUserPortalLinkClass,
  MockUserPortalLinkRemoveClass
} from '../../../static-data/class-objects';
import { MockPortalLinkInterface, MockUserPortalLinkInterface } from '../../../static-data/interface-objects';
import { environment } from '../../environments/environment';
import { PortalLinkClass, UserPortalLinkClass } from '../classes';
import { PortalServiceInterface } from '../interfaces';
import { InjectorModule } from '../modules/utilily-modules/injector.module';
import { ApiService } from './abstract/api.service';
import { PortalService } from './portal.service';

describe('PortalService', () => {
  let service: PortalService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetPortalLinks: jasmine.Spy<any>;
  let spyGetUserLinks: jasmine.Spy<any>;
  let spyAddUserLinks: jasmine.Spy<any>;
  let spyRemoveUserLinks: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const getType = 'GET';
  const postType = 'POST';
  const deleteType = 'DELETE';

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
        PortalService,
        ApiService
      ]
    });

    service = TestBed.inject(PortalService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyGetPortalLinks = spyOn(service, 'get_portal_links').and.callThrough();
    spyGetUserLinks = spyOn(service, 'get_user_links').and.callThrough();
    spyAddUserLinks = spyOn(service, 'add_user_link').and.callThrough();
    spyRemoveUserLinks = spyOn(service, 'remove_user_link').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetPortalLinks.calls.reset();
    spyGetUserLinks.calls.reset();
    spyAddUserLinks.calls.reset();
    spyRemoveUserLinks.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create PortalService', () => {
    expect(service).toBeTruthy();
  });

  describe('PortalService methods', () => {

    describe('REST get_portal_links()', () => {
      it('should call get_portal_links()', () => {
        reset();

        service.get_portal_links()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: PortalLinkClass[]) => {
            expect(response.length).toEqual(1);

            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => expect(response[0][key]).toEqual(MockPortalLinkClass[key]));
            expect(service.get_portal_links).toHaveBeenCalled();
          });

        const xhrURL: string = environment.PORTAL_SERVICE_GET_PORTAL_LINKS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([MockPortalLinkInterface]);

        after();
      });

      it('should call get_portal_links() and handle error', () => {
        reset();

        service.get_portal_links()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: PortalLinkClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_portal_links).toHaveBeenCalled();
            });

        const xhrURL: string = environment.PORTAL_SERVICE_GET_PORTAL_LINKS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_user_links()', () => {
      it('should call get_user_links()', () => {
        reset();

        service.get_user_links()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: UserPortalLinkClass[]) => {
            expect(response.length).toEqual(1);

            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => expect(response[0][key]).toEqual(MockUserPortalLinkClass[key]));
            expect(service.get_user_links).toHaveBeenCalled();
          });

        const xhrURL: string = environment.PORTAL_SERVICE_GET_USER_LINKS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([MockUserPortalLinkInterface]);

        after();
      });

      it('should call get_user_links() and handle error', () => {
        reset();

        service.get_user_links()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: UserPortalLinkClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_user_links).toHaveBeenCalled();
            });

        const xhrURL: string = environment.PORTAL_SERVICE_GET_USER_LINKS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST add_user_link()', () => {
      it('should call add_user_link()', () => {
        reset();

        service.add_user_link(MockUserPortalLinkClass)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: UserPortalLinkClass[]) => {
            expect(response.length).toEqual(1);

            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => expect(response[0][key]).toEqual(MockUserPortalLinkClass[key]));
            expect(service.add_user_link).toHaveBeenCalled();
          });

        const xhrURL: string = environment.PORTAL_SERVICE_ADD_USER_LINK;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush([MockUserPortalLinkInterface]);

        after();
      });

      it('should call add_user_link() and handle error', () => {
        reset();

        service.add_user_link(MockUserPortalLinkClass)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: UserPortalLinkClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.add_user_link).toHaveBeenCalled();
            });

        const xhrURL: string = environment.PORTAL_SERVICE_ADD_USER_LINK;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST remove_user_link()', () => {
      it('should call remove_user_link()', () => {
        reset();

        service.remove_user_link(MockUserPortalLinkRemoveClass)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: UserPortalLinkClass[]) => {
            expect(response.length).toEqual(1);
            expect(service.remove_user_link).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.PORTAL_SERVICE_REMOVE_USER_LINK}${MockUserPortalLinkClass._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(deleteType);

        xhrRequest.flush([MockUserPortalLinkClass]);

        after();
      });

      it('should call remove_user_link() and handle error', () => {
        reset();

        service.remove_user_link(MockUserPortalLinkClass)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: UserPortalLinkClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.remove_user_link).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.PORTAL_SERVICE_REMOVE_USER_LINK}${MockUserPortalLinkClass._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class PortalServiceSpy implements PortalServiceInterface {

  get_portal_links = jasmine.createSpy('get_portal_links').and.callFake(
    (): Observable<PortalLinkClass[]> => this.call_fake_get_portal_links()
  );

  get_user_links = jasmine.createSpy('get_user_links').and.callFake(
    (): Observable<UserPortalLinkClass[]> => this.call_fake_get_user_links()
  );

  add_user_link = jasmine.createSpy('add_user_link').and.callFake(
    (user_portal_link: UserPortalLinkClass): Observable<UserPortalLinkClass[]> => this.call_fake_add_user_link(user_portal_link)
  );

  remove_user_link = jasmine.createSpy('remove_user_link').and.callFake(
    (user_portal_link: UserPortalLinkClass): Observable<UserPortalLinkClass[]> => this.call_fake_remove_user_link(user_portal_link)
  );

  private user_portal_links_: UserPortalLinkClass[] = [MockUserPortalLinkClass];

  call_fake_get_portal_links(): Observable<PortalLinkClass[]> {
    return observableOf([MockPortalLinkClass]);
  }

  call_fake_get_user_links(): Observable<UserPortalLinkClass[]> {
    return observableOf(this.user_portal_links_);
  }

  call_fake_add_user_link(user_portal_link: UserPortalLinkClass): Observable<UserPortalLinkClass[]> {
    user_portal_link._id = (Math.floor(Math.random() * (100 - 1 + 1) + 1)).toString();
    this.user_portal_links_.push(user_portal_link);

    return observableOf(this.user_portal_links_);
  }

  call_fake_remove_user_link(user_portal_link: UserPortalLinkClass): Observable<UserPortalLinkClass[]> {
    this.user_portal_links_ = this.user_portal_links_.filter((upl: UserPortalLinkClass) => upl._id !== user_portal_link._id);

    return observableOf(this.user_portal_links_);
  }
}
