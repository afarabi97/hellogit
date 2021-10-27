import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  MockElasticsearchConfigurationClass,
  MockElasticsearchNodeClass,
  MockElasticsearchNodeReturnClass,
  MockStatusReadyElasticsearchCheckClass
} from '../../../../../static-data/class-objects';
import {
  MockElasticsearchConfigurationInterface,
  MockElasticsearchNodeInterface,
  MockStatusReadyElasticsearchCheckInterface
} from '../../../../../static-data/interface-objects';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../services/abstract/api.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import {
  ElasticsearchCheckClass,
  ElasticsearchConfigurationClass,
  ElasticsearchNodeClass,
  ElasticsearchNodeReturnClass
} from '../classes';
import { ElasticsearchServiceInterface } from '../interfaces';
import { ElasticsearchService } from './elasticsearch.service';

describe('ElasticsearchService', () => {
  let service: ElasticsearchService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetElasticNodes: jasmine.Spy<any>;
  let spyPostElasticNodes: jasmine.Spy<any>;
  let spyGetElasticFullConfig: jasmine.Spy<any>;
  let spyPostElasticFullConfig: jasmine.Spy<any>;
  let spyDeployElastic: jasmine.Spy<any>;
  let spyCheckElastic: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const getType = 'GET';
  const postType = 'POST';

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
        ElasticsearchService,
        ApiService
      ]
    });

    service = TestBed.inject(ElasticsearchService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyGetElasticNodes = spyOn(service, 'get_elastic_nodes').and.callThrough();
    spyPostElasticNodes = spyOn(service, 'post_elastic_nodes').and.callThrough();
    spyGetElasticFullConfig = spyOn(service, 'get_elastic_full_config').and.callThrough();
    spyPostElasticFullConfig = spyOn(service, 'post_elastic_full_config').and.callThrough();
    spyDeployElastic = spyOn(service, 'deploy_elastic').and.callThrough();
    spyCheckElastic = spyOn(service, 'check_elastic').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetElasticNodes.calls.reset();
    spyPostElasticNodes.calls.reset();
    spyGetElasticFullConfig.calls.reset();
    spyPostElasticFullConfig.calls.reset();
    spyDeployElastic.calls.reset();
    spyCheckElastic.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create ElasticsearchService', () => {
    expect(service).toBeTruthy();
  });

  describe('ElasticsearchService methods', () => {

    describe('REST get_elastic_nodes()', () => {
      it('should call get_elastic_nodes()', () => {
        reset();

        service.get_elastic_nodes()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: ElasticsearchNodeClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => expect(response[key]).toEqual(MockElasticsearchNodeClass[key]));
            expect(service.get_elastic_nodes).toHaveBeenCalled();
          });

        const xhrURL: string = environment.ELASTICSEARCH_SERVICE_GET_ELASTIC_NODES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockElasticsearchNodeInterface);

        after();
      });

      it('should call get_elastic_nodes() and handle error', () => {
        reset();

        service.get_elastic_nodes()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: ElasticsearchNodeClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_elastic_nodes).toHaveBeenCalled();
            });

        const xhrURL: string = environment.ELASTICSEARCH_SERVICE_GET_ELASTIC_NODES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST post_elastic_nodes()', () => {
      it('should call post_elastic_nodes()', () => {
        reset();

        service.post_elastic_nodes(MockElasticsearchNodeReturnClass)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(() => {
            expect(service.post_elastic_nodes).toHaveBeenCalled();
          });

        const xhrURL: string = environment.ELASTICSEARCH_SERVICE_POST_ELASTIC_NODES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(null);

        after();
      });

      it('should call post_elastic_nodes() and handle error', () => {
        reset();

        service.post_elastic_nodes(MockElasticsearchNodeReturnClass)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            () => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.post_elastic_nodes).toHaveBeenCalled();
            });

        const xhrURL: string = environment.ELASTICSEARCH_SERVICE_POST_ELASTIC_NODES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_elastic_full_config()', () => {
      it('should call get_elastic_full_config()', () => {
        reset();

        service.get_elastic_full_config()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: ElasticsearchConfigurationClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => expect(response[key]).toEqual(MockElasticsearchConfigurationClass[key]));
            expect(service.get_elastic_full_config).toHaveBeenCalled();
          });

        const xhrURL: string = environment.ELASTICSEARCH_SERVICE_GET_ELASTIC_FULL_CONFIG;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockElasticsearchConfigurationInterface);

        after();
      });

      it('should call get_elastic_full_config() and handle error', () => {
        reset();

        service.get_elastic_full_config()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: ElasticsearchConfigurationClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_elastic_full_config).toHaveBeenCalled();
            });

        const xhrURL: string = environment.ELASTICSEARCH_SERVICE_GET_ELASTIC_FULL_CONFIG;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST post_elastic_full_config()', () => {
      it('should call post_elastic_full_config()', () => {
        reset();

        service.post_elastic_full_config(MockElasticsearchConfigurationClass)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(() => {
            expect(service.post_elastic_full_config).toHaveBeenCalled();
          });

        const xhrURL: string = environment.ELASTICSEARCH_SERVICE_POST_ELASTIC_FULL_CONFIG;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(null);

        after();
      });

      it('should call post_elastic_full_config() and handle error', () => {
        reset();

        service.post_elastic_full_config(MockElasticsearchConfigurationClass)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            () => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.post_elastic_full_config).toHaveBeenCalled();
            });

        const xhrURL: string = environment.ELASTICSEARCH_SERVICE_POST_ELASTIC_FULL_CONFIG;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST deploy_elastic()', () => {
      it('should call deploy_elastic()', () => {
        reset();

        service.deploy_elastic()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(() => {
            expect(service.deploy_elastic).toHaveBeenCalled();
          });

        const xhrURL: string = environment.ELASTICSEARCH_SERVICE_DEPLOY_ELASTIC;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(null);

        after();
      });

      it('should call deploy_elastic() and handle error', () => {
        reset();

        service.deploy_elastic()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            () => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.deploy_elastic).toHaveBeenCalled();
            });

        const xhrURL: string = environment.ELASTICSEARCH_SERVICE_DEPLOY_ELASTIC;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST check_elastic()', () => {
      it('should call check_elastic()', () => {
        reset();

        service.check_elastic()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: ElasticsearchCheckClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => expect(response[key]).toEqual(MockStatusReadyElasticsearchCheckClass[key]));
            expect(service.check_elastic).toHaveBeenCalled();
          });

        const xhrURL: string = environment.ELASTICSEARCH_SERVICE_CHECK_ELASTIC;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockStatusReadyElasticsearchCheckInterface);

        after();
      });

      it('should call check_elastic() and handle error', () => {
        reset();

        service.check_elastic()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: ElasticsearchCheckClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.check_elastic).toHaveBeenCalled();
            });

        const xhrURL: string = environment.ELASTICSEARCH_SERVICE_CHECK_ELASTIC;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class ElasticsearchServiceSpy implements ElasticsearchServiceInterface {

  get_elastic_nodes = jasmine.createSpy('get_elastic_nodes').and.callFake(
    (): Observable<ElasticsearchNodeClass> => this.call_fake_get_elastic_nodes()
  );

  post_elastic_nodes = jasmine.createSpy('post_elastic_nodes').and.callFake(
    (elasticsearch_node_return: ElasticsearchNodeReturnClass): Observable<void> => of(null)
  );

  get_elastic_full_config = jasmine.createSpy('get_elastic_full_config').and.callFake(
    (): Observable<ElasticsearchConfigurationClass> => this.call_fake_get_elastic_full_config()
  );

  post_elastic_full_config = jasmine.createSpy('post_elastic_full_config').and.callFake(
    (elasticsearch_configuration: ElasticsearchConfigurationClass): Observable<void> => of(null)
  );

  deploy_elastic = jasmine.createSpy('deploy_elastic').and.callFake(
    (): Observable<void> => of(null)
  );

  check_elastic = jasmine.createSpy('check_elastic').and.callFake(
    (): Observable<ElasticsearchCheckClass> => this.call_fake_check_elastic()
  );

  call_fake_get_elastic_nodes(): Observable<ElasticsearchNodeClass> {
    return observableOf(MockElasticsearchNodeClass);
  }

  call_fake_get_elastic_full_config(): Observable<ElasticsearchConfigurationClass> {
    return observableOf(MockElasticsearchConfigurationClass);
  }

  call_fake_check_elastic(): Observable<ElasticsearchCheckClass> {
    return observableOf(MockStatusReadyElasticsearchCheckClass);
  }
}
