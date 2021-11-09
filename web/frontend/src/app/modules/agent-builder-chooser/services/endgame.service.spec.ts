import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MockEndgameSensorProfileClasses } from '../../../../../static-data/class-objects';
import { MockEndgameSensorProfileInterfaces } from '../../../../../static-data/interface-objects';
import { environment } from '../../../../environments/environment';
import { ErrorMessageClass } from '../../../classes';
import { ApiService } from '../../../services/abstract/api.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { EndgameSensorProfileClass } from '../classes';
import { EndgameLoginInterface, EndgameServiceInterface } from '../interfaces';
import { EndgameService } from './endgame.service';

describe('EndgameService', () => {
  let service: EndgameService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyEndgameSensorProfiles: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const postType = 'POST';

  // Test Data
  const errorRequest = 'Servers are not working as expected. The request is probably valid but needs to be requested again later.';
  const errorMessageRequest = {
    error_message: 'Servers are not working as expected. The request is probably valid but needs to be requested again later.'
  };
  const mockErrorResponse = { status: 500, statusText: 'Internal Server Error' };
  const endgame_login: EndgameLoginInterface = {
    endgame_server_ip: '192.168.0.1',
    endgame_port: '443',
    endgame_user_name: 'admin',
    endgame_password: 'fakepa55word!'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        InjectorModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        EndgameService,
        ApiService
      ]
    });

    service = TestBed.inject(EndgameService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyEndgameSensorProfiles = spyOn(service, 'endgame_sensor_profiles').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyEndgameSensorProfiles.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create EndgameService', () => {
    expect(service).toBeTruthy();
  });

  describe('EndgameService methods', () => {

    describe('REST endgame_sensor_profiles()', () => {
      it('should call endgame_sensor_profiles()', () => {
        reset();

        service.endgame_sensor_profiles(endgame_login)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: EndgameSensorProfileClass[]) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => expect(response[key]).toEqual(MockEndgameSensorProfileClasses[key]));
            expect(service.endgame_sensor_profiles).toHaveBeenCalled();
          });

        const xhrURL: string = environment.ENDGAME_SERVICE_ENDGAME_SENSOR_PROFILES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockEndgameSensorProfileInterfaces);

        after();
      });

      it('should call endgame_sensor_profiles() and handle error message error', () => {
        reset();

        service.endgame_sensor_profiles(endgame_login)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: EndgameSensorProfileClass[]) => {},
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
              expect(service.endgame_sensor_profiles).toHaveBeenCalled();
            });

        const xhrURL: string = environment.ENDGAME_SERVICE_ENDGAME_SENSOR_PROFILES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call endgame_sensor_profiles() and handle error', () => {
        reset();

        service.endgame_sensor_profiles(endgame_login)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: EndgameSensorProfileClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.endgame_sensor_profiles).toHaveBeenCalled();
            });

        const xhrURL: string = environment.ENDGAME_SERVICE_ENDGAME_SENSOR_PROFILES;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });
  });
});

@Injectable()
export class EndgameServiceSpy implements EndgameServiceInterface {

  endgame_sensor_profiles = jasmine.createSpy('endgame_sensor_profiles').and.callFake(
    (endgame_login: EndgameLoginInterface): Observable<EndgameSensorProfileClass[]> => this.call_fake_endgame_sensor_profiles(endgame_login)
  );

  call_fake_endgame_sensor_profiles(endgame_login: EndgameLoginInterface): Observable<EndgameSensorProfileClass[]> {
    return of(MockEndgameSensorProfileClasses);
  }
}
