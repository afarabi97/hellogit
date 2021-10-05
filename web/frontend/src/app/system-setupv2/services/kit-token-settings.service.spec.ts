import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockKitTokenInterface } from '../../../../static-data/interface-objects';

import { environment } from '../../../environments/environment';
import { InjectorModule } from '../../modules/utilily-modules/injector.module';
import { ApiService } from '../../services/abstract/api.service';

import { KitTokenClass} from '../classes/kit-token.class';
import { KitTokenInterface } from '../interfaces/kit-token.interface';
import { KitTokenSettingsServiceInterface } from '../interfaces/service-interfaces/kit-token-settings-service.interface';
import { KitTokenSettingsService } from './kit-token-settings.service';

describe('KitTokenSettingsService', () => {
  let service: KitTokenSettingsService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spy_get_kit_tokens: jasmine.Spy<any>;
  let spy_create_kit_token: jasmine.Spy<any>;
  let spy_delete_kit_token: jasmine.Spy<any>;


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
        KitTokenSettingsService,
        ApiService
      ]
    });

    service = TestBed.inject(KitTokenSettingsService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spy_get_kit_tokens = spyOn(service, 'get_kit_tokens').and.callThrough();
    spy_create_kit_token = spyOn(service, 'create_kit_token').and.callThrough();
    spy_delete_kit_token = spyOn(service, 'delete_kit_token').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spy_get_kit_tokens.calls.reset();
  };

  const after = () => {
    httpMock.verify();
  };

  it('should create KitTokenSettingsService', () => {
    expect(service).toBeTruthy();
  });

  describe('KitTokenSettingsService methods', () => {
    describe('REST get_kit_tokens()', () => {
      it('should call get_kit_tokens()', () => {
        reset();

        service.get_kit_tokens()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: Array<KitTokenClass>) => {
            expect(response.length).toEqual(1);
            expect(service.get_kit_tokens).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.KIT_TOKENS_SETTINGS_SERVICE}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([MockKitTokenInterface]);

        after();
      });

      it('should call get_kit_tokens() and handle error', () => {
        reset();

        service.get_kit_tokens()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Array<KitTokenClass>) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_kit_tokens).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.KIT_TOKENS_SETTINGS_SERVICE}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST create_kit_token(<kit_token>)', () => {
      it('should call create_kit_token(<kit_token>)', () => {
        reset();

        service.create_kit_token(MockKitTokenInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: KitTokenClass) => {
            expect(service.create_kit_token).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.KIT_TOKENS_SETTINGS_SERVICE}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockKitTokenInterface, {status: 201, statusText: 'Created'});

        after();
      });

      it('should call create_kit_token(<kit_token>) and handle error', () => {
        reset();

        service.create_kit_token(MockKitTokenInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: KitTokenClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.create_kit_token).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.KIT_TOKENS_SETTINGS_SERVICE}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST delete_kit_token(<kit_token_id>)', () => {
      it('should call delete_kit_token(<kit_token_id>)', () => {
        reset();

        service.delete_kit_token(MockKitTokenInterface.kit_token_id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response) => {
            expect(service.delete_kit_token).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.KIT_TOKENS_SETTINGS_SERVICE}/${MockKitTokenInterface.kit_token_id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(deleteType);

        xhrRequest.flush(null, {status: 204, statusText: 'No Content'});

        after();
      });

      it('should call delete_kit_token(<kit_token_id>) and handle error', () => {
        reset();

        service.delete_kit_token(MockKitTokenInterface.kit_token_id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.delete_kit_token).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.KIT_TOKENS_SETTINGS_SERVICE}/${MockKitTokenInterface.kit_token_id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class KitTokenSettingsServiceSpy implements KitTokenSettingsServiceInterface {
  get_kit_tokens = jasmine.createSpy('get_kit_tokens').and.callFake((): Observable<Array<KitTokenClass>> => this.call_fake_get_kit_tokens());
  create_kit_token = jasmine.createSpy('create_kit_token').and.callFake((kit_token: KitTokenInterface): Observable<KitTokenClass> => this.call_fake_create_kit_token(kit_token));
  delete_kit_token = jasmine.createSpy('delete_kit_token').and.callFake((kit_token_id: string): Observable<null> => this.call_fake_delete_kit_token(kit_token_id));

  call_fake_get_kit_tokens(): Observable<Array<KitTokenClass>> {
    return observableOf([MockKitTokenInterface]);
  }

  call_fake_create_kit_token(kit_token: KitTokenInterface): Observable<KitTokenClass> {
    return observableOf(new KitTokenClass(kit_token));
  }

  call_fake_delete_kit_token(kit_token_id: string): Observable<null> {
    return observableOf(null);
  }
}
