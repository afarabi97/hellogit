import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockIndexManagementOptionInterfaceCloseIndices } from '../../../../../static-data/interface-objects';
import { MockClosedIndices, MockIndexManagement, MockOpenedIndices } from '../../../../../static-data/return-data';
import { environment } from '../../../../environments/environment';
import { ErrorMessageClass } from '../../../classes';
import { ApiService } from '../../../services/abstract/api.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { IndexManagementOptionInterface } from '../interfaces/index-management-option.interface';
import { IndexManagementServiceInterface } from '../interfaces/services/index-management-service.interface';
import { IndexManagementService } from './index-management.service';

describe('IndexManagementService', () => {
  let service: IndexManagementService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyIndexManagement: jasmine.Spy<any>;
  let spyGetClosedIndices: jasmine.Spy<any>;
  let spyGetOpenedIndices: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const getType = 'GET';
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
        IndexManagementService,
        ApiService
      ]
    });

    service = TestBed.inject(IndexManagementService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyIndexManagement = spyOn(service, 'index_management').and.callThrough();
    spyGetClosedIndices = spyOn(service, 'get_closed_indices').and.callThrough();
    spyGetOpenedIndices = spyOn(service, 'get_opened_indices').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyIndexManagement.calls.reset();
    spyGetClosedIndices.calls.reset();
    spyGetOpenedIndices.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create IndexManagementService', () => {
    expect(service).toBeTruthy();
  });

  describe('IndexManagementService methods', () => {

    describe('REST index_management()', () => {
      it('should call index_management()', () => {
        reset();

        service.index_management(MockIndexManagementOptionInterfaceCloseIndices)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: string) => {
            expect(response).toEqual(MockIndexManagement);
            expect(service.index_management).toHaveBeenCalled();
          });

        const xhrURL: string = environment.INDEX_MANAGEMENT_SERVICE_INDEX_MANAGEMENT;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockIndexManagement);

        after();
      });

      it('should call index_management() and handle error', () => {
        reset();

        service.index_management(MockIndexManagementOptionInterfaceCloseIndices)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: string) => {},
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
              expect(service.index_management).toHaveBeenCalled();
            });

        const xhrURL: string = environment.INDEX_MANAGEMENT_SERVICE_INDEX_MANAGEMENT;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_closed_indices()', () => {
      it('should call get_closed_indices()', () => {
        reset();

        service.get_closed_indices()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: string[]) => {
            response.forEach((v: string, i: number) => expect(v).toEqual(MockClosedIndices[i]));
            expect(service.get_closed_indices).toHaveBeenCalled();
          });

        const xhrURL: string = environment.INDEX_MANAGEMENT_SERVICE_GET_CLOSED_INDICES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockClosedIndices);

        after();
      });

      it('should call get_closed_indices() and handle error', () => {
        reset();

        service.get_closed_indices()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: string[]) => {},
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
              expect(service.get_closed_indices).toHaveBeenCalled();
            });

        const xhrURL: string = environment.INDEX_MANAGEMENT_SERVICE_GET_CLOSED_INDICES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_opened_indices()', () => {
      it('should call get_opened_indices()', () => {
        reset();

        service.get_opened_indices()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: string[]) => {
            response.forEach((v: string, i: number) => expect(v).toEqual(MockOpenedIndices[i]));
            expect(service.get_opened_indices).toHaveBeenCalled();
          });

        const xhrURL: string = environment.INDEX_MANAGEMENT_SERVICE_GET_OPENED_INDICES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockOpenedIndices);

        after();
      });

      it('should call get_opened_indices() and handle error', () => {
        reset();

        service.get_opened_indices()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: string[]) => {},
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
              expect(service.get_opened_indices).toHaveBeenCalled();
            });

        const xhrURL: string = environment.INDEX_MANAGEMENT_SERVICE_GET_OPENED_INDICES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class IndexManagementServiceSpy implements IndexManagementServiceInterface {

  index_management = jasmine.createSpy('index_management').and.callFake(
    (index_management_option: IndexManagementOptionInterface): Observable<string> => this.call_fake_index_management(index_management_option)
  );

  get_closed_indices = jasmine.createSpy('get_closed_indices').and.callFake(
    (): Observable<string[]> => this.call_fake_get_closed_indices()
  );

  get_opened_indices = jasmine.createSpy('get_opened_indices').and.callFake(
    (): Observable<string[]> => this.call_fake_get_opened_indices()
  );

  call_fake_index_management(index_management_option: IndexManagementOptionInterface): Observable<string> {
    return observableOf(MockIndexManagement);
  }

  call_fake_get_closed_indices(): Observable<string[]> {
    return observableOf(MockClosedIndices);
  }

  call_fake_get_opened_indices(): Observable<string[]> {
    return observableOf(MockOpenedIndices);
  }
}
