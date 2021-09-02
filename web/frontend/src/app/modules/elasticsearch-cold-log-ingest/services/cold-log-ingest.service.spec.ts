import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
    MockFilebeatModuleClassApache,
    MockFilebeatModuleClassAuditd,
    MockFilebeatModuleClassWindowsEventLogs,
    MockGenericJobAndKeyClass,
    MockWinlogbeatConfigurationClass
} from '../../../../../static-data/class-objects';
import {
    MockFilebeatModuleInterfaceApache,
    MockGenericJobAndKeyInterface,
    MockWinlogbeatConfigurationInterface
} from '../../../../../static-data/interface-objects';
import { environment } from '../../../../environments/environment';
import { ErrorMessageClass, GenericJobAndKeyClass } from '../../../classes';
import { ApiService } from '../../../services/abstract/api.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { FilebeatModuleClass } from '../classes/filebeat-module.class';
import { WinlogbeatConfigurationClass } from '../classes/winlogbeat-configuration.class';
import { ColdLogIngestServiceInterface } from '../interfaces/services/cold-log-ingest-service.interface';
import { ColdLogIngestService } from './cold-log-ingest.service';

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

describe('ColdLogIngestService', () => {
  let service: ColdLogIngestService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyPostColdLogFile: jasmine.Spy<any>;
  let spyGetWinlogbeatConfiguration: jasmine.Spy<any>;
  let spyPostWinlogbeat: jasmine.Spy<any>;
  let spyGetModuleInfo: jasmine.Spy<any>;

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
  const mock_file: MockFile = {
    name: 'FakeFileName.zip',
    body: 'FakeFileBody',
    mimeType: 'application/zip'
  };
  const cold_log_file: File = create_file_from_mock_file(mock_file);
  const cold_log_form: FormGroup = new FormGroup({
    module: new FormControl(''),
    index_suffix: new FormControl('cold-log'),
    send_to_logstash: new FormControl(false),
    file_set: new FormControl('')
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        InjectorModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        ColdLogIngestService,
        ApiService
      ]
    });

    service = TestBed.inject(ColdLogIngestService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyPostColdLogFile = spyOn(service, 'post_cold_log_file').and.callThrough();
    spyGetWinlogbeatConfiguration = spyOn(service, 'get_winlogbeat_configuration').and.callThrough();
    spyPostWinlogbeat = spyOn(service, 'post_winlogbeat').and.callThrough();
    spyGetModuleInfo = spyOn(service, 'get_module_info').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyPostColdLogFile.calls.reset();
    spyGetWinlogbeatConfiguration.calls.reset();
    spyPostWinlogbeat.calls.reset();
    spyGetModuleInfo.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create ColdLogIngestService', () => {
    expect(service).toBeTruthy();
  });

  describe('ColdLogIngestService methods', () => {

    describe('REST post_cold_log_file()', () => {
      it('should call post_cold_log_file()', () => {
        reset();

        service.post_cold_log_file(cold_log_file, cold_log_form.value)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: GenericJobAndKeyClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => expect(response[key]).toEqual(MockGenericJobAndKeyClass[key]));
            expect(service.post_cold_log_file).toHaveBeenCalled();
          });

        const xhrURL: string = environment.COLD_LOG_INGEST_SERVICE_POST_COLD_LOG_FILE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockGenericJobAndKeyInterface);

        after();
      });

      it('should call post_cold_log_file() and handle error message error', () => {
        reset();

        service.post_cold_log_file(cold_log_file, cold_log_form.value)
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
              expect(service.post_cold_log_file).toHaveBeenCalled();
            });

        const xhrURL: string = environment.COLD_LOG_INGEST_SERVICE_POST_COLD_LOG_FILE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call post_cold_log_file() and handle error', () => {
        reset();

        service.post_cold_log_file(cold_log_file, cold_log_form.value)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: GenericJobAndKeyClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.post_cold_log_file).toHaveBeenCalled();
            });

        const xhrURL: string = environment.COLD_LOG_INGEST_SERVICE_POST_COLD_LOG_FILE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_winlogbeat_configuration()', () => {
      it('should call get_winlogbeat_configuration()', () => {
        reset();

        service.get_winlogbeat_configuration()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: WinlogbeatConfigurationClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => expect(response[key]).toEqual(MockWinlogbeatConfigurationClass[key]));
            expect(service.get_winlogbeat_configuration).toHaveBeenCalled();
          });

        const xhrURL: string = environment.COLD_LOG_INGEST_SERVICE_GET_WINLOGBEAT_CONFIGURATION;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockWinlogbeatConfigurationInterface);

        after();
      });

      it('should call get_winlogbeat_configuration() and handle error', () => {
        reset();

        service.get_winlogbeat_configuration()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: WinlogbeatConfigurationClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_winlogbeat_configuration).toHaveBeenCalled();
            });

        const xhrURL: string = environment.COLD_LOG_INGEST_SERVICE_GET_WINLOGBEAT_CONFIGURATION;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST post_winlogbeat()', () => {
      it('should call post_winlogbeat()', () => {
        reset();

        service.post_winlogbeat(MockWinlogbeatConfigurationClass)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: GenericJobAndKeyClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => expect(response[key]).toEqual(MockGenericJobAndKeyClass[key]));
            expect(service.post_winlogbeat).toHaveBeenCalled();
          });

        const xhrURL: string = environment.COLD_LOG_INGEST_SERVICE_POST_WINLOGBEAT;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockGenericJobAndKeyInterface);

        after();
      });

      it('should call post_winlogbeat() and handle error', () => {
        reset();

        service.post_winlogbeat(MockWinlogbeatConfigurationClass)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: GenericJobAndKeyClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.post_winlogbeat).toHaveBeenCalled();
            });

        const xhrURL: string = environment.COLD_LOG_INGEST_SERVICE_POST_WINLOGBEAT;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_module_info()', () => {
      it('should call get_module_info()', () => {
        reset();

        service.get_module_info()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: FilebeatModuleClass[]) => {
            if (response instanceof Array) {
              expect(response.length).toEqual(1);
            }

            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockFilebeatModuleClassApache[key]);
              }
            });
            expect(service.get_module_info).toHaveBeenCalled();
          });

        const xhrURL: string = environment.COLD_LOG_INGEST_SERVICE_GET_MODULE_INFO;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([MockFilebeatModuleInterfaceApache]);

        after();
      });

      it('should call get_module_info() and handle error', () => {
        reset();

        service.get_module_info()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: FilebeatModuleClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_module_info).toHaveBeenCalled();
            });

        const xhrURL: string = environment.COLD_LOG_INGEST_SERVICE_GET_MODULE_INFO;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class ColdLogIngestServiceSpy implements ColdLogIngestServiceInterface {

  post_cold_log_file = jasmine.createSpy('post_cold_log_file').and.callFake(
    (cold_log_file: File, cold_log_form: Object): Observable<GenericJobAndKeyClass> => this.call_fake_post_cold_log_file(cold_log_file, cold_log_form)
  );

  get_winlogbeat_configuration = jasmine.createSpy('get_winlogbeat_configuration').and.callFake(
    (): Observable<WinlogbeatConfigurationClass> => this.call_fake_get_winlogbeat_configuration()
  );

  post_winlogbeat = jasmine.createSpy('post_winlogbeat').and.callFake(
    (winlogbeat_setup_form: Object): Observable<GenericJobAndKeyClass> => this.call_fake_post_winlogbeat(winlogbeat_setup_form)
  );

  get_module_info = jasmine.createSpy('get_module_info').and.callFake(
    (): Observable<FilebeatModuleClass[]> => this.call_fake_get_module_info()
  );

  call_fake_post_cold_log_file(cold_log_file: File, cold_log_form: Object): Observable<GenericJobAndKeyClass> {
    return observableOf(MockGenericJobAndKeyClass);
  }

  call_fake_get_winlogbeat_configuration(): Observable<WinlogbeatConfigurationClass> {
    return observableOf(MockWinlogbeatConfigurationClass);
  }

  call_fake_post_winlogbeat(winlogbeat_setup_form: Object): Observable<GenericJobAndKeyClass> {
    return observableOf(MockGenericJobAndKeyClass);
  }

  call_fake_get_module_info(): Observable<FilebeatModuleClass[]> {
    return observableOf([
        MockFilebeatModuleClassApache,
        MockFilebeatModuleClassAuditd,
        MockFilebeatModuleClassWindowsEventLogs
    ]);
  }
}
