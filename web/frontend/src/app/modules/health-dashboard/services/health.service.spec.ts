import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  MockDatastoreClassArray,
  MockDescribePodNodeClass,
  MockElasticseachObjectWriteRejectsClassArray,
  MockNodeStatusClassArray,
  MockPacketStatClassArraySuricata,
  MockPacketStatClassArrayZeek,
  MockPodLogClassArray,
  MockPodStatusClassArray
} from '../../../../../static-data/class-objects';
import {
  MockDatastoreInterfaceArray,
  MockDescribePodNodeInterface,
  MockElasticseachObjectWriteRejectsInterfaceArray,
  MockKitTokenInterface,
  MockNodeMetricsInterface,
  MockNodeStatusInterfaceArray,
  MockPacketStatInterfaceArraySuricata,
  MockPacketStatInterfaceArrayZeek,
  MockPodLogInterfaceArray,
  MockPodMetricsInterface,
  MockPodStatusInterfaceArray
} from '../../../../../static-data/interface-objects';
import { environment } from '../../../../environments/environment';
import { KitTokenInterface } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import {
  DatastoreClass,
  DescribePodNodeClass,
  ElasticsearchObjectClass,
  NodeStatusClass,
  PacketStatsClass,
  PodLogClass,
  PodStatusClass
} from '../classes';
import { HealthServiceInterface } from '../interfaces';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spy_get_datastores: jasmine.Spy<any>;
  let spy_write_rejects: jasmine.Spy<any>;
  let spy_zeek_pckt_stats: jasmine.Spy<any>;
  let spy_suricata_pckt_stats: jasmine.Spy<any>;
  let spy_get_nodes_status: jasmine.Spy<any>;
  let spy_get_pods_status: jasmine.Spy<any>;
  let spy_describe_node: jasmine.Spy<any>;
  let spy_describe_pod: jasmine.Spy<any>;
  let spy_pod_logs: jasmine.Spy<any>;

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
        HealthService,
        ApiService
      ]
    });

    service = TestBed.inject(HealthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spy_get_datastores = spyOn(service, 'get_datastores').and.callThrough();
    spy_write_rejects = spyOn(service, 'write_rejects').and.callThrough();
    spy_zeek_pckt_stats = spyOn(service, 'zeek_pckt_stats').and.callThrough();
    spy_suricata_pckt_stats = spyOn(service, 'suricata_pckt_stats').and.callThrough();
    spy_get_nodes_status = spyOn(service, 'get_nodes_status').and.callThrough();
    spy_get_pods_status = spyOn(service, 'get_pods_status').and.callThrough();
    spy_describe_node = spyOn(service, 'describe_node').and.callThrough();
    spy_describe_pod = spyOn(service, 'describe_pod').and.callThrough();
    spy_pod_logs = spyOn(service, 'pod_logs').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spy_get_datastores.calls.reset();
    spy_write_rejects.calls.reset();
    spy_zeek_pckt_stats.calls.reset();
    spy_suricata_pckt_stats.calls.reset();
    spy_get_nodes_status.calls.reset();
    spy_get_pods_status.calls.reset();
    spy_describe_node.calls.reset();
    spy_describe_pod.calls.reset();
    spy_pod_logs.calls.reset();
  };

  const after = () => {
    httpMock.verify();
  };

  it('should create HealthService', () => {
    expect(service).toBeTruthy();
  });

  describe('HealthService methods', () => {
    describe('REST get_datastores()', () => {
      it('should call get_datastores()', () => {
        reset();

        service.get_datastores()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: DatastoreClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockDatastoreClassArray[0][key]);
              }
            });

            expect(service.get_datastores).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.HEALTH_SERVICE_GET_DATASTORES}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockDatastoreInterfaceArray);

        after();
      });

      it('should call get_datastores() and handle error', () => {
        reset();

        service.get_datastores()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: DatastoreClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_datastores).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.HEALTH_SERVICE_GET_DATASTORES}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST write_rejects(kit_token?: KitTokenInterface)', () => {
      it('should call write_rejects(kit_token?: KitTokenInterface)', () => {
        reset();

        service.write_rejects()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: ElasticsearchObjectClass[]) => {
              const objectKeys: string[] = Object.keys(response[0]);
              objectKeys.forEach((key: string) => {
                if (!(response[0][key] instanceof Array)) {
                  expect(response[0][key]).toEqual(MockElasticseachObjectWriteRejectsClassArray[0][key]);
                }
              });

              expect(service.write_rejects).toHaveBeenCalled();
            });

        service.write_rejects(MockKitTokenInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response:ElasticsearchObjectClass[]) => {
              const objectKeys: string[] = Object.keys(response[0]);
              objectKeys.forEach((key: string) => {
                if (!(response[0][key] instanceof Array)) {
                  expect(response[0][key]).toEqual(MockElasticseachObjectWriteRejectsClassArray[0][key]);
                }
              });

              expect(service.write_rejects).toHaveBeenCalled();
            });

        const xhrURL: string = environment.HEALTH_SERVICE_WRITE_REJECTS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush(MockElasticseachObjectWriteRejectsInterfaceArray);

        const rxhrURL: string = `${environment.HEALTH_SERVICE_WRITE_REJECTS}/remote/${MockKitTokenInterface.ipaddress}`;
        const rxhrRequest: TestRequest = httpMock.expectOne(rxhrURL);
        expect(rxhrRequest.request.method).toEqual(getType);
        rxhrRequest.flush(MockElasticseachObjectWriteRejectsInterfaceArray);

        after();
      });

      it('should call write_rejects(kit_token?: KitTokenInterface) and handle error', () => {
        reset();

        service.write_rejects()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: ElasticsearchObjectClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.write_rejects).toHaveBeenCalled();
            });

        const xhrURL: string = environment.HEALTH_SERVICE_WRITE_REJECTS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST zeek_pckt_stats(kit_token?: KitTokenInterface)', () => {
      it('should call zeek_pckt_stats(kit_token?: KitTokenInterface)', () => {
        reset();

        service.zeek_pckt_stats()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: PacketStatsClass[]) => {
              const objectKeys: string[] = Object.keys(response[0]);
              objectKeys.forEach((key: string) => {
                if (!(response[0][key] instanceof Array)) {
                  expect(response[0][key]).toEqual(MockPacketStatClassArrayZeek[0][key]);
                }
              });

              expect(service.zeek_pckt_stats).toHaveBeenCalled();
            });

        service.zeek_pckt_stats(MockKitTokenInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: PacketStatsClass[]) => {
              const objectKeys: string[] = Object.keys(response[0]);
              objectKeys.forEach((key: string) => {
                if (!(response[0][key] instanceof Array)) {
                  expect(response[0][key]).toEqual(MockPacketStatClassArrayZeek[0][key]);
                }
              });

              expect(service.zeek_pckt_stats).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.HEALTH_SERVICE_APP}/zeek/packets`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush(MockPacketStatInterfaceArrayZeek);

        const rxhrURL: string = `${environment.HEALTH_SERVICE_APP}/zeek/packets/remote/${MockKitTokenInterface.ipaddress}`;
        const rxhrRequest: TestRequest = httpMock.expectOne(rxhrURL);
        expect(rxhrRequest.request.method).toEqual(getType);
        rxhrRequest.flush(MockPacketStatInterfaceArrayZeek);

        after();
      });

      it('should call zeek_pckt_stats(kit_token?: KitTokenInterface) and handle error', () => {
        reset();

        service.zeek_pckt_stats()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: PacketStatsClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.zeek_pckt_stats).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.HEALTH_SERVICE_APP}/zeek/packets`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST suricata_pckt_stats(kit_token?: KitTokenInterface)', () => {
      it('should call suricata_pckt_stats(kit_token?: KitTokenInterface)', () => {
        reset();

        service.suricata_pckt_stats()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: PacketStatsClass[]) => {
              const objectKeys: string[] = Object.keys(response[0]);
              objectKeys.forEach((key: string) => {
                if (!(response[0][key] instanceof Array)) {
                  expect(response[0][key]).toEqual(MockPacketStatClassArraySuricata[0][key]);
                }
              });

              expect(service.suricata_pckt_stats).toHaveBeenCalled();
            });

        service.suricata_pckt_stats(MockKitTokenInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: PacketStatsClass[]) => {
              const objectKeys: string[] = Object.keys(response[0]);
              objectKeys.forEach((key: string) => {
                if (!(response[0][key] instanceof Array)) {
                  expect(response[0][key]).toEqual(MockPacketStatClassArraySuricata[0][key]);
                }
              });

              expect(service.suricata_pckt_stats).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.HEALTH_SERVICE_APP}/suricata/packets`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush(MockPacketStatInterfaceArraySuricata);

        const rxhrURL: string = `${environment.HEALTH_SERVICE_APP}/suricata/packets/remote/${MockKitTokenInterface.ipaddress}`;
        const rxhrRequest: TestRequest = httpMock.expectOne(rxhrURL);
        expect(rxhrRequest.request.method).toEqual(getType);
        rxhrRequest.flush(MockPacketStatInterfaceArraySuricata);

        after();
      });

      it('should call suricata_pckt_stats(kit_token?: KitTokenInterface) and handle error', () => {
        reset();

        service.suricata_pckt_stats()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: PacketStatsClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.suricata_pckt_stats).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.HEALTH_SERVICE_APP}/suricata/packets`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_nodes_status(kit_token?: KitTokenInterface)', () => {
      it('should call get_nodes_status(kit_token?: KitTokenInterface)', () => {
        reset();

        service.get_nodes_status()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: NodeStatusClass[]) => {
              const objectKeys: string[] = Object.keys(response[0]);
              objectKeys.forEach((key: string) => {
                if (!(response[0][key] instanceof Array)) {
                  expect(response[0][key]).toEqual(MockNodeStatusClassArray[0][key]);
                }
              });

              expect(service.get_nodes_status).toHaveBeenCalled();
            });

        service.get_nodes_status(MockKitTokenInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: NodeStatusClass[]) => {
              const objectKeys: string[] = Object.keys(response[0]);
              objectKeys.forEach((key: string) => {
                if (!(response[0][key] instanceof Array)) {
                  expect(response[0][key]).toEqual(MockNodeStatusClassArray[0][key]);
                }
              });

              expect(service.get_nodes_status).toHaveBeenCalled();
            });

        const xhrURL: string = environment.HEALTH_SERVICE_GET_NODES_STATUS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush(MockNodeStatusInterfaceArray);

        const rxhrURL: string = `${environment.HEALTH_SERVICE_REMOTE}/${MockKitTokenInterface.kit_token_id}/nodes/status`;
        const rxhrRequest: TestRequest = httpMock.expectOne(rxhrURL);
        expect(rxhrRequest.request.method).toEqual(getType);
        rxhrRequest.flush(MockNodeStatusInterfaceArray);

        after();
      });

      it('should call get_nodes_status(kit_token?: KitTokenInterface) and handle error', () => {
        reset();

        service.get_nodes_status()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: NodeStatusClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_nodes_status).toHaveBeenCalled();
            });

        const xhrURL: string = environment.HEALTH_SERVICE_GET_NODES_STATUS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_pods_status(kit_token?: KitTokenInterface)', () => {
      it('should call get_pods_status(kit_token?: KitTokenInterface)', () => {
        reset();

        service.get_pods_status()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: PodStatusClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockPodStatusClassArray[0][key]);
              }
            });

            expect(service.get_pods_status).toHaveBeenCalled();
          });

        service.get_pods_status(MockKitTokenInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: PodStatusClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockPodStatusClassArray[0][key]);
              }
            });

            expect(service.get_pods_status).toHaveBeenCalled();
          });

        const xhrURL: string = environment.HEALTH_SERVICE_GET_PODS_STATUS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush(MockPodStatusInterfaceArray);

        const rxhrURL: string = `${environment.HEALTH_SERVICE_REMOTE}/${MockKitTokenInterface.kit_token_id}/pods/status`;
        const rxhrRequest: TestRequest = httpMock.expectOne(rxhrURL);
        expect(rxhrRequest.request.method).toEqual(getType);
        rxhrRequest.flush(MockPodStatusInterfaceArray);

        after();
      });

      it('should call get_pods_status(kit_token?: KitTokenInterface) and handle error', () => {
        reset();

        service.get_pods_status()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: PodStatusClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_pods_status).toHaveBeenCalled();
            });

        const xhrURL: string = environment.HEALTH_SERVICE_GET_PODS_STATUS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST describe_node(node_name: string)', () => {
      it('should call describe_node(node_name: string)', () => {
        reset();

        service.describe_node(MockNodeMetricsInterface.name)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: DescribePodNodeClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockDescribePodNodeClass[key]);
              }
            });

            expect(service.describe_node).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.HEALTH_SERVICE_DESCRIBE_NODE}/${MockNodeMetricsInterface.name}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush(MockDescribePodNodeInterface);

        after();
      });

      it('should call describe_node(node_name: string) and handle error', () => {
        reset();

        service.describe_node(MockNodeMetricsInterface.name)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: DescribePodNodeClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.describe_node).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.HEALTH_SERVICE_DESCRIBE_NODE}/${MockNodeMetricsInterface.name}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST describe_pod(pod_name: string, namespace: string)', () => {
      it('should call describe_pod(pod_name: string, namespace: string)', () => {
        reset();

        service.describe_pod(MockPodMetricsInterface.name, MockPodMetricsInterface.namespace)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: DescribePodNodeClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockDescribePodNodeClass[key]);
              }
            });

            expect(service.describe_pod).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.HEALTH_SERVICE_DESCRIBE_POD}/${MockPodMetricsInterface.name}/${MockPodMetricsInterface.namespace}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush(MockDescribePodNodeInterface);

        after();
      });

      it('should call describe_pod(pod_name: string, namespace: string) and handle error', () => {
        reset();

        service.describe_pod(MockPodMetricsInterface.name, MockPodMetricsInterface.namespace)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: DescribePodNodeClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.describe_pod).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.HEALTH_SERVICE_DESCRIBE_POD}/${MockPodMetricsInterface.name}/${MockPodMetricsInterface.namespace}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST pod_logs(pod_name: string, namespace: string)', () => {
      it('should call pod_logs(pod_name: string, namespace: string)', () => {
        reset();

        service.pod_logs(MockPodMetricsInterface.name, MockPodMetricsInterface.namespace)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: PodLogClass[]) => {
            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockPodLogClassArray[0][key]);
              }
            });

            expect(service.pod_logs).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.HEALTH_SERVICE_POD_LOGS}/${MockPodMetricsInterface.name}/${MockPodMetricsInterface.namespace}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush(MockPodLogInterfaceArray);

        after();
      });

      it('should call pod_logs(pod_name: string, namespace: string) and handle error', () => {
        reset();

        service.pod_logs(MockPodMetricsInterface.name, MockPodMetricsInterface.namespace)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: PodLogClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.pod_logs).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.HEALTH_SERVICE_POD_LOGS}/${MockPodMetricsInterface.name}/${MockPodMetricsInterface.namespace}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class HealthServiceSpy implements HealthServiceInterface {

  get_datastores = jasmine.createSpy('get_datastores').and.callFake(
    (): Observable<DatastoreClass[]> => this.call_fake_get_datastores()
  );

  write_rejects = jasmine.createSpy('write_rejects').and.callFake(
    (kit_token?: KitTokenInterface): Observable<ElasticsearchObjectClass[]> => this.call_fake_write_rejects(kit_token)
  );

  zeek_pckt_stats = jasmine.createSpy('zeek_pckt_stats').and.callFake(
    (kit_token?: KitTokenInterface): Observable<PacketStatsClass[]> => this.call_fake_zeek_pckt_stats(kit_token)
  );

  suricata_pckt_stats = jasmine.createSpy('suricata_pckt_stats').and.callFake(
    (kit_token?: KitTokenInterface): Observable<PacketStatsClass[]> => this.call_fake_suricata_pckt_stats(kit_token)
  );

  get_nodes_status = jasmine.createSpy('get_nodes_status').and.callFake(
    (kit_token?: KitTokenInterface): Observable<NodeStatusClass[]> => this.call_fake_get_nodes_status(kit_token)
  );

  get_pods_status = jasmine.createSpy('get_pods_status').and.callFake(
    (kit_token?: KitTokenInterface): Observable<PodStatusClass[]> => this.call_fake_get_pods_status(kit_token)
  );

  describe_node = jasmine.createSpy('describe_node').and.callFake(
    (node_name: string): Observable<DescribePodNodeClass> => this.call_fake_describe_node(node_name)
  );

  describe_pod = jasmine.createSpy('describe_pod').and.callFake(
    (pod_name: string, namespace: string): Observable<DescribePodNodeClass> => this.call_fake_describe_pod(pod_name, namespace)
  );

  pod_logs = jasmine.createSpy('pod_logs').and.callFake(
    (pod_name: string, namespace: string): Observable<PodLogClass[]> => this.call_fake_pod_logs(pod_name, namespace)
  );

  call_fake_get_datastores(): Observable<DatastoreClass[]> {
    return of(MockDatastoreClassArray);
  }

  call_fake_write_rejects(kit_token?: KitTokenInterface): Observable<ElasticsearchObjectClass[]> {
    return of(MockElasticseachObjectWriteRejectsClassArray);
  }

  call_fake_zeek_pckt_stats(kit_token?: KitTokenInterface): Observable<PacketStatsClass[]> {
    return of(MockPacketStatClassArrayZeek);
  }

  call_fake_suricata_pckt_stats(kit_token?: KitTokenInterface): Observable<PacketStatsClass[]> {
    return of(MockPacketStatClassArraySuricata);
  }

  call_fake_get_nodes_status(kit_token?: KitTokenInterface): Observable<NodeStatusClass[]> {
    return of(MockNodeStatusClassArray);
  }

  call_fake_get_pods_status(kit_token?: KitTokenInterface): Observable<PodStatusClass[]> {
    return of(MockPodStatusClassArray);
  }

  call_fake_describe_node(node_name: string): Observable<DescribePodNodeClass> {
    return of(MockDescribePodNodeClass);
  }

  call_fake_describe_pod(pod_name: string, namespace: string): Observable<DescribePodNodeClass> {
    return of(MockDescribePodNodeClass);
  }

  call_fake_pod_logs(pod_name: string, namespace: string): Observable<PodLogClass[]> {
    return of(MockPodLogClassArray);
  }
}
