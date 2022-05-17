import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockIfaceStateClassArray } from '../../../static-data/class-objects';
import { MockIfaceStateInterfaceArray } from '../../../static-data/interface-objects';
import { MockSpaces } from '../../../static-data/return-data';
import { environment } from '../../environments/environment';
import { IFACEStateClass } from '../classes';
import { GlobalToolsServiceInterface } from '../interfaces';
import { InjectorModule } from '../modules/utilily-modules/injector.module';
import { ApiService } from './abstract/api.service';
import { GlobalToolsService } from './global-tools.service';

describe('GlobalToolsService', () => {
  let service: GlobalToolsService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetSpaces: jasmine.Spy<any>;
  let spyGetIFACEStates: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const getType: string = 'GET';

  // Test Data
  const test_hostname: string = 'test';
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
        GlobalToolsService,
        ApiService
      ]
    });

    service = TestBed.inject(GlobalToolsService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyGetSpaces = spyOn(service, 'get_spaces').and.callThrough();
    spyGetIFACEStates = spyOn(service, 'get_iface_states').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetSpaces.calls.reset();
    spyGetIFACEStates.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create GlobalToolsService', () => {
    expect(service).toBeTruthy();
  });

  describe('GlobalToolsService methods', () => {

    describe('REST get_spaces()', () => {
      it('should call get_spaces()', () => {
        reset();

        service.get_spaces()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: string[]) => {
            response.forEach((space: string, index: number) => {
              expect(space).toEqual(MockSpaces[index]);
            });

            expect(service.get_spaces).toHaveBeenCalled();
          });

        const xhrURL: string = environment.GLOBAL_TOOLS_SERVICE_GET_SPACES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockSpaces);

        after();
      });

      it('should call get_spaces() and handle error', () => {
        reset();

        service.get_spaces()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: string[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_spaces).toHaveBeenCalled();
            });

        const xhrURL: string = environment.GLOBAL_TOOLS_SERVICE_GET_SPACES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_iface_states()', () => {
      it('should call get_iface_states()', () => {
        reset();

        service.get_iface_states(test_hostname)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: IFACEStateClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockIfaceStateClassArray[0][key]);
              }
            });

            expect(service.get_iface_states).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.GLOBAL_TOOLS_SERVICE_GET_IFACE_STATES}${test_hostname}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockIfaceStateInterfaceArray);

        after();
      });

      it('should call get_iface_states() and handle error', () => {
        reset();

        service.get_iface_states(test_hostname)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: IFACEStateClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_iface_states).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.GLOBAL_TOOLS_SERVICE_GET_IFACE_STATES}${test_hostname}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class GlobalToolsServiceSpy implements GlobalToolsServiceInterface {

  get_spaces = jasmine.createSpy('get_spaces').and.callFake(
    (): Observable<string[]> => this.call_fake_get_spaces()
  );

  get_iface_states = jasmine.createSpy('get_iface_states').and.callFake(
    (hostname: string): Observable<IFACEStateClass[]> => this.call_fake_get_iface_states(hostname)
  );

  call_fake_get_spaces(): Observable<string[]> {
    return of(MockSpaces);
  }

  call_fake_get_iface_states(hostname: string): Observable<IFACEStateClass[]> {
    return of(MockIfaceStateClassArray);
  }
}
