import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockDockerRegistryClass } from '../../../../../static-data/class-objects-v3_7';
import { MockDockerRegistryInterface } from '../../../../../static-data/interface-objects-v3_7';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../services/abstract/api.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { DockerRegistryClass } from '../classes/docker-registry.class';
import { DockerRegistryServiceInterface } from '../interfaces/service-interfaces/docker-registry-service.interface';
import { DockerRegistryService } from './docker-registry.service';

describe('DockerRegistryService', () => {
  let service: DockerRegistryService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetDockerRegistry: jasmine.Spy<any>;

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
        DockerRegistryService,
        ApiService
      ]
    });

    service = TestBed.inject(DockerRegistryService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyGetDockerRegistry = spyOn(service, 'get_docker_registry').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetDockerRegistry.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create DockerRegistryService', () => {
    expect(service).toBeTruthy();
  });

  describe('DockerRegistryService methods', () => {

    describe('REST get_docker_registry()', () => {
      it('should call get_docker_registry()', () => {
        reset();

        service.get_docker_registry()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: DockerRegistryClass[]) => {
            expect(response.length).toEqual(1);

            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockDockerRegistryClass[key]);
              }
            });

            expect(service.get_docker_registry).toHaveBeenCalled();
          });

        const xhrURL: string = environment.DOCKER_REGISTRY_SERVICE_GET_DOCKER_REGISTRY;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([MockDockerRegistryInterface]);

        after();
      });

      it('should call get_docker_registry() and handle error', () => {
        reset();

        service.get_docker_registry()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: DockerRegistryClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_docker_registry).toHaveBeenCalled();
            });

        const xhrURL: string = environment.DOCKER_REGISTRY_SERVICE_GET_DOCKER_REGISTRY;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class DockerRegistryServiceSpy implements DockerRegistryServiceInterface {

  get_docker_registry = jasmine.createSpy('get_docker_registry').and.callFake(
    (): Observable<DockerRegistryClass[]> => this.call_fake_get_docker_registry()
  );

  call_fake_get_docker_registry(): Observable<DockerRegistryClass[]> {
    return observableOf([MockDockerRegistryClass]);
  }
}
