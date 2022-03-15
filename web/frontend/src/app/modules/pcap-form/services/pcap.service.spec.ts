import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockGenericJobAndKeyClass, MockSuccessMessageClass } from '../../../../../static-data/class-objects';
import {
  MockGenericJobAndKeyInterface,
  MockReplayPCAPInterface,
  MockSuccessMessageInterface,
} from '../../../../../static-data/interface-objects';
import { environment } from '../../../../environments/environment';
import { ErrorMessageClass, GenericJobAndKeyClass, SuccessMessageClass } from '../../../classes';
import { ApiService } from '../../../services/abstract/api.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { ReplayPCAPInterface } from '../interfaces/replay-pcap.interface';
import { PCAPServiceInterface } from '../interfaces/service-interfaces/pcap-service.interface';
import { PCAPService } from './pcap.service';

interface MockFile {
  name: string;
  body: string;
  mimeType: string;
}

const create_file_from_mock_file = (file: MockFile): File => {
  const blob = new Blob([file.body], { type: file.mimeType }) as any;
  blob['lastModifiedDate'] = new Date();
  blob['name'] = file.name;

  return blob as File;
};

describe('PCAPService', () => {
  let service: PCAPService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyUploadPCAP: jasmine.Spy<any>;
  let spyReplayPCAP: jasmine.Spy<any>;
  let spyDeletePCAP: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const deleteType = 'DELETE';
  const postType = 'POST';

  // Test Data
  const errorRequest = 'Servers are not working as expected. The request is probably valid but needs to be requested again later.';
  const errorMessageRequest = {
    error_message: 'Servers are not working as expected. The request is probably valid but needs to be requested again later.'
  };
  const mockErrorResponse = { status: 500, statusText: 'Internal Server Error' };
  const pcap_name: string = 'zeek_it_intel.pcap';
  const mock_file: MockFile = {
    name: pcap_name,
    body: 'FakeFileBody',
    mimeType: 'application/zip'
  };
  const cold_log_file: File = create_file_from_mock_file(mock_file);
  const pcap_form_data: FormData = new FormData();
  pcap_form_data.append('upload_file', cold_log_file, cold_log_file.name);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        InjectorModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        PCAPService,
        ApiService
      ]
    });

    service = TestBed.inject(PCAPService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyUploadPCAP = spyOn(service, 'upload_pcap').and.callThrough();
    spyReplayPCAP = spyOn(service, 'replay_pcap').and.callThrough();
    spyDeletePCAP = spyOn(service, 'delete_pcap').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyUploadPCAP.calls.reset();
    spyReplayPCAP.calls.reset();
    spyDeletePCAP.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create PCAPService', () => {
    expect(service).toBeTruthy();
  });

  describe('PCAPService methods', () => {

    describe('REST upload_pcap()', () => {
      it('should call upload_pcap()', () => {
        reset();

        service.upload_pcap(pcap_form_data)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: SuccessMessageClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockSuccessMessageClass[key]);
              }
            });

            expect(service.upload_pcap).toHaveBeenCalled();
          });

        const xhrURL: string = environment.PCAP_SERVICE_UPLOAD_PCAP;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockSuccessMessageInterface);

        after();
      });

      it('should call upload_pcap() and handle error message error', () => {
        reset();

        service.upload_pcap(pcap_form_data)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
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

              expect(service.upload_pcap).toHaveBeenCalled();
            });

        const xhrURL: string = environment.PCAP_SERVICE_UPLOAD_PCAP;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call upload_pcap() and handle error', () => {
        reset();

        service.upload_pcap(pcap_form_data)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.upload_pcap).toHaveBeenCalled();
            });

        const xhrURL: string = environment.PCAP_SERVICE_UPLOAD_PCAP;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST replay_pcap()', () => {
      it('should call replay_pcap()', () => {
        reset();

        service.replay_pcap(MockReplayPCAPInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: GenericJobAndKeyClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockGenericJobAndKeyClass[key]);
              }
            });

            expect(service.replay_pcap).toHaveBeenCalled();
          });

        const xhrURL: string = environment.PCAP_SERVICE_REPLAY_PCAP;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockGenericJobAndKeyInterface);

        after();
      });

      it('should call replay_pcap() and handle error message error', () => {
        reset();

        service.replay_pcap(MockReplayPCAPInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: GenericJobAndKeyClass) => {},
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

              expect(service.replay_pcap).toHaveBeenCalled();
            });

        const xhrURL: string = environment.PCAP_SERVICE_REPLAY_PCAP;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call replay_pcap() and handle error', () => {
        reset();

        service.replay_pcap(MockReplayPCAPInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: GenericJobAndKeyClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.replay_pcap).toHaveBeenCalled();
            });

        const xhrURL: string = environment.PCAP_SERVICE_REPLAY_PCAP;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST delete_pcap()', () => {
      it('should call delete_pcap()', () => {
        reset();

        service.delete_pcap(pcap_name)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: SuccessMessageClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockSuccessMessageClass[key]);
              }
            });

            expect(service.delete_pcap).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.PCAP_SERVICE_BASE}${pcap_name}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(deleteType);

        xhrRequest.flush(MockSuccessMessageInterface);

        after();
      });

      it('should call delete_pcap() and handle error message error', () => {
        reset();

        service.delete_pcap(pcap_name)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
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

              expect(service.delete_pcap).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.PCAP_SERVICE_BASE}${pcap_name}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call delete_pcap() and handle error', () => {
        reset();

        service.delete_pcap(pcap_name)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.delete_pcap).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.PCAP_SERVICE_BASE}${pcap_name}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class PCAPServiceSpy implements PCAPServiceInterface {

  upload_pcap = jasmine.createSpy('upload_pcap').and.callFake(
    (pcap_form_data: FormData): Observable<SuccessMessageClass> => this.call_fake_upload_pcap(pcap_form_data)
  );

  replay_pcap = jasmine.createSpy('replay_pcap').and.callFake(
    (replay_pcap: ReplayPCAPInterface): Observable<GenericJobAndKeyClass> => this.call_fake_replay_pcap(replay_pcap)
  );

  delete_pcap = jasmine.createSpy('delete_pcap').and.callFake(
    (pcap_name: string): Observable<SuccessMessageClass> => this.call_fake_delete_pcap(pcap_name)
  );

  call_fake_upload_pcap(pcap_form_data: FormData): Observable<SuccessMessageClass> {
    return of(MockSuccessMessageClass);
  }

  call_fake_replay_pcap(replay_pcap: ReplayPCAPInterface): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }

  call_fake_delete_pcap(pcap_name: string): Observable<SuccessMessageClass> {
    return of(MockSuccessMessageClass);
  }
}
