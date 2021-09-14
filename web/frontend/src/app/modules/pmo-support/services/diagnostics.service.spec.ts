import { HttpErrorResponse, HttpEvent, HttpEventType, HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockGenericJobAndKeyClass } from '../../../../../static-data/class-objects';
import { MockGenericJobAndKeyInterface } from '../../../../../static-data/interface-objects';
import { environment } from '../../../../environments/environment';
import { GenericJobAndKeyClass } from '../../../classes';
import { ApiService } from '../../../services/abstract/api.service';
import { MatSnackBarService } from '../../../services/mat-snackbar.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { DiagnosticsServiceInterface } from '../interfaces';
import { DiagnosticsService } from './diagnostics.service';

interface MockFile {
  name: string;
  body: string;
  mimeType: string;
}

const create_mock_blob = (file: MockFile): Blob => {
  const blob = new Blob([file.body], { type: file.mimeType }) as any;
  blob['lastModifiedDate'] = new Date();
  blob['name'] = file.name;

  return blob;
};

describe('DiagnosticsService', () => {
  let service: DiagnosticsService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyDiagnostics: jasmine.Spy<any>;
  let spyDownloadDiagnostics: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const getType = 'GET';
  const postType = 'POST';

  // Test Data
  const errorRequest = 'Servers are not working as expected. The request is probably valid but needs to be requested again later.';
  const mockErrorResponse = { status: 500, statusText: 'Internal Server Error' };
  const mock_file: MockFile = {
    name: 'FakeFileName.zip',
    body: 'FakeFileBody',
    mimeType: 'application/zip'
  };
  const mock_blob: Blob = create_mock_blob(mock_file);
  const mock_http_event_type_response: HttpResponse<any> = new HttpResponse({ body: mock_blob });
  const job_id: string = '1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        InjectorModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        DiagnosticsService,
        MatSnackBarService,
        ApiService
      ]
    });

    service = TestBed.inject(DiagnosticsService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyDiagnostics = spyOn(service, 'diagnostics').and.callThrough();
    spyDownloadDiagnostics = spyOn(service, 'download_diagnostics').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyDiagnostics.calls.reset();
    spyDownloadDiagnostics.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create DiagnosticsService', () => {
    expect(service).toBeTruthy();
  });

  describe('DiagnosticsService methods', () => {

    describe('REST diagnostics()', () => {
      it('should call diagnostics()', () => {
        reset();

        service.diagnostics()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: GenericJobAndKeyClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => expect(response[key]).toEqual(MockGenericJobAndKeyClass[key]));
            expect(service.diagnostics).toHaveBeenCalled();
          });

        const xhrURL: string = environment.DIAGNOSTICS_SERVICE_DIAGNOSTICS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockGenericJobAndKeyInterface);

        after();
      });

      it('should call diagnostics() and handle error', () => {
        reset();

        service.diagnostics()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: GenericJobAndKeyClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.diagnostics).toHaveBeenCalled();
            });

        const xhrURL: string = environment.DIAGNOSTICS_SERVICE_DIAGNOSTICS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST download_diagnostics()', () => {
      it('should call download_diagnostics()', () => {
        reset();

        service.download_diagnostics(job_id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: HttpEvent<Blob>) => {
            expect(response).toBeDefined();
            expect(service.download_diagnostics).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.DIAGNOSTICS_SERVICE_DIAGNOSTICS_DOWNLOAD}${job_id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.event(mock_http_event_type_response);

        after();
      });

      it('should call download_diagnostics() and handle error', () => {
        reset();

        const new_blob = new Blob([errorRequest], { type: 'application/json' });

        service.download_diagnostics(job_id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: HttpEvent<Blob>) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toBeDefined();
              expect(service.download_diagnostics).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.DIAGNOSTICS_SERVICE_DIAGNOSTICS_DOWNLOAD}${job_id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(new_blob, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class DiagnosticsServiceSpy implements DiagnosticsServiceInterface {

  diagnostics = jasmine.createSpy('diagnostics').and.callFake(
    (): Observable<GenericJobAndKeyClass> => this.call_fake_diagnostics()
  );

  download_diagnostics = jasmine.createSpy('download_diagnostics').and.callFake(
    (job_id: string): Observable<HttpEvent<Blob>> => this.call_fake_download_diagnostics(job_id)
  );

  call_fake_diagnostics(): Observable<GenericJobAndKeyClass> {
    return observableOf(MockGenericJobAndKeyClass);
  }

  call_fake_download_diagnostics(job_id: string): Observable<HttpEvent<Blob>> {
    return of({ type: HttpEventType.DownloadProgress, loaded: 7, total: 10 } as HttpProgressEvent);
  }
}
