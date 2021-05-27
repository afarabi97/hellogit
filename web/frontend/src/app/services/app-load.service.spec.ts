import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { MockUserAllTrueClass } from '../../../static-data/class-objects-v3_4';
import { UserClass } from '../classes';
import { AppLoadServiceInterface } from '../interfaces';
import { TestingModule } from '../modules/testing-modules/testing.module';
import { AppLoadService } from './app-load.service';

describe('AppLoadService', () => {

  let service: AppLoadService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetCurrentUser: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TestingModule
      ],
      providers: [
        AppLoadService
      ]
    });

    service = TestBed.inject(AppLoadService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyGetCurrentUser = spyOn(service, 'getCurrentUser').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetCurrentUser.calls.reset();
  };

  it('should create AppLoadService', () => {
    expect(service).toBeTruthy();
  });

  describe('AppLoadService methods', () => {
    describe('async getCurrentUser()', () => {
      it('should call getCurrentUser()', () => {
        reset();
        service.getCurrentUser();

        expect(service.getCurrentUser).toHaveBeenCalled();
      });
    });
  });
});

@Injectable()
export class AppLoadServiceSpy implements AppLoadServiceInterface {

  getCurrentUser = jasmine.createSpy('getCurrentUser').and.callFake(
    (): Promise<UserClass> => this.callFakeGetCurrentUser()
  );

  async callFakeGetCurrentUser(): Promise<UserClass> {
    return Promise.resolve(MockUserAllTrueClass);
  }

}
