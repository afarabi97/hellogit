import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  MockAppClassArray,
  MockChartClassArray,
  MockChartInfoClassArkime,
  MockChartInfoClassArkimeViewerReinstallorUninstall,
  MockGenericJobAndKeyClass,
  MockNodeClassArray,
  MockNodeServerClass,
  MockSavedValueClassArkime,
  MockSavedValueClassArkimeViewer,
  MockStatusClassArkimeViewer
} from '../../../static-data/class-objects';
import {
  MockAppInterfaceArray,
  MockCatalogHelmActionInterfaceSensorInstallandReinstall,
  MockCatalogHelmActionInterfaceSensorUninstall,
  MockChartInfoInterfaceArkime,
  MockChartInterfaceArray,
  MockGenerateRoleInterfaceSensor,
  MockGenericJobAndKeyInterface,
  MockNodeServerInterface,
  MockSavedValueInterfaceArkime,
  MockStatusInterfaceArkimeViewer
} from '../../../static-data/interface-objects';
import { ConfiguredIfaces, GenerateValuesFileSensor, GenerateValuesFileServer } from '../../../static-data/return-data';
import { environment } from '../../environments/environment';
import {
  AppClass,
  ChartClass,
  ChartInfoClass,
  ErrorMessageClass,
  GenericJobAndKeyClass,
  NodeClass,
  SavedValueClass,
  StatusClass
} from '../classes';
import { CatalogHelmActionInterface, CatalogServiceInterface, GenerateFileInterface } from '../interfaces';
import { InjectorModule } from '../modules/utilily-modules/injector.module';
import { ApiService } from './abstract/api.service';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetCatalogNodes: jasmine.Spy<any>;
  let spyGetChartInfo: jasmine.Spy<any>;
  let spyGetChartStatuses: jasmine.Spy<any>;
  let spyGetSavedValues: jasmine.Spy<any>;
  let spyGetInstalledApps: jasmine.Spy<any>;
  let spyGetAllApplicationStatuses: jasmine.Spy<any>;
  let spyGenerateValuesFile: jasmine.Spy<any>;
  let spyCatalogInstall: jasmine.Spy<any>;
  let spyCatalogReinstall: jasmine.Spy<any>;
  let spyCatalogUninstall: jasmine.Spy<any>;
  let spyGetConfiguredIfaces: jasmine.Spy<any>;

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
  const path_value: string = 'fakehostname';
  const sensor_hostname: string = 'fake-sensor3.fake';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        InjectorModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        CatalogService,
        ApiService
      ]
    });

    service = TestBed.inject(CatalogService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyGetCatalogNodes = spyOn(service, 'get_catalog_nodes').and.callThrough();
    spyGetChartInfo = spyOn(service, 'get_chart_info').and.callThrough();
    spyGetChartStatuses = spyOn(service, 'get_chart_statuses').and.callThrough();
    spyGetSavedValues = spyOn(service, 'get_saved_values').and.callThrough();
    spyGetInstalledApps = spyOn(service, 'get_installed_apps').and.callThrough();
    spyGetAllApplicationStatuses = spyOn(service, 'get_all_application_statuses').and.callThrough();
    spyGenerateValuesFile = spyOn(service, 'generate_values_file').and.callThrough();
    spyCatalogInstall = spyOn(service, 'catalog_install').and.callThrough();
    spyCatalogReinstall = spyOn(service, 'catalog_reinstall').and.callThrough();
    spyCatalogUninstall = spyOn(service, 'catalog_uninstall').and.callThrough();
    spyGetConfiguredIfaces = spyOn(service, 'get_configured_ifaces').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetCatalogNodes.calls.reset();
    spyGetChartInfo.calls.reset();
    spyGetChartStatuses.calls.reset();
    spyGetSavedValues.calls.reset();
    spyGetInstalledApps.calls.reset();
    spyGetAllApplicationStatuses.calls.reset();
    spyGenerateValuesFile.calls.reset();
    spyCatalogInstall.calls.reset();
    spyCatalogReinstall.calls.reset();
    spyCatalogUninstall.calls.reset();
    spyGetConfiguredIfaces.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create CatalogService', () => {
    expect(service).toBeTruthy();
  });

  describe('CatalogService methods', () => {

    describe('REST get_catalog_nodes()', () => {
      it('should call get_catalog_nodes()', () => {
        reset();

        service.get_catalog_nodes()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: NodeClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockNodeServerClass[key]);
              }
            });

            expect(service.get_catalog_nodes).toHaveBeenCalled();
          });

        const xhrURL: string = environment.CATALOG_SERVICE_NODES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([MockNodeServerInterface]);

        after();
      });

      it('should call get_catalog_nodes() and handle error', () => {
        reset();

        service.get_catalog_nodes()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: NodeClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_catalog_nodes).toHaveBeenCalled();
            });

        const xhrURL: string = environment.CATALOG_SERVICE_NODES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_chart_info()', () => {
      it('should call get_chart_info()', () => {
        reset();

        service.get_chart_info(path_value)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: ChartInfoClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => expect(response[key]).toEqual(MockChartInfoClassArkime[key]));

            expect(service.get_chart_info).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.CATALOG_SERVICE_BASE}chart/${path_value}/info`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockChartInfoInterfaceArkime);

        after();
      });

      it('should call get_chart_info() and handle error', () => {
        reset();

        service.get_chart_info(path_value)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: ChartInfoClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_chart_info).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.CATALOG_SERVICE_BASE}chart/${path_value}/info`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_chart_statuses()', () => {
      it('should call get_chart_statuses()', () => {
        reset();

        service.get_chart_statuses(path_value)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: StatusClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockStatusClassArkimeViewer[0][key]);
              }
            });

            expect(service.get_chart_statuses).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.CATALOG_SERVICE_BASE}chart/${path_value}/status`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockStatusInterfaceArkimeViewer);

        after();
      });

      it('should call get_chart_statuses() and handle error', () => {
        reset();

        service.get_chart_statuses(path_value)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: StatusClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_chart_statuses).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.CATALOG_SERVICE_BASE}chart/${path_value}/status`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_saved_values()', () => {
      it('should call get_saved_values()', () => {
        reset();

        service.get_saved_values(path_value)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: SavedValueClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockSavedValueClassArkime[0][key]);
              }
            });

            expect(service.get_saved_values).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.CATALOG_SERVICE_BASE}${path_value}/saved-values`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockSavedValueInterfaceArkime);

        after();
      });

      it('should call get_saved_values() and handle error', () => {
        reset();

        service.get_saved_values(path_value)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SavedValueClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_saved_values).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.CATALOG_SERVICE_BASE}${path_value}/saved-values`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_installed_apps()', () => {
      it('should call get_installed_apps()', () => {
        reset();

        service.get_installed_apps(path_value)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: AppClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockAppClassArray[0][key]);
              }
            });

            expect(service.get_installed_apps).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.CATALOG_SERVICE_BASE}${path_value}/apps`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockAppInterfaceArray);

        after();
      });

      it('should call get_installed_apps() and handle error', () => {
        reset();

        service.get_installed_apps(path_value)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: AppClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_installed_apps).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.CATALOG_SERVICE_BASE}${path_value}/apps`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_all_application_statuses()', () => {
      it('should call get_all_application_statuses()', () => {
        reset();

        service.get_all_application_statuses()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: ChartClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockChartClassArray[0][key]);
              }
            });

            expect(service.get_all_application_statuses).toHaveBeenCalled();
          });

        const xhrURL: string = environment.CATALOG_SERVICE_CHARTS_STATUS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockChartInterfaceArray);

        after();
      });

      it('should call get_all_application_statuses() and handle error', () => {
        reset();

        service.get_all_application_statuses()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: ChartClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_all_application_statuses).toHaveBeenCalled();
            });

        const xhrURL: string = environment.CATALOG_SERVICE_CHARTS_STATUS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST generate_values_file()', () => {
      it('should call generate_values_file()', () => {
        reset();

        service.generate_values_file(MockGenerateRoleInterfaceSensor)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: Object[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(GenerateValuesFileServer[0][key]);
              }
            });

            expect(service.generate_values_file).toHaveBeenCalled();
          });

        const xhrURL: string = environment.CATALOG_SERVICE_GENERATE_VALUES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(GenerateValuesFileServer);

        after();
      });

      it('should call generate_values_file() and handle error', () => {
        reset();

        service.generate_values_file(MockGenerateRoleInterfaceSensor)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Object[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.generate_values_file).toHaveBeenCalled();
            });

        const xhrURL: string = environment.CATALOG_SERVICE_GENERATE_VALUES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST catalog_install()', () => {
      it('should call catalog_install()', () => {
        reset();

        service.catalog_install(MockCatalogHelmActionInterfaceSensorInstallandReinstall)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: GenericJobAndKeyClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockGenericJobAndKeyClass[key]);
              }
            });

            expect(service.catalog_install).toHaveBeenCalled();
          });

        const xhrURL: string = environment.CATALOG_SERVICE_INSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockGenericJobAndKeyInterface);

        after();
      });

      it('should call catalog_install() and handle error message error', () => {
        reset();

        service.catalog_install(MockCatalogHelmActionInterfaceSensorInstallandReinstall)
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

              expect(service.catalog_install).toHaveBeenCalled();
            });

        const xhrURL: string = environment.CATALOG_SERVICE_INSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call catalog_install() and handle error', () => {
        reset();

        service.catalog_install(MockCatalogHelmActionInterfaceSensorInstallandReinstall)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: GenericJobAndKeyClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.catalog_install).toHaveBeenCalled();
            });

        const xhrURL: string = environment.CATALOG_SERVICE_INSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST catalog_reinstall()', () => {
      it('should call catalog_reinstall()', () => {
        reset();

        service.catalog_reinstall(MockCatalogHelmActionInterfaceSensorInstallandReinstall)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: GenericJobAndKeyClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockGenericJobAndKeyClass[key]);
              }
            });

            expect(service.catalog_reinstall).toHaveBeenCalled();
          });

        const xhrURL: string = environment.CATALOG_SERVICE_REINSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockGenericJobAndKeyInterface);

        after();
      });

      it('should call catalog_reinstall() and handle error message error', () => {
        reset();

        service.catalog_reinstall(MockCatalogHelmActionInterfaceSensorInstallandReinstall)
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

              expect(service.catalog_reinstall).toHaveBeenCalled();
            });

        const xhrURL: string = environment.CATALOG_SERVICE_REINSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call catalog_reinstall() and handle error', () => {
        reset();

        service.catalog_reinstall(MockCatalogHelmActionInterfaceSensorInstallandReinstall)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: GenericJobAndKeyClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.catalog_reinstall).toHaveBeenCalled();
            });

        const xhrURL: string = environment.CATALOG_SERVICE_REINSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST catalog_uninstall()', () => {
      it('should call catalog_uninstall()', () => {
        reset();

        service.catalog_uninstall(MockCatalogHelmActionInterfaceSensorUninstall)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: GenericJobAndKeyClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockGenericJobAndKeyClass[key]);
              }
            });

            expect(service.catalog_uninstall).toHaveBeenCalled();
          });

        const xhrURL: string = environment.CATALOG_SERVICE_UNINSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockGenericJobAndKeyInterface);

        after();
      });

      it('should call catalog_uninstall() and handle error message error', () => {
        reset();

        service.catalog_uninstall(MockCatalogHelmActionInterfaceSensorInstallandReinstall)
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

              expect(service.catalog_uninstall).toHaveBeenCalled();
            });

        const xhrURL: string = environment.CATALOG_SERVICE_UNINSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call catalog_uninstall() and handle error', () => {
        reset();

        service.catalog_uninstall(MockCatalogHelmActionInterfaceSensorUninstall)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: GenericJobAndKeyClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.catalog_uninstall).toHaveBeenCalled();
            });

        const xhrURL: string = environment.CATALOG_SERVICE_UNINSTALL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_configured_ifaces()', () => {
      it('should call get_configured_ifaces()', () => {
        reset();

        service.get_configured_ifaces(sensor_hostname)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response:  string[]) => {
            response.forEach((iface: string, i: number) => {
              expect(iface).toEqual(ConfiguredIfaces[i]);
            });

            expect(service.get_configured_ifaces).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.CATALOG_SERVICE_GET_CONFIGURED_IFACES}${sensor_hostname}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(ConfiguredIfaces);

        after();
      });

      it('should call get_configured_ifaces() and handle error', () => {
        reset();

        service.get_configured_ifaces(sensor_hostname)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: string[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_configured_ifaces).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.CATALOG_SERVICE_GET_CONFIGURED_IFACES}${sensor_hostname}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class CatalogServiceSpy implements CatalogServiceInterface {

  get_catalog_nodes = jasmine.createSpy('get_catalog_nodes').and.callFake(
    (): Observable<NodeClass[]> => this.call_fake_get_catalog_nodes()
  );

  get_chart_info = jasmine.createSpy('get_chart_info').and.callFake(
    (path_value: string): Observable<ChartInfoClass> => this.call_fake_get_chart_info(path_value)
  );

  get_chart_statuses = jasmine.createSpy('get_chart_statuses').and.callFake(
    (path_value: string): Observable<StatusClass[]> => this.call_fake_get_chart_statuses(path_value)
  );

  get_saved_values = jasmine.createSpy('get_saved_values').and.callFake(
    (path_value: string): Observable<SavedValueClass[]> => this.call_fake_get_saved_values(path_value)
  );

  get_installed_apps = jasmine.createSpy('get_installed_apps').and.callFake(
    (path_value: string): Observable<AppClass[]> => this.call_fake_get_installed_apps(path_value)
  );

  get_all_application_statuses = jasmine.createSpy('get_installed_apps').and.callFake(
    (): Observable<ChartClass[]> => this.call_fake_get_all_application_statuses()
  );

  generate_values_file = jasmine.createSpy('generate_values_file').and.callFake(
    (generate_values_file: GenerateFileInterface): Observable<Object[]> => this.call_fake_generate_values_file(generate_values_file)
  );

  catalog_install = jasmine.createSpy('catalog_install').and.callFake(
    (catalog_helm_action: CatalogHelmActionInterface): Observable<GenericJobAndKeyClass> => this.call_fake_catalog_install(catalog_helm_action)
  );

  catalog_reinstall = jasmine.createSpy('catalog_reinstall').and.callFake(
    (catalog_helm_action: CatalogHelmActionInterface): Observable<GenericJobAndKeyClass> => this.call_fake_catalog_reinstall(catalog_helm_action)
  );

  catalog_uninstall = jasmine.createSpy('catalog_uninstall').and.callFake(
    (catalog_helm_action: CatalogHelmActionInterface): Observable<GenericJobAndKeyClass> => this.call_fake_catalog_uninstall(catalog_helm_action)
  );

  get_configured_ifaces = jasmine.createSpy('get_configured_ifaces').and.callFake(
    (sensor_hostname: string): Observable<string[]> => this.call_fake_get_configured_ifaces(sensor_hostname)
  );

  call_fake_get_catalog_nodes(): Observable<NodeClass[]> {
    return of(MockNodeClassArray);
  }

  call_fake_get_chart_info(path_value: string): Observable<ChartInfoClass> {
    return of(MockChartInfoClassArkimeViewerReinstallorUninstall);
  }

  call_fake_get_chart_statuses(path_value: string): Observable<StatusClass[]> {
    return of(MockStatusClassArkimeViewer);
  }

  call_fake_get_saved_values(path_value: string): Observable<SavedValueClass[]> {
    return of(MockSavedValueClassArkimeViewer);
  }

  call_fake_get_installed_apps(path_value: string): Observable<AppClass[]> {
    return of(MockAppClassArray);
  }

  call_fake_get_all_application_statuses(): Observable<ChartClass[]> {
    return of(MockChartClassArray);
  }

  call_fake_generate_values_file(generate_values_file: GenerateFileInterface): Observable<Object[]> {
    return of(GenerateValuesFileSensor);
  }

  call_fake_catalog_install(catalog_helm_action: CatalogHelmActionInterface): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }

  call_fake_catalog_reinstall(catalog_helm_action: CatalogHelmActionInterface): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }

  call_fake_catalog_uninstall(catalog_helm_action: CatalogHelmActionInterface): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }

  call_fake_get_configured_ifaces(sensor_hostname: string): Observable<string[]> {
    return of(ConfiguredIfaces);
  }
}
