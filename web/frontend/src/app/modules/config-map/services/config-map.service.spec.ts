import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
    MockAssociatedPodClassArray,
    MockConfigMapEditClass,
    MockKubernetesConfigClass
} from '../../../../../static-data/class-objects';
import {
    MockAssociatedPodInterfaceArray,
    MockConfigMapEditInterface,
    MockConfigMapSaveInterface,
    MockKubernetesConfigInterface
} from '../../../../../static-data/interface-objects';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../services/abstract/api.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { AssociatedPodClass } from '../classes/associated-pod.class';
import { ConfigMapEditClass } from '../classes/config-map-edit.class';
import { KubernetesConfigClass } from '../classes/kubernetes-config.class';
import { ConfigMapEditInterface } from '../interfaces/config-map-edit.interface';
import { ConfigMapSaveInterface } from '../interfaces/config-map-save.interface';
import { ConfigMapServiceInterface } from '../interfaces/service-interfaces/config-map-service.interface';
import { ConfigMapService } from './config-map.service';

describe('ConfigMapService', () => {
  let service: ConfigMapService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetConfigMaps: jasmine.Spy<any>;
  let spyEditConfigMap: jasmine.Spy<any>;
  let spyGetAssociatedPods: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const get_type = 'GET';
  const put_type = 'PUT';

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
        ConfigMapService,
        ApiService
      ]
    });

    service = TestBed.inject(ConfigMapService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyGetConfigMaps = spyOn(service, 'get_config_maps').and.callThrough();
    spyEditConfigMap = spyOn(service, 'edit_config_map').and.callThrough();
    spyGetAssociatedPods = spyOn(service, 'get_associated_pods').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetConfigMaps.calls.reset();
    spyEditConfigMap.calls.reset();
    spyGetAssociatedPods.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create ConfigMapService', () => {
    expect(service).toBeTruthy();
  });

  describe('ConfigMapService methods', () => {

    describe('REST get_config_maps()', () => {
      it('should call get_config_maps()', () => {
        reset();

        service.get_config_maps()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: KubernetesConfigClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockKubernetesConfigClass[key]);
              }
            });

            expect(service.get_config_maps).toHaveBeenCalled();
          });

        const xhrURL: string = environment.CONFIG_MAP_SERVICE_GET_CONFIG_MAPS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(get_type);

        xhrRequest.flush(MockKubernetesConfigInterface);

        after();
      });

      it('should call get_config_maps() and handle error', () => {
        reset();

        service.get_config_maps()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: KubernetesConfigClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_config_maps).toHaveBeenCalled();
            });

        const xhrURL: string = environment.CONFIG_MAP_SERVICE_GET_CONFIG_MAPS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST edit_config_map()', () => {
      it('should call edit_config_map()', () => {
        reset();

        service.edit_config_map(MockConfigMapSaveInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: ConfigMapEditClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => expect(response[key]).toEqual(MockConfigMapEditClass[key]));
            expect(service.edit_config_map).toHaveBeenCalled();
          });

        const xhrURL: string = environment.CONFIG_MAP_SERVICE_BASE_URL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(put_type);

        xhrRequest.flush(MockConfigMapEditInterface);

        after();
      });

      it('should call edit_config_map() and handle error', () => {
        reset();

        service.edit_config_map(MockConfigMapSaveInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            () => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.edit_config_map).toHaveBeenCalled();
            });

        const xhrURL: string = environment.CONFIG_MAP_SERVICE_BASE_URL;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_associated_pods()', () => {
      it('should call get_associated_pods()', () => {
        reset();

        service.get_associated_pods(MockConfigMapEditClass.name)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: AssociatedPodClass[]) => {
            response.forEach((ap: AssociatedPodClass, i: number) => {
              const objectKeys: string[] = Object.keys(ap);
              objectKeys.forEach((key: string) => expect(response[i][key]).toEqual(MockAssociatedPodClassArray[i][key]));
              expect(service.get_associated_pods).toHaveBeenCalled();
            });
          });

        const xhrURL: string = `${environment.CONFIG_MAP_SERVICE_GET_ASSOCIATED_PODS}${MockConfigMapEditClass.name}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(get_type);

        xhrRequest.flush(MockAssociatedPodInterfaceArray);

        after();
      });

      it('should call get_associated_pods() and handle error', () => {
        reset();

        service.get_associated_pods(MockConfigMapEditClass.name)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: AssociatedPodClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_associated_pods).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.CONFIG_MAP_SERVICE_GET_ASSOCIATED_PODS}${MockConfigMapEditClass.name}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class ConfigMapServiceSpy implements ConfigMapServiceInterface {

  get_config_maps = jasmine.createSpy('get_config_maps').and.callFake(
    (): Observable<KubernetesConfigClass> => this.call_fake_get_config_maps()
  );

  edit_config_map = jasmine.createSpy('edit_config_map').and.callFake(
    (config_map_save: ConfigMapSaveInterface): Observable<ConfigMapEditClass> => this.call_fake_edit_config_map(config_map_save)
  );

  get_associated_pods = jasmine.createSpy('get_associated_pods').and.callFake(
    (): Observable<AssociatedPodClass[]> => this.call_fake_get_associated_pods()
  );

  call_fake_get_config_maps(): Observable<KubernetesConfigClass> {
    return observableOf(MockKubernetesConfigClass);
  }

  call_fake_edit_config_map(config_map_save: ConfigMapSaveInterface): Observable<ConfigMapEditClass> {
    const config_map_edit: ConfigMapEditInterface = {
      name: config_map_save.configMap.metadata.name
    };
    return observableOf(new ConfigMapEditClass(config_map_edit));
  }

  call_fake_get_associated_pods(): Observable<AssociatedPodClass[]> {
    return observableOf(MockAssociatedPodClassArray);
  }
}
