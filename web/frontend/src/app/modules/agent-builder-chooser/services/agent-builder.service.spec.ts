import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  MockAgentInstallerConfigurationClassesArray,
  MockAppConfigClassesArray,
  MockHostClass1,
  MockHostClass2,
  MockIPTargetListClass1,
  MockIPTargetListClass2,
  MockIPTargetListClassesArray,
  MockSuccessMessageClass
} from '../../../../../static-data/class-objects';
import {
  MockAgentInstallerConfigurationInterface1,
  MockAgentInstallerConfigurationInterfacesArray,
  MockAgentInterface,
  MockAgentTargetInterface,
  MockAppConfigInterfacesArray,
  MockHostInterface1,
  MockHostInterface2,
  MockIPTargetListInterface1,
  MockIPTargetListInterface2,
  MockIPTargetListInterfacesArray,
  MockSuccessMessageInterface
} from '../../../../../static-data/interface-objects';
import { environment } from '../../../../environments/environment';
import { ErrorMessageClass, SuccessMessageClass } from '../../../classes';
import { ApiService } from '../../../services/abstract/api.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { AgentInstallerConfigurationClass, AppConfigClass, HostClass, IPTargetListClass } from '../classes';
import {
  AgentBuilderServiceInterface,
  AgentInstallerConfigurationInterface,
  AgentInterface,
  AgentTargetInterface,
  HostInterface,
  IPTargetListInterface
} from '../interfaces';
import { AgentBuilderService } from './agent-builder.service';

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

describe('AgentBuilderService', () => {
  let service: AgentBuilderService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyAgentGenerate: jasmine.Spy<any>;
  let spyAgentSaveConfig: jasmine.Spy<any>;
  let spyAgentDeleteConfig: jasmine.Spy<any>;
  let spyAgentGetConfigs: jasmine.Spy<any>;
  let spyAgentGetIPTargetList: jasmine.Spy<any>;
  let spyAgentSaveIPTargetList: jasmine.Spy<any>;
  let spyAgentAddHostToIPTargetList: jasmine.Spy<any>;
  let spyAgentRemoveHostToIPTargetList: jasmine.Spy<any>;
  let spyAgentDeleteIPTargetList: jasmine.Spy<any>;
  let spyAgentsInstall: jasmine.Spy<any>;
  let spyAgentsUninstall: jasmine.Spy<any>;
  let spyAgentUninstall: jasmine.Spy<any>;
  let spyAgentReinstall: jasmine.Spy<any>;
  let spyGetAppConfigs: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const getType = 'GET';
  const postType = 'POST';
  const deleteType = 'DELETE';

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
  const mock_blob: Blob = create_mock_blob(mock_file);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        InjectorModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        AgentBuilderService,
        ApiService
      ]
    });

    service = TestBed.inject(AgentBuilderService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyAgentGenerate = spyOn(service, 'agent_generate').and.callThrough();
    spyAgentSaveConfig = spyOn(service, 'agent_save_config').and.callThrough();
    spyAgentDeleteConfig = spyOn(service, 'agent_delete_config').and.callThrough();
    spyAgentGetConfigs = spyOn(service, 'agent_get_configs').and.callThrough();
    spyAgentGetIPTargetList = spyOn(service, 'agent_get_ip_target_list').and.callThrough();
    spyAgentSaveIPTargetList = spyOn(service, 'agent_save_ip_target_list').and.callThrough();
    spyAgentAddHostToIPTargetList = spyOn(service, 'agent_add_host_to_ip_target_list').and.callThrough();
    spyAgentRemoveHostToIPTargetList = spyOn(service, 'agent_remove_host_from_ip_target_list').and.callThrough();
    spyAgentDeleteIPTargetList = spyOn(service, 'agent_delete_ip_target_list').and.callThrough();
    spyAgentsInstall = spyOn(service, 'agents_install').and.callThrough();
    spyAgentsUninstall = spyOn(service, 'agents_uninstall').and.callThrough();
    spyAgentUninstall = spyOn(service, 'agent_uninstall').and.callThrough();
    spyAgentReinstall = spyOn(service, 'agent_reinstall').and.callThrough();
    spyGetAppConfigs = spyOn(service, 'get_app_configs').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyAgentGenerate.calls.reset();
    spyAgentSaveConfig.calls.reset();
    spyAgentDeleteConfig.calls.reset();
    spyAgentGetConfigs.calls.reset();
    spyAgentGetIPTargetList.calls.reset();
    spyAgentSaveIPTargetList.calls.reset();
    spyAgentAddHostToIPTargetList.calls.reset();
    spyAgentRemoveHostToIPTargetList.calls.reset();
    spyAgentDeleteIPTargetList.calls.reset();
    spyAgentsInstall.calls.reset();
    spyAgentsUninstall.calls.reset();
    spyAgentUninstall.calls.reset();
    spyAgentReinstall.calls.reset();
    spyGetAppConfigs.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create AgentBuilderService', () => {
    expect(service).toBeTruthy();
  });

  describe('AgentBuilderService methods', () => {

    describe('REST agent_generate()', () => {
      it('should call agent_generate() and return blob', () => {
        reset();

        service.agent_generate(MockAgentInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: Blob) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(mock_blob[key]);
              }
            });
            expect(service.agent_generate).toHaveBeenCalled();
          });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENT_GENERATE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(mock_blob);

        after();
      });

      it('should call test_rule_against_pcap() and handle blob error and return blob', () => {
        reset();

        const new_blob = new Blob([errorRequest], { type: 'application/json' });

        service.agent_generate(MockAgentInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Blob) => {},
            (error: HttpErrorResponse) => {
              expect(error.error instanceof Blob).toBeTrue();
              expect(service.agent_generate).toHaveBeenCalled();
            });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENT_GENERATE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(new_blob, mockErrorResponse);

        after();
      });
    });

    describe('REST agent_save_config()', () => {
      it('should call agent_save_config() and return agent installer configuration class array', () => {
        reset();

        service.agent_save_config(MockAgentInstallerConfigurationInterface1)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: AgentInstallerConfigurationClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockAgentInstallerConfigurationClassesArray[0][key]);
              }
            });

            expect(service.agent_save_config).toHaveBeenCalled();
          });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENT_CONFIG;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockAgentInstallerConfigurationInterfacesArray);

        after();
      });

      it('should call agent_save_config() and handle error message error', () => {
        reset();

        service.agent_save_config(MockAgentInstallerConfigurationInterface1)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: AgentInstallerConfigurationClass[]) => {},
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

              expect(service.agent_save_config).toHaveBeenCalled();
            });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENT_CONFIG;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call agent_save_config() and handle error', () => {
        reset();

        service.agent_save_config(MockAgentInstallerConfigurationInterface1)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: AgentInstallerConfigurationClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.agent_save_config).toHaveBeenCalled();
            });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENT_CONFIG;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST agent_delete_config()', () => {
      it('should call agent_delete_config() and return agent installer configuration class array', () => {
        reset();

        service.agent_delete_config(MockAgentInstallerConfigurationInterface1._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: AgentInstallerConfigurationClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockAgentInstallerConfigurationClassesArray[0][key]);
              }
            });

            expect(service.agent_delete_config).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.AGENT_BUILDER_SERVICE_AGENT_CONFIG}/${MockAgentInstallerConfigurationInterface1._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(deleteType);

        xhrRequest.flush(MockAgentInstallerConfigurationInterfacesArray);

        after();
      });

      it('should call agent_delete_config() and handle error', () => {
        reset();

        service.agent_delete_config(MockAgentInstallerConfigurationInterface1._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: AgentInstallerConfigurationClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.agent_delete_config).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.AGENT_BUILDER_SERVICE_AGENT_CONFIG}/${MockAgentInstallerConfigurationInterface1._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST agent_get_configs()', () => {
      it('should call agent_get_configs() and return agent installer configuration class array', () => {
        reset();

        service.agent_get_configs()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: AgentInstallerConfigurationClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockAgentInstallerConfigurationClassesArray[0][key]);
              }
            });

            expect(service.agent_get_configs).toHaveBeenCalled();
          });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENT_CONFIG;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockAgentInstallerConfigurationInterfacesArray);

        after();
      });

      it('should call agent_get_configs() and handle error', () => {
        reset();

        service.agent_get_configs()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: AgentInstallerConfigurationClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.agent_get_configs).toHaveBeenCalled();
            });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENT_CONFIG;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST agent_get_ip_target_list()', () => {
      it('should call agent_get_ip_target_list() and return ip target list array', () => {
        reset();

        service.agent_get_ip_target_list()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: IPTargetListClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockIPTargetListClassesArray[0][key]);
              }
            });

            expect(service.agent_get_ip_target_list).toHaveBeenCalled();
          });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENT_TARGETS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockIPTargetListInterfacesArray);

        after();
      });

      it('should call agent_get_ip_target_list() and handle error', () => {
        reset();

        service.agent_get_ip_target_list()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: IPTargetListClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.agent_get_ip_target_list).toHaveBeenCalled();
            });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENT_TARGETS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST agent_save_ip_target_list()', () => {
      it('should call agent_save_ip_target_list() and return ip target list class array', () => {
        reset();

        service.agent_save_ip_target_list(MockIPTargetListInterface1)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: IPTargetListClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockIPTargetListClassesArray[0][key]);
              }
            });

            expect(service.agent_save_ip_target_list).toHaveBeenCalled();
          });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENT_TARGETS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockIPTargetListInterfacesArray);

        after();
      });

      it('should call agent_save_ip_target_list() and handle error', () => {
        reset();

        service.agent_save_ip_target_list(MockIPTargetListInterface2)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: IPTargetListClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.agent_save_ip_target_list).toHaveBeenCalled();
            });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENT_TARGETS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST agent_add_host_to_ip_target_list()', () => {
      it('should call agent_add_host_to_ip_target_list() and return ip target list class', () => {
        reset();

        service.agent_add_host_to_ip_target_list(MockIPTargetListClass1._id, MockHostInterface1)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: IPTargetListClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockIPTargetListClass1[key]);
              }
            });

            expect(service.agent_add_host_to_ip_target_list).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.AGENT_BUILDER_SERVICE_AGENT_HOST}${MockIPTargetListClass1._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockIPTargetListInterface1);

        after();
      });

      it('should call agent_add_host_to_ip_target_list() and handle error message error', () => {
        reset();

        service.agent_add_host_to_ip_target_list(MockIPTargetListClass2._id, MockHostInterface2)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: IPTargetListClass) => {},
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

              expect(service.agent_add_host_to_ip_target_list).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.AGENT_BUILDER_SERVICE_AGENT_HOST}${MockIPTargetListClass2._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call agent_add_host_to_ip_target_list() and handle error', () => {
        reset();

        service.agent_add_host_to_ip_target_list(MockIPTargetListClass2._id, MockHostInterface2)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: IPTargetListClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.agent_add_host_to_ip_target_list).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.AGENT_BUILDER_SERVICE_AGENT_HOST}${MockIPTargetListClass2._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST agent_remove_host_from_ip_target_list()', () => {
      it('should call agent_remove_host_from_ip_target_list() and return success message', () => {
        reset();

        service.agent_remove_host_from_ip_target_list(MockIPTargetListClass1._id, MockHostClass1)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: SuccessMessageClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockSuccessMessageClass[key]);
              }
            });

            expect(service.agent_remove_host_from_ip_target_list).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.AGENT_BUILDER_SERVICE_AGENT_HOST}${MockHostClass1.hostname}/${MockIPTargetListClass1._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(deleteType);

        xhrRequest.flush(MockSuccessMessageInterface);

        after();
      });

      it('should call agent_remove_host_from_ip_target_list() and handle error message error', () => {
        reset();

        service.agent_remove_host_from_ip_target_list(MockIPTargetListClass2._id, MockHostClass2)
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

              expect(service.agent_remove_host_from_ip_target_list).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.AGENT_BUILDER_SERVICE_AGENT_HOST}${MockHostClass2.hostname}/${MockIPTargetListClass2._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call agent_remove_host_from_ip_target_list() and handle error', () => {
        reset();

        service.agent_remove_host_from_ip_target_list(MockIPTargetListClass2._id, MockHostClass2)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.agent_remove_host_from_ip_target_list).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.AGENT_BUILDER_SERVICE_AGENT_HOST}${MockHostClass2.hostname}/${MockIPTargetListClass2._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST agent_delete_ip_target_list()', () => {
      it('should call agent_delete_ip_target_list() and return ip target list array', () => {
        reset();

        service.agent_delete_ip_target_list(MockIPTargetListClass1.name)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: IPTargetListClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockIPTargetListClassesArray[0][key]);
              }
            });

            expect(service.agent_delete_ip_target_list).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.AGENT_BUILDER_SERVICE_AGENT_TARGETS}/${MockIPTargetListClass1.name}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(deleteType);

        xhrRequest.flush(MockIPTargetListInterfacesArray);

        after();
      });

      it('should call agent_delete_ip_target_list() and handle error', () => {
        reset();

        service.agent_delete_ip_target_list(MockIPTargetListClass2.name)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: IPTargetListClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.agent_delete_ip_target_list).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.AGENT_BUILDER_SERVICE_AGENT_TARGETS}/${MockIPTargetListClass2.name}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST agents_install()', () => {
      it('should call agents_install() and return success message', () => {
        reset();

        service.agents_install(MockAgentInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: SuccessMessageClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockSuccessMessageClass[key]);
              }
            });

            expect(service.agents_install).toHaveBeenCalled();
          });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENTS_INSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockSuccessMessageInterface);

        after();
      });

      it('should call agents_install() and handle error message error', () => {
        reset();

        service.agents_install(MockAgentInterface)
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

              expect(service.agents_install).toHaveBeenCalled();
            });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENTS_INSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call agents_install() and handle error', () => {
        reset();

        service.agents_install(MockAgentInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.agents_install).toHaveBeenCalled();
            });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENTS_INSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST agents_uninstall()', () => {
      it('should call agents_uninstall() and return success message', () => {
        reset();

        service.agents_uninstall(MockAgentInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: SuccessMessageClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockSuccessMessageClass[key]);
              }
            });

            expect(service.agents_uninstall).toHaveBeenCalled();
          });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENTS_UNINSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockSuccessMessageInterface);

        after();
      });

      it('should call agents_uninstall() and handle error message error', () => {
        reset();

        service.agents_uninstall(MockAgentInterface)
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

              expect(service.agents_uninstall).toHaveBeenCalled();
            });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENTS_UNINSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call agents_uninstall() and handle error', () => {
        reset();

        service.agents_uninstall(MockAgentInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.agents_uninstall).toHaveBeenCalled();
            });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENTS_UNINSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST agent_uninstall()', () => {
      it('should call agent_uninstall() and return success message', () => {
        reset();

        service.agent_uninstall(MockAgentTargetInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: SuccessMessageClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockSuccessMessageClass[key]);
              }
            });

            expect(service.agent_uninstall).toHaveBeenCalled();
          });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENTS_UNINSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockSuccessMessageInterface);

        after();
      });

      it('should call agent_uninstall() and handle error message error', () => {
        reset();

        service.agent_uninstall(MockAgentTargetInterface)
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

              expect(service.agent_uninstall).toHaveBeenCalled();
            });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENTS_UNINSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call agent_uninstall() and handle error', () => {
        reset();

        service.agent_uninstall(MockAgentTargetInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.agent_uninstall).toHaveBeenCalled();
            });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENTS_UNINSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST agent_reinstall()', () => {
      it('should call agent_reinstall() and return success message', () => {
        reset();

        service.agent_reinstall(MockAgentTargetInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: SuccessMessageClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockSuccessMessageClass[key]);
              }
            });

            expect(service.agent_reinstall).toHaveBeenCalled();
          });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENT_REINSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockSuccessMessageInterface);

        after();
      });

      it('should call agent_reinstall() and handle error', () => {
        reset();

        service.agent_reinstall(MockAgentTargetInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.agent_reinstall).toHaveBeenCalled();
            });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENT_REINSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_app_configs()', () => {
      it('should call get_app_configs() and return success message', () => {
        reset();

        service.get_app_configs()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: AppConfigClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockAppConfigClassesArray[0][key]);
              }
            });

            expect(service.get_app_configs).toHaveBeenCalled();
          });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENT_CONFIGS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockAppConfigInterfacesArray);

        after();
      });

      it('should call get_app_configs() and handle error', () => {
        reset();

        service.get_app_configs()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: AppConfigClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_app_configs).toHaveBeenCalled();
            });

        const xhrURL: string = environment.AGENT_BUILDER_SERVICE_AGENT_CONFIGS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class AgentBuilderServiceSpy implements AgentBuilderServiceInterface {

  agent_generate = jasmine.createSpy('agent_generate').and.callFake(
    (agent: AgentInterface): Observable<Blob> => this.call_fake_agent_generate(agent)
  );

  agent_save_config = jasmine.createSpy('agent_save_config').and.callFake(
    (agent_installer_configuration: AgentInstallerConfigurationInterface): Observable<AgentInstallerConfigurationClass[]> => this.call_fake_agent_save_config(agent_installer_configuration)
  );

  agent_delete_config = jasmine.createSpy('agent_delete_config').and.callFake(
    (agent_configuration_id: string): Observable<AgentInstallerConfigurationClass[]> => this.call_fake_agent_delete_config(agent_configuration_id)
  );

  agent_get_configs = jasmine.createSpy('agent_get_configs').and.callFake(
    (): Observable<AgentInstallerConfigurationClass[]> => this.call_fake_agent_get_configs()
  );

  agent_get_ip_target_list = jasmine.createSpy('agent_get_ip_target_list').and.callFake(
    (): Observable<IPTargetListClass[]> => this.call_fake_agent_get_ip_target_list()
  );

  agent_save_ip_target_list = jasmine.createSpy('agent_save_ip_target_list').and.callFake(
    (ip_target_list: IPTargetListClass): Observable<IPTargetListClass[]> => this.call_fake_agent_save_ip_target_list(ip_target_list)
  );

  agent_add_host_to_ip_target_list = jasmine.createSpy('agent_add_host_to_ip_target_list').and.callFake(
    (target_config_id: string, host: HostInterface): Observable<IPTargetListClass> => this.call_fake_agent_add_host_to_ip_target_list(target_config_id, host)
  );

  agent_remove_host_from_ip_target_list = jasmine.createSpy('agent_remove_host_from_ip_target_list').and.callFake(
    (target_config_id: string, host: HostClass): Observable<SuccessMessageClass> => this.call_fake_agent_remove_host_from_ip_target_list(target_config_id, host)
  );

  agent_delete_ip_target_list = jasmine.createSpy('agent_delete_ip_target_list').and.callFake(
    (ip_target_list_name: string): Observable<IPTargetListClass[]> => this.call_fake_agent_delete_ip_target_list(ip_target_list_name)
  );

  agents_install = jasmine.createSpy('agents_install').and.callFake(
    (agent: AgentInterface): Observable<SuccessMessageClass> => this.call_fake_agents_install(agent)
  );

  agents_uninstall = jasmine.createSpy('agents_uninstall').and.callFake(
    (agent: AgentInterface): Observable<SuccessMessageClass> => this.call_fake_agents_uninstall(agent)
  );

  agent_uninstall = jasmine.createSpy('agent_uninstall').and.callFake(
    (agent_target: AgentTargetInterface): Observable<SuccessMessageClass> => this.call_fake_agent_uninstall(agent_target)
  );

  agent_reinstall = jasmine.createSpy('agent_reinstall').and.callFake(
    (agent_target: AgentTargetInterface): Observable<SuccessMessageClass> => this.call_fake_agent_reinstall(agent_target)
  );

  get_app_configs = jasmine.createSpy('get_app_configs').and.callFake(
    (): Observable<AppConfigClass[]> => this.call_fake_get_app_configs()
  );

  call_fake_agent_generate(agent: AgentInterface): Observable<Blob> {
    const mock_file: MockFile = {
      name: agent.installer_config.config_name,
      body: 'FakeFileBody',
      mimeType: 'application/zip'
    };

    return of(create_mock_blob(mock_file));
  }

  call_fake_agent_save_config(agent_installer_configuration: AgentInstallerConfigurationInterface): Observable<AgentInstallerConfigurationClass[]> {
    const agent_installer_configurations: AgentInstallerConfigurationClass[] = MockAgentInstallerConfigurationClassesArray.map((aic: AgentInstallerConfigurationInterface) => new AgentInstallerConfigurationClass(aic));
    agent_installer_configurations.push(new AgentInstallerConfigurationClass(agent_installer_configuration));

    return of(agent_installer_configurations);
  }

  call_fake_agent_delete_config(agent_configuration_id: string): Observable<AgentInstallerConfigurationClass[]> {
    const agent_Installer_configurations: AgentInstallerConfigurationClass[] = MockAgentInstallerConfigurationClassesArray.filter((aic: AgentInstallerConfigurationClass) => aic._id !== agent_configuration_id);

    return of(agent_Installer_configurations);
  }

  call_fake_agent_get_configs(): Observable<AgentInstallerConfigurationClass[]> {
    return of(MockAgentInstallerConfigurationClassesArray);
  }

  call_fake_agent_get_ip_target_list(): Observable<IPTargetListClass[]> {
    return of(MockIPTargetListClassesArray);
  }

  call_fake_agent_save_ip_target_list(ip_target_list: IPTargetListClass): Observable<IPTargetListClass[]> {
    const ip_target_lists: IPTargetListClass[] = MockIPTargetListClassesArray.map((ipl: IPTargetListInterface) => new IPTargetListClass(ipl));
    ip_target_lists.push(new IPTargetListClass(ip_target_list));

    return of(ip_target_lists);
  }

  call_fake_agent_add_host_to_ip_target_list(target_config_id: string, host: HostInterface): Observable<IPTargetListClass> {
    let ip_target_list: IPTargetListClass;

    MockIPTargetListClassesArray.forEach((ipl: IPTargetListInterface) => {
      const new_ip_target_list: IPTargetListClass = new IPTargetListClass(ipl);
      if (new_ip_target_list._id === target_config_id) {
        ip_target_list = new_ip_target_list;
      }
    });
    host.target_config_id = target_config_id;
    ip_target_list.targets.push(host);

    return of(ip_target_list);
  }

  call_fake_agent_remove_host_from_ip_target_list(target_config_id: string, host: HostClass): Observable<SuccessMessageClass> {
    return of(MockSuccessMessageClass);
  }

  call_fake_agent_delete_ip_target_list(ip_target_list_name: string): Observable<IPTargetListClass[]> {
    const ip_target_lists: IPTargetListClass[] = MockIPTargetListClassesArray.filter((ipl: IPTargetListInterface) => ipl.name !== ip_target_list_name);

    return of(ip_target_lists);
  }

  call_fake_agents_install(agent: AgentInterface): Observable<SuccessMessageClass> {
    return of(MockSuccessMessageClass);
  }

  call_fake_agents_uninstall(agent: AgentInterface): Observable<SuccessMessageClass> {
    return of(MockSuccessMessageClass);
  }

  call_fake_agent_uninstall(agent_target: AgentTargetInterface): Observable<SuccessMessageClass> {
    return of(MockSuccessMessageClass);
  }

  call_fake_agent_reinstall(agent_target: AgentTargetInterface): Observable<SuccessMessageClass> {
    return of(MockSuccessMessageClass);
  }

  call_fake_get_app_configs(): Observable<AppConfigClass[]> {
    return of(MockAppConfigClassesArray);
  }
}
