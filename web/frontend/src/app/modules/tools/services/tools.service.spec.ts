import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  MockElasticLicenseClass,
  MockGenericJobAndKeyClass,
  MockInitialDeviceStateClassArray,
  MockNetworkDeviceStateClassUp,
  MockSuccessMessageClass
} from '../../../../../static-data/class-objects';
import {
  MockElasticLicenseInterface,
  MockGenericJobAndKeyInterface,
  MockInitialDeviceStateInterfaceArray,
  MockNetworkDeviceStateInterfaceUp,
  MockRepoSettingsSnapshotInterface,
  MockSuccessMessageInterface
} from '../../../../../static-data/interface-objects';
import * as mock_elastic_license from '../../../../../static-data/json/elastic_license_for_test.json';
import { environment } from '../../../../environments/environment';
import { ErrorMessageClass, GenericJobAndKeyClass, SuccessMessageClass } from '../../../classes';
import { ApiService } from '../../../services/abstract/api.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { ElasticLicenseClass } from '../classes/elastic-license.class';
import { InitialDeviceStateClass } from '../classes/initial-device-state.class';
import { NetworkDeviceStateClass } from '../classes/network-device-state.class';
import { KitPasswordInterface } from '../interfaces/kit-password.interface';
import { RepoSettingsSnapshotInterface } from '../interfaces/repo-settings-snapshot.interface';
import { ToolsServiceInterface } from '../interfaces/service-interfaces/tools-service.interface';
import { ToolsService } from './tools.service';

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

describe('ToolsService', () => {
  let service: ToolsService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyChangeKitPassword: jasmine.Spy<any>;
  let spyChangeRemoteNetworkDeviceState: jasmine.Spy<any>;
  let spyGetInitialDeviceStates: jasmine.Spy<any>;
  let spyRepoSettingsSnapshot: jasmine.Spy<any>;
  let spyUploadDocumentation: jasmine.Spy<any>;
  let spyGetElasticLicense: jasmine.Spy<any>;
  let spyUploadElasticLicense: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const getType: string = 'GET';
  const putType: string = 'PUT';
  const postType: string = 'POST';

  // Test Data
  const kit_password: KitPasswordInterface = {
    root_password: 'testPa55word'
  };
  const hostname: string = MockNetworkDeviceStateClassUp.node;
  const device: string = MockNetworkDeviceStateClassUp.device;
  const state: string = MockNetworkDeviceStateClassUp.state;
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
  const form_data = new FormData();
  form_data.append('upload_file', create_file_from_mock_file(mock_file), mock_file.name);
  form_data.append('space_name', JSON.stringify('fake_space'));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        InjectorModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        ToolsService,
        ApiService
      ]
    });

    service = TestBed.inject(ToolsService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyChangeKitPassword = spyOn(service, 'change_kit_password').and.callThrough();
    spyChangeRemoteNetworkDeviceState = spyOn(service, 'change_remote_network_device_state').and.callThrough();
    spyGetInitialDeviceStates = spyOn(service, 'get_initial_device_states').and.callThrough();
    spyRepoSettingsSnapshot = spyOn(service, 'repo_settings_snapshot').and.callThrough();
    spyUploadDocumentation = spyOn(service, 'upload_documentation').and.callThrough();
    spyGetElasticLicense = spyOn(service, 'get_elastic_license').and.callThrough();
    spyUploadElasticLicense = spyOn(service, 'upload_elastic_license').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyChangeKitPassword.calls.reset();
    spyChangeRemoteNetworkDeviceState.calls.reset();
    spyGetInitialDeviceStates.calls.reset();
    spyRepoSettingsSnapshot.calls.reset();
    spyUploadDocumentation.calls.reset();
    spyGetElasticLicense.calls.reset();
    spyUploadElasticLicense.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create ToolsService', () => {
    expect(service).toBeTruthy();
  });

  describe('ToolsService methods', () => {

    describe('REST change_kit_password()', () => {
      it('should call change_kit_password()', () => {
        reset();

        service.change_kit_password(kit_password)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: SuccessMessageClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockSuccessMessageClass[key]);
              }
            });

            expect(service.change_kit_password).toHaveBeenCalled();
          });

        const xhrURL: string = environment.TOOLS_SERVICE_CHANGE_KIT_PASSWORD;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockSuccessMessageInterface);

        after();
      });

      it('should call change_kit_password() and handle error message error', () => {
        reset();

        service.change_kit_password(kit_password)
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
              expect(service.change_kit_password).toHaveBeenCalled();
            });

        const xhrURL: string = environment.TOOLS_SERVICE_CHANGE_KIT_PASSWORD;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call change_kit_password() and handle error', () => {
        reset();

        service.change_kit_password(kit_password)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.change_kit_password).toHaveBeenCalled();
            });

        const xhrURL: string = environment.TOOLS_SERVICE_CHANGE_KIT_PASSWORD;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST change_remote_network_device_state()', () => {
      it('should call change_remote_network_device_state()', () => {
        reset();

        service.change_remote_network_device_state(hostname, device, state)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: NetworkDeviceStateClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockNetworkDeviceStateClassUp[key]);
              }
            });

            expect(service.change_remote_network_device_state).toHaveBeenCalled();
          });

        const xhrURL: string = `/api/${hostname}/set-interface-state/${device}/${state}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(putType);

        xhrRequest.flush(MockNetworkDeviceStateInterfaceUp);

        after();
      });

      it('should call change_remote_network_device_state() and handle error message error', () => {
        reset();

        service.change_remote_network_device_state(hostname, device, state)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: NetworkDeviceStateClass) => {},
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
              expect(service.change_remote_network_device_state).toHaveBeenCalled();
            });

            const xhrURL: string = `/api/${hostname}/set-interface-state/${device}/${state}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call change_remote_network_device_state() and handle error', () => {
        reset();

        service.change_remote_network_device_state(hostname, device, state)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: NetworkDeviceStateClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.change_remote_network_device_state).toHaveBeenCalled();
            });

        const xhrURL: string = `/api/${hostname}/set-interface-state/${device}/${state}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_initial_device_states()', () => {
      it('should call get_initial_device_states()', () => {
        reset();

        service.get_initial_device_states()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: InitialDeviceStateClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockInitialDeviceStateClassArray[0][key]);
              }
            });

            expect(service.get_initial_device_states).toHaveBeenCalled();
          });

        const xhrURL: string = environment.TOOLS_SERVICE_MONITORING_INTERFACE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockInitialDeviceStateInterfaceArray);

        after();
      });

      it('should call get_initial_device_states() and handle error', () => {
        reset();

        service.get_initial_device_states()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: InitialDeviceStateClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_initial_device_states).toHaveBeenCalled();
            });

        const xhrURL: string = environment.TOOLS_SERVICE_MONITORING_INTERFACE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST repo_settings_snapshot()', () => {
      it('should call repo_settings_snapshot()', () => {
        reset();

        service.repo_settings_snapshot(MockRepoSettingsSnapshotInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: GenericJobAndKeyClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockGenericJobAndKeyClass[key]);
              }
            });

            expect(service.repo_settings_snapshot).toHaveBeenCalled();
          });

        const xhrURL: string = environment.TOOLS_SERVICE_REPO_SETTINGS_SNAPSHOT;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockGenericJobAndKeyInterface);

        after();
      });

      it('should call repo_settings_snapshot() and handle error message error', () => {
        reset();

        service.repo_settings_snapshot(MockRepoSettingsSnapshotInterface)
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

              expect(service.repo_settings_snapshot).toHaveBeenCalled();
            });

        const xhrURL: string = environment.TOOLS_SERVICE_REPO_SETTINGS_SNAPSHOT;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call repo_settings_snapshot() and handle error', () => {
        reset();

        service.repo_settings_snapshot(MockRepoSettingsSnapshotInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: GenericJobAndKeyClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.repo_settings_snapshot).toHaveBeenCalled();
            });

        const xhrURL: string = environment.TOOLS_SERVICE_REPO_SETTINGS_SNAPSHOT;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST upload_documentation()', () => {
      it('should call upload_documentation()', () => {
        reset();

        service.upload_documentation(form_data)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: SuccessMessageClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockSuccessMessageClass[key]);
              }
            });

            expect(service.upload_documentation).toHaveBeenCalled();
          });

        const xhrURL: string = environment.TOOLS_SERVICE_UPLOAD_DOCUMENTATION;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockSuccessMessageInterface);

        after();
      });

      it('should call upload_documentation() and handle error message error', () => {
        reset();

        service.upload_documentation(form_data)
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
              expect(service.upload_documentation).toHaveBeenCalled();
            });

        const xhrURL: string = environment.TOOLS_SERVICE_UPLOAD_DOCUMENTATION;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call upload_documentation() and handle error', () => {
        reset();

        service.upload_documentation(form_data)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.upload_documentation).toHaveBeenCalled();
            });

        const xhrURL: string = environment.TOOLS_SERVICE_UPLOAD_DOCUMENTATION;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_elastic_license()', () => {
      it('should call get_elastic_license()', () => {
        reset();

        service.get_elastic_license()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: ElasticLicenseClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockElasticLicenseClass[key]);
              }
            });

            expect(service.get_elastic_license).toHaveBeenCalled();
          });

        const xhrURL: string = environment.TOOLS_SERVICE_ES_LICENSE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockElasticLicenseInterface);

        after();
      });

      it('should call get_elastic_license() and handle error message error', () => {
        reset();

        service.get_elastic_license()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: ElasticLicenseClass) => {},
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
              expect(service.get_elastic_license).toHaveBeenCalled();
            });

        const xhrURL: string = environment.TOOLS_SERVICE_ES_LICENSE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call get_elastic_license() and handle error', () => {
        reset();

        service.get_elastic_license()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: ElasticLicenseClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_elastic_license).toHaveBeenCalled();
            });

        const xhrURL: string = environment.TOOLS_SERVICE_ES_LICENSE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST upload_elastic_license()', () => {
      it('should call upload_elastic_license()', () => {
        reset();

        service.upload_elastic_license(mock_elastic_license)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: SuccessMessageClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockSuccessMessageClass[key]);
              }
            });

            expect(service.upload_elastic_license).toHaveBeenCalled();
          });

        const xhrURL: string = environment.TOOLS_SERVICE_ES_LICENSE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(putType);

        xhrRequest.flush(MockSuccessMessageInterface);

        after();
      });

      it('should call upload_elastic_license() and handle error message error', () => {
        reset();

        service.upload_elastic_license(mock_elastic_license)
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
              expect(service.upload_elastic_license).toHaveBeenCalled();
            });

        const xhrURL: string = environment.TOOLS_SERVICE_ES_LICENSE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call upload_elastic_license() and handle error', () => {
        reset();

        service.upload_elastic_license(mock_elastic_license)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.upload_elastic_license).toHaveBeenCalled();
            });

        const xhrURL: string = environment.TOOLS_SERVICE_ES_LICENSE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

  });
});

@Injectable()
export class ToolsServiceSpy implements ToolsServiceInterface {

  change_kit_password = jasmine.createSpy('change_kit_password').and.callFake(
    (kit_password: KitPasswordInterface): Observable<SuccessMessageClass> => this.call_fake_change_kit_password(kit_password)
  );

  change_remote_network_device_state = jasmine.createSpy('change_remote_network_device_state').and.callFake(
    (hostname: string, device: string, state: string): Observable<NetworkDeviceStateClass> => this.call_fake_change_remote_network_device_state(hostname, device, state)
  );

  get_initial_device_states = jasmine.createSpy('get_initial_device_states').and.callFake(
    (): Observable<InitialDeviceStateClass[]> => this.call_fake_get_initial_device_states()
  );

  repo_settings_snapshot = jasmine.createSpy('repo_settings_snapshot').and.callFake(
    (repo_settings_snapshot: RepoSettingsSnapshotInterface): Observable<GenericJobAndKeyClass> => this.call_fake_repo_settings_snapshot(repo_settings_snapshot)
  );

  upload_documentation = jasmine.createSpy('upload_documentation').and.callFake(
    (form_data: FormData): Observable<SuccessMessageClass> => this.call_fake_upload_documentation(form_data)
  );

  get_elastic_license = jasmine.createSpy('get_elastic_license').and.callFake(
    (): Observable<ElasticLicenseClass> => this.call_fake_get_elastic_license()
  );

  upload_elastic_license = jasmine.createSpy('upload_elastic_license').and.callFake(
    (license_data: Object): Observable<SuccessMessageClass> => this.call_fake_upload_elastic_license()
  );

  call_fake_change_kit_password(kit_password: KitPasswordInterface): Observable<SuccessMessageClass> {
    return of(MockSuccessMessageClass);
  }

  call_fake_change_remote_network_device_state(hostname: string, device: string, state: string): Observable<NetworkDeviceStateClass> {
    return of(MockNetworkDeviceStateClassUp);
  }

  call_fake_get_initial_device_states(): Observable<InitialDeviceStateClass[]> {
    return of(MockInitialDeviceStateClassArray);
  }

  call_fake_repo_settings_snapshot(repo_settings_snapshot: RepoSettingsSnapshotInterface): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }

  call_fake_upload_documentation(form_data: FormData): Observable<SuccessMessageClass> {
    return of(MockSuccessMessageClass);
  }

  call_fake_get_elastic_license(): Observable<ElasticLicenseClass> {
    return of(MockElasticLicenseClass);
  }

  call_fake_upload_elastic_license(): Observable<SuccessMessageClass> {
    return of(MockSuccessMessageClass);
  }
}
