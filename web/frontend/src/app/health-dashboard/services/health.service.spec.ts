import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { InjectorModule } from '../../modules/utilily-modules/injector.module';
import { ApiService } from '../../services/abstract/api.service';

import { MockKitTokenInterface, MockNodeMetricsInterface, MockPodMetricsInterface } from '../../../../static-data/interface-objects';
import { HealthServiceInterface } from '../interfaces/service-interfaces/health-service.interface';
import { HealthService } from './health.service';
import { KitTokenInterface } from 'src/app/system-setupv2/interfaces/kit-token.interface';


describe('HealthService', () => {
  let service: HealthService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spy_get_nodes_status: jasmine.Spy<any>;
  let spy_get_pods_status: jasmine.Spy<any>;
  let spy_get_applications_health_status: jasmine.Spy<any>;
  let spy_get_snmp_data: jasmine.Spy<any>;
  let spy_get_snmp_alerts: jasmine.Spy<any>;
  let spy_get_datastores: jasmine.Spy<any>;
  let spy_describe_node: jasmine.Spy<any>;
  let spy_describe_pod: jasmine.Spy<any>;
  let spy_pod_logs: jasmine.Spy<any>;
  let spy_write_rejects: jasmine.Spy<any>;
  let spy_zeek_pckt_stats: jasmine.Spy<any>;
  let spy_suricata_pckt_stats: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const getType = 'GET';
  const postType = 'POST';
  const deleteType = 'DELETE';

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
    spy_get_nodes_status = spyOn(service, 'get_nodes_status').and.callThrough();
    spy_get_pods_status = spyOn(service, 'get_pods_status').and.callThrough();
    spy_get_applications_health_status = spyOn(service, 'get_applications_health_status').and.callThrough();
    spy_get_snmp_data = spyOn(service, 'get_snmp_data').and.callThrough();
    spy_get_datastores = spyOn(service, 'get_datastores').and.callThrough();
    spy_get_snmp_alerts = spyOn(service, 'get_snmp_alerts').and.callThrough();
    spy_describe_node = spyOn(service, 'describe_node').and.callThrough();
    spy_describe_pod = spyOn(service, 'describe_pod').and.callThrough();
    spy_pod_logs = spyOn(service, 'pod_logs').and.callThrough();
    spy_write_rejects = spyOn(service, 'write_rejects').and.callThrough();
    spy_zeek_pckt_stats = spyOn(service, 'zeek_pckt_stats').and.callThrough();
    spy_suricata_pckt_stats = spyOn(service, 'suricata_pckt_stats').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spy_get_nodes_status.calls.reset();
    spy_get_pods_status.calls.reset();
    spy_get_applications_health_status.calls.reset();
    spy_get_snmp_data.calls.reset();
    spy_get_snmp_alerts.calls.reset();
    spy_get_datastores.calls.reset();
    spy_write_rejects.calls.reset();
    spy_zeek_pckt_stats.calls.reset();
    spy_suricata_pckt_stats.calls.reset();
  };

  const after = () => {
    httpMock.verify();
  };

  it('should create HealthService', () => {
    expect(service).toBeTruthy();
  });

  describe('HealthService methods', () => {
    describe('REST get_nodes_status(<remote>?: KitTokenInterface)', () => {
      it('should call get_nodes_status(<remote>?: KitTokenInterface)', () => {
        reset();

        service.get_nodes_status()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {
              expect(response.length).toEqual(1);
              expect(service.get_nodes_status).toHaveBeenCalled();
            });

        service.get_nodes_status(MockKitTokenInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {
              expect(response.length).toEqual(1);
              expect(service.get_nodes_status).toHaveBeenCalled();
            });

        const xhrURL: string = environment.HEALTH_SERVICE_GET_NODES_STATUS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush([{}]);

        const rxhrURL: string = `${environment.HEALTH_SERVICE_REMOTE}/${MockKitTokenInterface.kit_token_id}/nodes/status`;
        const rxhrRequest: TestRequest = httpMock.expectOne(rxhrURL);
        expect(rxhrRequest.request.method).toEqual(getType);
        rxhrRequest.flush([{}]);

        after();
      });

      it('should call get_nodes_status(<remote>?: KitTokenInterface) and handle error', () => {
        reset();

        service.get_nodes_status()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {},
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

    describe('REST get_pods_status(<remote>?: KitTokenInterface)', () => {
      it('should call get_pods_status(<remote>?: KitTokenInterface)', () => {
        reset();

        service.get_pods_status()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: Array<Object>) => {
            expect(service.get_pods_status).toHaveBeenCalled();
          });

        service.get_pods_status(MockKitTokenInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: Array<Object>) => {
            expect(service.get_pods_status).toHaveBeenCalled();
          });

        const xhrURL: string = environment.HEALTH_SERVICE_GET_PODS_STATUS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush([{}]);

        const rxhrURL: string = `${environment.HEALTH_SERVICE_REMOTE}/${MockKitTokenInterface.kit_token_id}/pods/status`;
        const rxhrRequest: TestRequest = httpMock.expectOne(rxhrURL);
        expect(rxhrRequest.request.method).toEqual(getType);
        rxhrRequest.flush([{}]);

        after();
      });

      it('should call get_pods_status(<remote>?: KitTokenInterface) and handle error', () => {
        reset();

        service.get_pods_status()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {},
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

    describe('REST get_applications_health_status()', () => {
      it('should call get_applications_health_status()', () => {
        reset();

        service.get_applications_health_status()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {
              expect(response.length).toEqual(0);
              expect(service.get_applications_health_status).toHaveBeenCalled();
            });

        const xhrURL: string = environment.HEALTH_SERVICE_GET_APPLICATIONS_STATUS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush([]);

        after();
      });

      it('should call get_applications_health_status() and handle error', () => {
        reset();

        service.get_applications_health_status()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_applications_health_status).toHaveBeenCalled();
            });

        const xhrURL: string = environment.HEALTH_SERVICE_GET_APPLICATIONS_STATUS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_snmp_data()', () => {
      it('should call get_snmp_data()', () => {
        reset();

        service.get_snmp_data()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: Array<Object>) => {
            expect(service.get_snmp_data).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.HEALTH_SERVICE_GET_SNMP_STATUS}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([{}]);

        after();
      });

      it('should call get_snmp_data() and handle error', () => {
        reset();

        service.get_snmp_data()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_snmp_data).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.HEALTH_SERVICE_GET_SNMP_STATUS}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_snmp_alerts()', () => {
      it('should call get_snmp_data()', () => {
        reset();

        service.get_snmp_alerts()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: Array<Object>) => {
            expect(service.get_snmp_alerts).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.HEALTH_SERVICE_GET_SNMP_ALERTS}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([{}]);

        after();
      });

      it('should call get_snmp_alerts() and handle error', () => {
        reset();

        service.get_snmp_alerts()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_snmp_alerts).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.HEALTH_SERVICE_GET_SNMP_ALERTS}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_datastores()', () => {
      it('should call get_datastores()', () => {
        reset();

        service.get_datastores()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: Array<Object>) => {
            expect(service.get_datastores).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.HEALTH_SERVICE_GET_DATASTORES}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([{}]);

        after();
      });

      it('should call get_datastores() and handle error', () => {
        reset();

        service.get_datastores()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {},
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

    describe('REST describe_node(node_name: string)', () => {
      it('should call describe_node(node_name: string)', () => {
        reset();

        service.describe_node(MockNodeMetricsInterface.name)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response) => {
            expect(service.describe_node).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.HEALTH_SERVICE_DESCRIBE_NODE}/${MockNodeMetricsInterface.name}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush({});

        after();
      });

      it('should call describe_node(node_name: string) and handle error', () => {
        reset();

        service.describe_node(MockNodeMetricsInterface.name)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response) => {},
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
          .subscribe((response) => {
            expect(service.describe_pod).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.HEALTH_SERVICE_DESCRIBE_POD}/${MockPodMetricsInterface.name}/${MockPodMetricsInterface.namespace}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);

        after();
      });

      it('should call describe_pod(pod_name: string, namespace: string) and handle error', () => {
        reset();

        service.describe_pod(MockPodMetricsInterface.name, MockPodMetricsInterface.namespace)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response) => {},
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
          .subscribe((response) => {
            expect(service.pod_logs).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.HEALTH_SERVICE_POD_LOGS}/${MockPodMetricsInterface.name}/${MockPodMetricsInterface.namespace}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush({});

        after();
      });

      it('should call pod_logs(pod_name: string, namespace: string) and handle error', () => {
        reset();

        service.pod_logs(MockPodMetricsInterface.name, MockPodMetricsInterface.namespace)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response) => {},
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

    describe('REST write_rejects(<remote>?: KitTokenInterface)', () => {
      it('should call write_rejects(<remote>?: KitTokenInterface)', () => {
        reset();

        service.write_rejects()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {
              expect(response.length).toEqual(1);
              expect(service.write_rejects).toHaveBeenCalled();
            });

        service.write_rejects(MockKitTokenInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {
              expect(response.length).toEqual(1);
              expect(service.write_rejects).toHaveBeenCalled();
            });

        const xhrURL: string = environment.HEALTH_SERVICE_WRITE_REJECTS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush([{}]);

        const rxhrURL: string = `${environment.HEALTH_SERVICE_WRITE_REJECTS}/remote/${MockKitTokenInterface.ipaddress}`;
        const rxhrRequest: TestRequest = httpMock.expectOne(rxhrURL);
        expect(rxhrRequest.request.method).toEqual(getType);
        rxhrRequest.flush([{}]);

        after();
      });

      it('should call write_rejects(<remote>?: KitTokenInterface) and handle error', () => {
        reset();

        service.write_rejects()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {},
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

    describe('REST zeek_pckt_stats(<remote>?: KitTokenInterface)', () => {
      it('should call zeek_pckt_stats(<remote>?: KitTokenInterface)', () => {
        reset();

        service.zeek_pckt_stats()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {
              expect(response.length).toEqual(1);
              expect(service.zeek_pckt_stats).toHaveBeenCalled();
            });

        service.zeek_pckt_stats(MockKitTokenInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {
              expect(response.length).toEqual(1);
              expect(service.zeek_pckt_stats).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.HEALTH_SERVICE_APP}/zeek/packets`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush([{}]);

        const rxhrURL: string = `${environment.HEALTH_SERVICE_APP}/zeek/packets/remote/${MockKitTokenInterface.ipaddress}`;
        const rxhrRequest: TestRequest = httpMock.expectOne(rxhrURL);
        expect(rxhrRequest.request.method).toEqual(getType);
        rxhrRequest.flush([{}]);

        after();
      });

      it('should call zeek_pckt_stats(<remote>?: KitTokenInterface) and handle error', () => {
        reset();

        service.zeek_pckt_stats()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {},
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

    describe('REST suricata_pckt_stats(<remote>?: KitTokenInterface)', () => {
      it('should call suricata_pckt_stats(<remote>?: KitTokenInterface)', () => {
        reset();

        service.suricata_pckt_stats()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {
              expect(response.length).toEqual(1);
              expect(service.suricata_pckt_stats).toHaveBeenCalled();
            });

        service.suricata_pckt_stats(MockKitTokenInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {
              expect(response.length).toEqual(1);
              expect(service.suricata_pckt_stats).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.HEALTH_SERVICE_APP}/suricata/packets`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);
        expect(xhrRequest.request.method).toEqual(getType);
        xhrRequest.flush([{}]);

        const rxhrURL: string = `${environment.HEALTH_SERVICE_APP}/suricata/packets/remote/${MockKitTokenInterface.ipaddress}`;
        const rxhrRequest: TestRequest = httpMock.expectOne(rxhrURL);
        expect(rxhrRequest.request.method).toEqual(getType);
        rxhrRequest.flush([{}]);

        after();
      });

      it('should call suricata_pckt_stats(<remote>?: KitTokenInterface) and handle error', () => {
        reset();

        service.suricata_pckt_stats()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<Object>) => {},
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
  });
});

@Injectable()
export class HealthServiceSpy implements HealthServiceInterface {
  get_nodes_status = jasmine.createSpy('get_nodes_status').and.callFake((): Observable<Array<Object>> => this.call_fake_get_nodes_status());
  get_pods_status = jasmine.createSpy('get_pods_status').and.callFake((): Observable<Array<Object>> => this.call_fake_get_pods_status());
  get_applications_health_status = jasmine.createSpy('get_applications_health_status').and.callFake((): Observable<Object> => this.call_fake_get_applications_health_status());
  get_snmp_data = jasmine.createSpy('get_snmp_data').and.callFake((): Observable<Array<Object>> => this.call_fake_get_snmp_data());
  get_snmp_alerts = jasmine.createSpy('get_snmp_alerts').and.callFake((): Observable<Array<Object>> => this.call_fake_get_snmp_alerts());
  get_datastores = jasmine.createSpy('get_datastores').and.callFake((): Observable<Array<Object>> => this.call_fake_get_datastores());
  describe_node = jasmine.createSpy('describe_node').and.callFake((): Observable<Object> => this.call_fake_describe_node(MockPodMetricsInterface.name));
  describe_pod = jasmine.createSpy('describe_pod').and.callFake((): Observable<Object> => this.call_fake_describe_pod(MockPodMetricsInterface.name, MockPodMetricsInterface.namespace));
  pod_logs = jasmine.createSpy('pod_logs').and.callFake((): Observable<Object> => this.call_fake_pod_logs(MockPodMetricsInterface.name, MockPodMetricsInterface.namespace));
  write_rejects = jasmine.createSpy('write_rejects').and.callFake((): Observable<Array<Object>> => this.call_fake_write_rejects());
  suricata_pckt_stats = jasmine.createSpy('suricata_pckt_stats').and.callFake((): Observable<Array<Object>> => this.call_fake_suricata_pckt_stats());
  zeek_pckt_stats = jasmine.createSpy('zeek_pckt_stats').and.callFake((): Observable<Array<Object>> => this.call_fake_zeek_pckt_stats());

  call_fake_get_nodes_status(remote?: KitTokenInterface): Observable<Array<Object>> {
    return observableOf([{}]);
  }
  call_fake_get_pods_status(remote?: KitTokenInterface): Observable<Array<Object>> {
    return observableOf([{}]);
  }
  call_fake_get_applications_health_status(): Observable<Array<Object>> {
    return observableOf([{}]);
  }
  call_fake_get_snmp_data(): Observable<Array<Object>> {
    return observableOf([{}]);
  }
  call_fake_get_snmp_alerts(): Observable<Array<Object>> {
    return observableOf([{}]);
  }
  call_fake_get_datastores(): Observable<Array<Object>> {
    return observableOf([{}]);
  }
  call_fake_describe_node(node_name: string): Observable<Object> {
    return observableOf({});
  }
  call_fake_describe_pod(pod_name: string, namespace: string): Observable<Object> {
    return observableOf({});
  }
  call_fake_pod_logs(pod_name: string, namespace: string): Observable<Object> {
    return observableOf({});
  }
  call_fake_write_rejects(remote?: KitTokenInterface): Observable<Array<Object>> {
    return observableOf([{}]);
  }
  call_fake_suricata_pckt_stats(remote?: KitTokenInterface): Observable<Array<Object>> {
    return observableOf([{}]);
  }
  call_fake_zeek_pckt_stats(remote?: KitTokenInterface): Observable<Array<Object>> {
    return observableOf([{}]);
  }
}
