import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockPCAPClassArray } from '../../../static-data/class-objects';
import { MockPCAPInterfaceArray } from '../../../static-data/interface-objects';
import { environment } from '../../environments/environment';
import { PCAPClass } from '../classes';
import { GlobalPCAPServiceInterface } from '../interfaces';
import { InjectorModule } from '../modules/utilily-modules/injector.module';
import { ApiService } from './abstract/api.service';
import { GlobalPCAPService } from './global-pcap.service';

describe('GlobalPCAPService', () => {
  let service: GlobalPCAPService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetPCAPS: jasmine.Spy<any>;

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
        GlobalPCAPService,
        ApiService
      ]
    });

    service = TestBed.inject(GlobalPCAPService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyGetPCAPS = spyOn(service, 'get_pcaps').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetPCAPS.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create GlobalPCAPService', () => {
    expect(service).toBeTruthy();
  });

  describe('GlobalPCAPService methods', () => {

    describe('REST get_pcaps()', () => {
      it('should call get_pcaps()', () => {
        reset();

        service.get_pcaps()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: PCAPClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockPCAPClassArray[0][key]);
              }
            });

            expect(service.get_pcaps).toHaveBeenCalled();
          });

        const xhrURL: string = environment.GLOBAL_PCAP_SERVICE_GET_PCAPS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockPCAPInterfaceArray);

        after();
      });

      it('should call get_pcaps() and handle error', () => {
        reset();

        service.get_pcaps()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: PCAPClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_pcaps).toHaveBeenCalled();
            });

        const xhrURL: string = environment.GLOBAL_PCAP_SERVICE_GET_PCAPS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class GlobalPCAPServiceSpy implements GlobalPCAPServiceInterface {

  get_pcaps = jasmine.createSpy('get_pcaps').and.callFake(
    (): Observable<PCAPClass[]> => this.call_fake_get_pcaps()
  );

  call_fake_get_pcaps(): Observable<PCAPClass[]> {
    return of(MockPCAPClassArray);
  }
}
